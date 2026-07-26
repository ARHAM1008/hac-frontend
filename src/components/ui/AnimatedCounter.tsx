/**
 * AnimatedCounter.tsx
 *
 * Animates a number from 0 → target using Framer Motion springs.
 * On mount, starts a spring toward the target value.
 * Displays a rounded integer at all times.
 *
 * Respects prefers-reduced-motion — shows target immediately if enabled.
 *
 * Usage:
 *   <AnimatedCounter target={docs.length} />
 */

import { useEffect } from 'react';
import { useMotionValue, useSpring, useTransform, motion, useReducedMotion } from 'framer-motion';

interface AnimatedCounterProps {
  target: number;
  /** Spring duration feel. stiffness+damping control the curve. */
  stiffness?: number;
  damping?: number;
  className?: string;
}

export default function AnimatedCounter({
  target,
  stiffness = 75,
  damping = 18,
  className,
}: AnimatedCounterProps) {
  const shouldReduce = useReducedMotion();

  const raw = useMotionValue(shouldReduce ? target : 0);
  const spring = useSpring(raw, { stiffness, damping });
  const display = useTransform(spring, (v) => Math.round(v).toString());

  useEffect(() => {
    if (!shouldReduce) {
      raw.set(target);
    }
  }, [target, raw, shouldReduce]);

  if (shouldReduce) {
    return <span className={className}>{target}</span>;
  }

  return <motion.span className={className}>{display}</motion.span>;
}
