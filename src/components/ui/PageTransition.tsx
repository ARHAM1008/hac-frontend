/**
 * PageTransition.tsx
 *
 * Wraps a page's root element in a Framer Motion fade + slide animation.
 * Drop this around the outermost JSX in any page component to get consistent
 * route-enter / route-exit transitions.
 *
 * Usage:
 *   export default function LoginPage() {
 *     return (
 *       <PageTransition>
 *         <div>...</div>
 *       </PageTransition>
 *     );
 *   }
 *
 * DashboardLayout pairs this with <AnimatePresence mode="wait" key={pathname}>
 * so the exit animation completes before the entering page mounts.
 */

import { type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

const variants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.18, ease: 'easeIn' },
  },
};

// No-motion fallback — just renders children with no visual movement
const noMotionVariants = {
  initial: { opacity: 1, y: 0 },
  animate: { opacity: 1, y: 0, transition: { duration: 0 } },
  exit:    { opacity: 1, y: 0, transition: { duration: 0 } },
};

export default function PageTransition({ children, className }: PageTransitionProps) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={shouldReduce ? noMotionVariants : variants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}
