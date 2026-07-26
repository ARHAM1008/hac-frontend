/**
 * useDashboardIntro.ts
 *
 * Drives the post-login dashboard intro animation.
 * Plays 240 frames at ~30 FPS using requestAnimationFrame.
 * Preloads aggressively (all frames, background) since this is a one-shot
 * cinematic — we want zero stutter once playback starts.
 *
 * Returns:
 *  - canvasRef       — attach to <canvas>
 *  - isReady         — true once frame 0 is loaded (canvas can paint)
 *  - progress        — 0..1 playback progress (drives progress bar)
 *  - isComplete      — true when last frame is reached
 *  - skip            — call to jump immediately to end
 */

import {
  useRef,
  useEffect,
  useCallback,
  useState,
} from 'react';
import { cacheDashboardBgFrame } from '@/hooks/useDashboardBackground';

const TOTAL_FRAMES = 240;
const TARGET_FPS   = 30;
const FRAME_MS     = 1000 / TARGET_FPS;

// ── URL builder ───────────────────────────────────────────────────────────────

function frameUrl(index: number): string {
  const n = String(index + 1).padStart(3, '0');
  return `/dashboard/ezgif-frame-${n}.jpg`;
}

// ── Preloader ─────────────────────────────────────────────────────────────────

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload  = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed: ${url}`));
    img.src = url;
  });
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export interface DashboardIntroState {
  canvasRef:   React.RefObject<HTMLCanvasElement | null>;
  isReady:     boolean;
  progress:    number;
  isComplete:  boolean;
  skip:        () => void;
}

export function useDashboardIntro(enabled: boolean): DashboardIntroState {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const framesRef    = useRef<(HTMLImageElement | null)[]>(
    Array.from({ length: TOTAL_FRAMES }, () => null),
  );
  const currentFrame = useRef(0);
  const rafRef       = useRef<number | null>(null);
  const lastTimeRef  = useRef<number>(0);
  const doneRef      = useRef(false);

  const [isReady,    setIsReady]    = useState(false);
  const [progress,   setProgress]   = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // ── Draw a frame onto the canvas ──────────────────────────────────────────

  const drawFrame = useCallback((img: HTMLImageElement | null) => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const lw  = canvas.width  / dpr;
    const lh  = canvas.height / dpr;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, lw, lh);

    if (img.width > 0 && img.height > 0) {
      // Cover scaling — no distortion
      const ir = img.width / img.height;
      const cr = lw / lh;
      let sw = lw, sh = lh, sx = 0, sy = 0;
      if (ir > cr) { sw = lh * ir; sx = (lw - sw) / 2; }
      else          { sh = lw / ir; sy = (lh - sh) / 2; }
      ctx.drawImage(img, sx, sy, sw, sh);

      // Subtle vignette
      const g = ctx.createRadialGradient(lw/2, lh/2, 0, lw/2, lh/2, Math.hypot(lw, lh)/2);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(1, 'rgba(0,0,0,0.22)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, lw, lh);
    }

    ctx.restore();
  }, []);

  // ── Resize canvas to fill viewport at device pixel ratio ─────────────────

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width  = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width  = `${w}px`;
    canvas.style.height = `${h}px`;
  }, []);

  // ── RAF playback loop ─────────────────────────────────────────────────────

  const animate = useCallback((timestamp: number) => {
    if (doneRef.current) return;

    if (timestamp - lastTimeRef.current >= FRAME_MS) {
      lastTimeRef.current = timestamp;
      const idx = currentFrame.current;
      drawFrame(framesRef.current[idx]);
      setProgress(idx / (TOTAL_FRAMES - 1));

      if (idx >= TOTAL_FRAMES - 1) {
        doneRef.current = true;
        setIsComplete(true);
        setProgress(1);
        return;
      }
      currentFrame.current = idx + 1;
    }

    rafRef.current = requestAnimationFrame(animate);
  }, [drawFrame]);

  // ── Skip — jump to last frame immediately ─────────────────────────────────

  const skip = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    const last = framesRef.current[TOTAL_FRAMES - 1];
    if (last) drawFrame(last);
    setProgress(1);
    setIsComplete(true);
  }, [drawFrame]);

  // ── Mount: resize, load frame 0, then start preloading rest ──────────────

  useEffect(() => {
    if (!enabled) return;

    resizeCanvas();

    let cancelled = false;

    const boot = async () => {
      // Load frame 0 first so canvas isn't blank
      try {
        const first = await loadImage(frameUrl(0));
        if (cancelled) return;
        framesRef.current[0] = first;
        cacheDashboardBgFrame(0, first); // share with bg loop
        resizeCanvas();
        drawFrame(first);
        setIsReady(true);

        // Start playback
        lastTimeRef.current = 0;
        rafRef.current = requestAnimationFrame(animate);

        // Preload the rest in the background (in order, staggered)
        for (let i = 1; i < TOTAL_FRAMES; i++) {
          if (cancelled) break;
          const idx = i;
          // Small delay so first-frame paint isn't blocked
          setTimeout(() => {
            if (cancelled || framesRef.current[idx]) return;
            loadImage(frameUrl(idx))
              .then((img) => {
                framesRef.current[idx] = img;
                cacheDashboardBgFrame(idx, img); // share with bg loop
              })
              .catch(() => { /* frame failed — playback will show null */ });
          }, idx * 10);  // stagger 10 ms apart → all loaded in ~2.4 s
        }
      } catch {
        // Frame 0 failed — skip intro entirely
        if (!cancelled) {
          setIsComplete(true);
          setProgress(1);
        }
      }
    };

    void boot();

    const onResize = () => {
      resizeCanvas();
      // Redraw current frame after resize
      const cur = framesRef.current[currentFrame.current];
      if (cur) drawFrame(cur);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelled = true;
      window.removeEventListener('resize', onResize);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, animate, drawFrame, resizeCanvas]);

  return { canvasRef, isReady, progress, isComplete, skip };
}
