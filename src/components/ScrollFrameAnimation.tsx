/**
 * ScrollFrameAnimation.tsx
 *
 * Architecture:
 *  ┌─ wrapperRef (position: relative, height = animationHeight vh) ──────────┐
 *  │  ┌─ stickyRef (position: sticky, top: 0, height: 100vh) ──────────────┐ │
 *  │  │   <canvas>  ← draws frames here                                    │ │
 *  │  │   {children} ← hero text overlay, z-index above canvas             │ │
 *  │  └────────────────────────────────────────────────────────────────────┘ │
 *  └────────────────────────────────────────────────────────────────────────┘
 *
 * Scroll progress = (scrollY - wrapperTop) / (wrapperHeight - 100vh)
 * This is the standard Apple-style scroll-scrub technique.
 */

import {
  useRef,
  useEffect,
  useCallback,
  useState,
  type ReactNode,
} from 'react';
import { useFrameLoader } from '@/hooks/useFrameLoader';

export interface ScrollFrameAnimationProps {
  /** Total number of frames (default 240) */
  totalFrames?: number;
  /**
   * Total height of the scroll container as a multiple of 100vh.
   * e.g. 5 means the user scrolls through 5 screen-heights to see all frames.
   * Default: 5
   */
  scrollMultiplier?: number;
  /** Content to render on top of the canvas (hero text, buttons…) */
  children?: ReactNode;
  onAnimationComplete?: () => void;
}

const TOTAL_FRAMES = 240;
const SCROLL_MULTIPLIER = 5; // 500 vh total  →  100 vh sticky + 400 vh scroll

export default function ScrollFrameAnimation({
  totalFrames = TOTAL_FRAMES,
  scrollMultiplier = SCROLL_MULTIPLIER,
  children,
  onAnimationComplete,
}: ScrollFrameAnimationProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const lastFrameIndexRef = useRef(-1);
  const rafRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  const [prefersReduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const { firstFrameReady, getFrame, advanceTo } = useFrameLoader({
    totalFrames,
    preloadRadius: 15,
  });

  // ─── Canvas sizing ──────────────────────────────────────────────────────────

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    // Set physical pixel size
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    // Keep CSS size = logical pixels
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
  }, []);

  // ─── Draw a single frame ────────────────────────────────────────────────────

  const drawFrame = useCallback(async (index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = await getFrame(index);
    const dpr = window.devicePixelRatio || 1;
    // Logical dimensions (what we draw in)
    const lw = canvas.width / dpr;
    const lh = canvas.height / dpr;

    ctx.save();
    ctx.scale(dpr, dpr);

    // Black fallback
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, lw, lh);

    if (img && img.width > 0 && img.height > 0) {
      // "cover" scaling — no distortion
      const imgAspect = img.width / img.height;
      const canvasAspect = lw / lh;

      let sw = lw, sh = lh, sx = 0, sy = 0;
      if (imgAspect > canvasAspect) {
        // Image wider than canvas — fit height, crop sides
        sw = lh * imgAspect;
        sx = (lw - sw) / 2;
      } else {
        // Image taller than canvas — fit width, crop top/bottom
        sh = lw / imgAspect;
        sy = (lh - sh) / 2;
      }

      ctx.drawImage(img, sx, sy, sw, sh);

      // Subtle vignette
      const grad = ctx.createRadialGradient(lw / 2, lh / 2, 0, lw / 2, lh / 2, Math.hypot(lw, lh) / 2);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,0.18)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, lw, lh);
    }

    ctx.restore();
  }, [getFrame]);

  // ─── Scroll handler ─────────────────────────────────────────────────────────

  const handleScroll = useCallback(() => {
    if (prefersReduced) return;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const wrapperTop = wrapper.getBoundingClientRect().top + window.scrollY;
    const scrollable = wrapper.offsetHeight - window.innerHeight;
    const scrolled = Math.max(0, window.scrollY - wrapperTop);
    const progress = scrollable > 0 ? Math.min(1, scrolled / scrollable) : 0;

    const index = Math.min(
      Math.round(progress * (totalFrames - 1)),
      totalFrames - 1
    );

    if (index === lastFrameIndexRef.current) return;
    lastFrameIndexRef.current = index;
    advanceTo(index);
    drawFrame(index);

    if (index === totalFrames - 1 && !completedRef.current) {
      completedRef.current = true;
      onAnimationComplete?.();
    }
  }, [prefersReduced, totalFrames, advanceTo, drawFrame, onAnimationComplete]);

  // ─── Mount / unmount ────────────────────────────────────────────────────────

  useEffect(() => {
    resizeCanvas();
  }, [resizeCanvas]);

  // Draw frame 0 as soon as it is ready
  useEffect(() => {
    if (firstFrameReady) {
      if (prefersReduced) {
        drawFrame(0);
      } else {
        drawFrame(0);
        handleScroll(); // Sync to current scroll position immediately
      }
    }
  }, [firstFrameReady, prefersReduced, drawFrame, handleScroll]);

  useEffect(() => {
    if (prefersReduced) return;

    let scheduled = false;
    const onScroll = () => {
      if (scheduled) return;
      scheduled = true;
      rafRef.current = requestAnimationFrame(() => {
        handleScroll();
        scheduled = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    const ro = new ResizeObserver(() => {
      resizeCanvas();
      // Re-draw current frame after resize
      if (lastFrameIndexRef.current >= 0) {
        drawFrame(lastFrameIndexRef.current);
      }
    });
    if (wrapperRef.current) ro.observe(wrapperRef.current);

    return () => {
      window.removeEventListener('scroll', onScroll);
      ro.disconnect();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [prefersReduced, handleScroll, resizeCanvas, drawFrame]);

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    /*
     * wrapperRef: tall block that gives the page its scroll height.
     * The inner sticky div pins to the top and shows the canvas + overlay.
     */
    <div
      ref={wrapperRef}
      style={{ height: `${scrollMultiplier * 100}vh`, position: 'relative' }}
    >
      {/* Sticky viewport — stays visible while the wrapper scrolls past */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          width: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Canvas — sits behind everything */}
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'block',
            backgroundColor: '#000',
          }}
        />

        {/* Loading spinner — shown until frame 0 is ready */}
        {!firstFrameReady && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.7)',
            }}
          >
            <div className="text-center">
              <div
                role="status"
                aria-label="Loading animation"
                className="mb-4 inline-flex h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent"
              />
              <p className="text-white/70 text-sm">Loading…</p>
            </div>
          </div>
        )}

        {/* Hero text / overlay — sits above the canvas */}
        <div style={{ position: 'relative', zIndex: 10, height: '100%' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
