/**
 * frameCache.ts
 * LRU image cache for scroll-driven frame animation.
 * Frames are named: ezgif-frame-001.jpg … ezgif-frame-240.jpg
 */

interface CacheEntry {
  image: HTMLImageElement;
  lastAccessed: number;
}

export interface CacheStats {
  loadedFrames: number;
  failedFrames: number;
}

class FrameCache {
  private cache = new Map<number, CacheEntry>();
  private failed = new Set<number>();
  private stats: CacheStats = { loadedFrames: 0, failedFrames: 0 };
  /** Keep at most this many decoded images in memory */
  private maxEntries: number;

  constructor(maxEntries = 60) {
    this.maxEntries = maxEntries;
  }

  /** Build the public URL for a 0-based frame index */
  private url(index: number): string {
    const n = String(index + 1).padStart(3, '0');
    return `/frames/ezgif-frame-${n}.jpg`;
  }

  /** Load one image, resolve with the element or reject on error */
  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`404: ${url}`));
      img.src = url;
    });
  }

  /** Evict least-recently-used entry when over capacity */
  private evictIfNeeded(): void {
    if (this.cache.size < this.maxEntries) return;
    let oldest = Infinity;
    let lruKey = -1;
    for (const [k, v] of this.cache) {
      if (v.lastAccessed < oldest) {
        oldest = v.lastAccessed;
        lruKey = k;
      }
    }
    if (lruKey >= 0) this.cache.delete(lruKey);
  }

  /** Return cached image synchronously, or null if not loaded yet */
  getFrame(index: number): HTMLImageElement | null {
    const entry = this.cache.get(index);
    if (!entry) return null;
    entry.lastAccessed = Date.now();
    return entry.image;
  }

  /** Load frame (or return from cache). Returns null on failure. */
  async loadFrame(index: number): Promise<HTMLImageElement | null> {
    // Already cached
    const cached = this.getFrame(index);
    if (cached) return cached;

    // Already failed — don't retry
    if (this.failed.has(index)) return null;

    try {
      const image = await this.loadImage(this.url(index));
      this.evictIfNeeded();
      this.cache.set(index, { image, lastAccessed: Date.now() });
      this.stats.loadedFrames++;
      return image;
    } catch {
      this.failed.add(index);
      this.stats.failedFrames++;
      return null;
    }
  }

  /**
   * Fire-and-forget preload of frames in a window around `current`.
   * Uses requestIdleCallback where available so it never blocks the main thread.
   */
  preloadAround(current: number, total: number, radius = 12): void {
    for (let i = Math.max(0, current - radius); i <= Math.min(total - 1, current + radius); i++) {
      if (this.cache.has(i) || this.failed.has(i)) continue;
      const idx = i;
      if (typeof (window as Window & { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback === 'function') {
        (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(() => { this.loadFrame(idx); });
      } else {
        setTimeout(() => { this.loadFrame(idx); }, 0);
      }
    }
  }

  getCachedCount(): number { return this.cache.size; }
  getStats(): CacheStats { return { ...this.stats }; }
  clear(): void { this.cache.clear(); this.failed.clear(); }
}

export const frameCache = new FrameCache(60);
