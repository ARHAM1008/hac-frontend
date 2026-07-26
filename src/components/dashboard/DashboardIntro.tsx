/**
 * DashboardIntro.tsx
 *
 * Fullscreen cinematic intro shown once per session after login.
 * Plays 240 JPG frames from /public/dashboard/ at ~30 FPS on an HTML5 Canvas,
 * then fades out and reveals the dashboard content underneath.
 *
 * Features:
 *  - Full-viewport canvas with cover scaling
 *  - Thin progress bar at the bottom
 *  - "Skip" button (top-right)
 *  - Framer Motion fade-out once complete
 *  - prefers-reduced-motion: skips to last frame immediately, short fade
 *  - Session-flag so intro only plays once per browser session
 */

import { useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useDashboardIntro } from '@/hooks/useDashboardIntro';

const SESSION_KEY = 'nyaya_dashboard_intro_seen';

export interface DashboardIntroProps {
  /** Called when the intro has fully faded out */
  onDone: () => void;
}

export default function DashboardIntro({ onDone }: DashboardIntroProps) {
  const shouldReduce = useReducedMotion() ?? false;

  const { canvasRef, isReady, progress, isComplete, skip } =
    useDashboardIntro(!shouldReduce);

  // If reduced motion, skip immediately on mount
  useEffect(() => {
    if (shouldReduce) {
      onDone();
    }
  }, [shouldReduce, onDone]);

  // When animation finishes, wait for fade-out then call onDone
  // (handled by onAnimationComplete on the motion.div exit)

  if (shouldReduce) return null;

  return (
    <AnimatePresence onExitComplete={onDone}>
      {!isComplete && (
        <motion.div
          key="dashboard-intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.55, ease: 'easeInOut' } }}
          className="fixed inset-0 z-[9999] bg-black"
          aria-label="Dashboard intro animation"
          aria-live="polite"
        >
          {/* ── Canvas ────────────────────────────────────────────────────── */}
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            style={{
              display: 'block',
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              backgroundColor: '#000',
            }}
          />

          {/* ── Loading pulse before frame 0 is ready ─────────────────────── */}
          {!isReady && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex gap-1.5" aria-label="Loading">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-2 w-2 rounded-full bg-white/40 animate-pulse"
                    style={{ animationDelay: `${i * 0.18}s` }}
                    aria-hidden="true"
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Skip button ────────────────────────────────────────────────── */}
          <motion.button
            type="button"
            onClick={skip}
            initial={{ opacity: 0 }}
            animate={{ opacity: isReady ? 1 : 0 }}
            transition={{ duration: 0.4, delay: 0.8 }}
            className="absolute right-6 top-6 z-10 flex items-center gap-2 rounded-full
              border border-white/20 bg-black/40 px-4 py-2 text-xs font-medium
              text-white/70 backdrop-blur-sm transition-colors
              hover:border-white/40 hover:bg-black/60 hover:text-white
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            aria-label="Skip intro"
          >
            Skip
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M2 2l4 4-4 4M7 2l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.button>

          {/* ── Progress bar ───────────────────────────────────────────────── */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10"
            aria-hidden="true"
          >
            <motion.div
              className="h-full bg-white/60"
              style={{ width: `${progress * 100}%` }}
              transition={{ ease: 'linear', duration: 0 }}
            />
          </div>

          {/* Screen reader progress announcement */}
          <span className="sr-only">
            Intro animation: {Math.round(progress * 100)}% complete
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Session flag helpers ──────────────────────────────────────────────────────

export function hasDashboardIntroPlayed(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function markDashboardIntroPlayed(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, '1');
  } catch { /* sessionStorage unavailable */ }
}
