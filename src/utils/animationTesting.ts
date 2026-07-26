/**
 * animationTesting.ts
 * Development-only utilities for diagnosing the scroll animation.
 * Import and call runDiagnostics() from the browser console.
 */

import { frameCache } from './frameCache';

export async function verifyFramesExist(total = 240): Promise<{
  available: number;
  missing: number[];
}> {
  const missing: number[] = [];
  for (let i = 0; i < total; i++) {
    const n = String(i + 1).padStart(3, '0');
    const url = `/frames/ezgif-frame-${n}.jpg`;
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (!res.ok) missing.push(i);
    } catch {
      missing.push(i);
    }
  }
  return { available: total - missing.length, missing };
}

export function getMotionPreference() {
  return {
    prefersReduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  };
}

export async function runDiagnostics() {
  console.group('🎬 Animation Diagnostics');

  console.group('Cache stats');
  console.table(frameCache.getStats());
  console.log('Frames in cache:', frameCache.getCachedCount());
  console.groupEnd();

  console.group('Motion preference');
  console.log(getMotionPreference());
  console.groupEnd();

  console.group('Frame file check (first 10 frames)');
  const result = await verifyFramesExist(10);
  console.log(`Available: ${result.available}/10`);
  if (result.missing.length) console.warn('Missing:', result.missing);
  console.groupEnd();

  console.groupEnd();
}
