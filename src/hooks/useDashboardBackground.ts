/**
 * useDashboardBackground.ts
 *
 * Drives the continuous looping frame animation used as the dashboard
 * background after the intro completes.
 *
 * Strategy:
 *  - Plays frames 0 → 239 → 0 → … in a ping-pong loop at ~12 FPS
 *    (slow enough to feel ambient, light enough for CPU)
 *  - Reuses the same decoded images loaded during the intro via a shared
 *    module-level cache so we never download the JPGs twice
 *  - Canvas is sized to the container element (not the full viewport)
 *    so it tiles correctly inside the layout column
 *  - Draws with heavy dark overlay so dashboard content stays readable
 *  - Pauses when the tab is hidden (visibilitychange)
 *  - Fully cleaned up on unmount (RAF cancelled, resize observer disconnected)
 */

import { useRef, useEffect, useCallback } from 'react';

// ── Shared image cache (module-level, survives re-renders) ────────────────────
// Populated by useDashboardIntro during the intro; populated lazily here if
// the user already saw the intro in a previous session.

const imageCache = new Map<number, HTMLImageElement>();

const TOTAL_FRAMES = 240;
const BG_FPS       = 12;
const FRAME_MS     = 1000 / BG_FPS;

function frameUrl(index: number): string {
  const n = String(index + 1).padStart(3, '0');
  return `/dashboard/ezgif-frame-${n}.jpg`;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload  = () => resolve(img);
    img.onerror = () => reject(new Error(`bg frame failed: ${url}`));
    img.src = url;
  });
}

/** Pre-warm the cache for all frames (fire-and-forget) */
export function prewarmDashboardBgCache(): void {
  for (let i = 0; i < TOTAL_FRAMES; i++) {
    if (imageCache.has(i)) continue;
    const idx = i;
    setTimeout(() => {
      if (imageCache.has(idx)) return;
      loadImage(frameUrl(idx))
        .then((img) => imageCache.set(idx, img))
        .catch(() => { /* ignore individual failures */ });
    }, idx * 8); // stagger 8 ms → all cached in ~1.9 s
  }
}

/** Called by DashboardIntro when it has loaded a frame — avoids double-download */
export function cacheDashboardBgFrame(index: number, img: HTMLImageElement): void {
  imageCache.set(index, img);
}

// ── Hook ──────────────────────────────────────────────────────────────────────

interface Options {
  /** Set false to disable (prefers-reduced-motion / hidden tab) */
  enabled: boolean;
  /**
   * Opacity of the dark overlay drawn on top of every frame.
   * 0 = no overlay (raw frame). 0.82 = heavily darkened (default).
   */
  overlayOpacity?: number;
}

export function useDashboardBackground(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  options: Options,
): void {
  const { enabled, overlayOpacity = 0.82 } = options;

  const rafRef      = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const frameIdxRef = useRef<number>(0);
  const dirRef      = useRef<1 | -1>(1); // ping-pong direction

  // ── Draw ─────────────────────────────────────────────────────────────────

  const drawFrame = useCallback(
    (img: HTMLImageElement) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const lw  = canvas.width  / dpr;
      const lh  = canvas.height / dpr;

      ctx.save();
      ctx.scale(dpr, dpr);

      // Cover-scale the frame
      const ir = img.width / img.height;
      const cr = lw / lh;
      let sw = lw, sh = lh, sx = 0, sy = 0;
      if (ir > cr) { sw = lh * ir; sx = (lw - sw) / 2; }
      else          { sh = lw / ir; sy = (lh - sh) / 2; }
      ctx.drawImage(img, sx, sy, sw, sh);

      // Dark overlay so dashboard text remains readable
      ctx.fillStyle = `rgba(7,11,24,${overlayOpacity})`;
      ctx.fillRect(0, 0, lw, lh);

      ctx.restore();
    },
    [canvasRef, overlayOpacity],
  );

  // ── Resize canvas to match its CSS size ──────────────────────────────────

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr    = window.devicePixelRatio || 1;
    const parent = canvas.parentElement;
    const w = parent ? parent.offsetWidth  : window.innerWidth;
    const h = parent ? parent.offsetHeight : window.innerHeight;
    if (canvas.width  !== Math.round(w * dpr) ||
        canvas.height !== Math.round(h * dpr)) {
      canvas.width        = Math.round(w * dpr);
      canvas.height       = Math.round(h * dpr);
      canvas.style.width  = `${w}px`;
      canvas.style.height = `${h}px`;
    }
  }, [canvasRef]);

  // ── RAF loop ──────────────────────────────────────────────────────────────

  const loop = useCallback(
    (timestamp: number) => {
      if (!enabled) return;

      if (timestamp - lastTimeRef.current >= FRAME_MS) {
        lastTimeRef.current = timestamp;

        const img = imageCache.get(frameIdxRef.current);
        if (img) {
          resizeCanvas();
          drawFrame(img);
        }

        // Advance with ping-pong
        frameIdxRef.current += dirRef.current;
        if (frameIdxRef.current >= TOTAL_FRAMES - 1) {
          frameIdxRef.current = TOTAL_FRAMES - 1;
          dirRef.current = -1;
        } else if (frameIdxRef.current <= 0) {
          frameIdxRef.current = 0;
          dirRef.current = 1;
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    },
    [enabled, drawFrame, resizeCanvas],
  );

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!enabled) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    // Start with whatever frame the intro ended on (or 0)
    resizeCanvas();
    rafRef.current = requestAnimationFrame(loop);

    // Pause when tab is hidden
    const onVisibility = () => {
      if (document.hidden) {
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      } else {
        lastTimeRef.current = 0;
        rafRef.current = requestAnimationFrame(loop);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    // Resize observer on parent
    const ro = new ResizeObserver(() => {
      resizeCanvas();
      const img = imageCache.get(frameIdxRef.current);
      if (img) drawFrame(img);
    });
    const canvas = canvasRef.current;
    if (canvas?.parentElement) ro.observe(canvas.parentElement);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      ro.disconnect();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [enabled, loop, resizeCanvas, drawFrame, canvasRef]);
}
