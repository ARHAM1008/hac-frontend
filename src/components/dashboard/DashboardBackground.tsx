/**
 * DashboardBackground.tsx
 *
 * Renders the looping frame animation as a fixed background layer behind
 * the entire dashboard. The cinematic "floating legal documents" frames
 * from /public/dashboard/ play in a slow ping-pong loop at 12 FPS.
 *
 * A heavy dark overlay (opacity ~0.82) is drawn on top of each frame so
 * all dashboard text, cards, and UI elements remain fully legible.
 *
 * The canvas is position:fixed so it covers the whole viewport regardless
 * of the scrollable content above it.
 *
 * Props:
 *  active  — start/stop the loop (set false while intro is playing)
 */

import { useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useDashboardBackground } from '@/hooks/useDashboardBackground';

interface Props {
  active: boolean;
}

export default function DashboardBackground({ active }: Props) {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const shouldReduce = useReducedMotion() ?? false;

  useDashboardBackground(canvasRef, {
    enabled: active && !shouldReduce,
    overlayOpacity: 0.82,
  });

  if (shouldReduce) {
    // Reduced motion: just show the solid void colour
    return (
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 bg-void pointer-events-none"
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        display: 'block',
        width: '100vw',
        height: '100vh',
        backgroundColor: '#070B18', // void — visible before first frame loads
        pointerEvents: 'none',
      }}
    />
  );
}
