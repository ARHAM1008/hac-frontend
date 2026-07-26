/**
 * useFrameLoader.ts
 * Loads the first frame eagerly so the canvas can paint before any scroll,
 * then keeps preloading ahead of the current scroll position.
 */

import { useEffect, useState, useCallback } from 'react';
import { frameCache } from '@/utils/frameCache';

interface Options {
  totalFrames: number;
  preloadRadius?: number;
}

export function useFrameLoader({ totalFrames, preloadRadius = 12 }: Options) {
  const [firstFrameReady, setFirstFrameReady] = useState(false);

  // Load frame 0 immediately on mount so the canvas isn't blank.
  useEffect(() => {
    let cancelled = false;
    frameCache.loadFrame(0).then((img) => {
      if (!cancelled && img) setFirstFrameReady(true);
    });
    // Also kick off a wider initial preload (frames 0–20)
    for (let i = 1; i <= Math.min(20, totalFrames - 1); i++) {
      const idx = i;
      setTimeout(() => frameCache.loadFrame(idx), idx * 30);
    }
    return () => { cancelled = true; };
  }, [totalFrames]);

  // Whenever the current frame changes, preload the neighbourhood.
  const advanceTo = useCallback((index: number) => {
    frameCache.preloadAround(index, totalFrames, preloadRadius);
  }, [totalFrames, preloadRadius]);

  /** Get the image for a frame index, loading on demand if needed. */
  const getFrame = useCallback(async (index: number): Promise<HTMLImageElement | null> => {
    const clamped = Math.max(0, Math.min(index, totalFrames - 1));
    // Synchronous fast-path
    const cached = frameCache.getFrame(clamped);
    if (cached) return cached;
    // Async load
    return frameCache.loadFrame(clamped);
  }, [totalFrames]);

  return { firstFrameReady, getFrame, advanceTo };
}
