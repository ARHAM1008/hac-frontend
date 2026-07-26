/**
 * PremiumButton.tsx
 *
 * A reusable Apple/Linear-style button with:
 *  - Glassmorphism background + gradient
 *  - Framer Motion spring hover (translateY + scale)
 *  - Active press animation
 *  - JS ripple effect from pointer-down origin
 *  - Animated glow border on hover
 *  - prefers-reduced-motion safe
 *
 * Renders as <a> when `href` is provided, <button> otherwise.
 */

import { useRef, useCallback, type ReactNode, type PointerEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PremiumButtonProps {
  variant?: 'primary' | 'ghost';
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  'aria-label'?: string;
}

// ─── Motion variants ──────────────────────────────────────────────────────────

const primaryVariants = {
  rest:  { scale: 1, y: 0 },
  hover: { scale: 1.05, y: -3 },
  tap:   { scale: 0.97, y: 0 },
};

const ghostVariants = {
  rest:  { scale: 1, y: 0 },
  hover: { scale: 1.03, y: -2 },
  tap:   { scale: 0.97, y: 0 },
};

const spring = { type: 'spring' as const, stiffness: 400, damping: 22 };

// ─── Glow overlay — absolutely positioned, animates opacity on hover ──────────

function GlowOverlay({ variant }: { variant: 'primary' | 'ghost' }) {
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-full"
      initial={{ opacity: 0 }}
      variants={{
        rest:  { opacity: 0 },
        hover: { opacity: 1 },
      }}
      style={{
        background:
          variant === 'primary'
            ? 'radial-gradient(ellipse at 50% 0%, rgba(77,163,255,0.28) 0%, transparent 70%)'
            : 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.10) 0%, transparent 70%)',
      }}
    />
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PremiumButton({
  variant = 'primary',
  children,
  href,
  onClick,
  className = '',
  disabled = false,
  type = 'button',
  'aria-label': ariaLabel,
}: PremiumButtonProps) {
  const containerRef = useRef<HTMLElement>(null);
  const shouldReduce = useReducedMotion();

  // ── Ripple ──────────────────────────────────────────────────────────────────
  const handlePointerDown = useCallback((e: PointerEvent<HTMLElement>) => {
    if (shouldReduce || disabled) return;
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const diameter = Math.max(rect.width, rect.height) * 1.6;

    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';
    ripple.style.cssText = `
      width: ${diameter}px;
      height: ${diameter}px;
      left: ${x - diameter / 2}px;
      top: ${y - diameter / 2}px;
    `;
    el.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  }, [shouldReduce, disabled]);

  // ── Shared style props ──────────────────────────────────────────────────────
  const isPrimary = variant === 'primary';
  const variants  = isPrimary ? primaryVariants : ghostVariants;

  const baseStyle: React.CSSProperties = isPrimary
    ? {
        background: 'linear-gradient(135deg, rgba(77,163,255,0.18) 0%, rgba(139,124,255,0.14) 100%)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(77,163,255,0.35)',
        color: '#ffffff',
        boxShadow: '0 4px 24px rgba(77,163,255,0.18), 0 1px 2px rgba(0,0,0,0.28)',
      }
    : {
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.16)',
        color: '#F1F4FA',
        boxShadow: '0 1px 8px rgba(0,0,0,0.18)',
      };

  const hoverStyle: React.CSSProperties = isPrimary
    ? { boxShadow: '0 8px 32px rgba(77,163,255,0.38), 0 2px 8px rgba(0,0,0,0.3)', border: '1px solid rgba(77,163,255,0.65)' }
    : { boxShadow: '0 4px 20px rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.32)' };

  const sharedClassName = `premium-btn-base ${className}${disabled ? ' opacity-50 cursor-not-allowed' : ''}`;

  const motionProps = shouldReduce
    ? {}
    : {
        variants,
        initial: 'rest',
        whileHover: disabled ? undefined : 'hover',
        whileTap: disabled ? undefined : 'tap',
        transition: spring,
      };

  // ── Shadow transition on hover via whileHover style ────────────────────────
  // We use a CSS transition for box-shadow because Framer Motion doesn't
  // animate box-shadow well — transition it with CSS instead.
  const combinedStyle: React.CSSProperties = {
    ...baseStyle,
    transition: 'box-shadow 0.22s ease, border-color 0.22s ease',
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  const inner = (
    <>
      <GlowOverlay variant={variant} />
      {children}
    </>
  );

  if (href) {
    return (
      <motion.a
        ref={containerRef as React.Ref<HTMLAnchorElement>}
        href={href}
        aria-label={ariaLabel}
        className={sharedClassName}
        style={combinedStyle}
        onPointerDown={handlePointerDown}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          Object.assign(el.style, hoverStyle);
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          Object.assign(el.style, baseStyle);
        }}
        {...motionProps}
      >
        {inner}
      </motion.a>
    );
  }

  return (
    <motion.button
      ref={containerRef as React.Ref<HTMLButtonElement>}
      type={type}
      aria-label={ariaLabel}
      disabled={disabled}
      className={sharedClassName}
      style={combinedStyle}
      onClick={onClick}
      onPointerDown={handlePointerDown}
      onMouseEnter={(e) => {
        if (disabled) return;
        const el = e.currentTarget;
        Object.assign(el.style, hoverStyle);
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        Object.assign(el.style, baseStyle);
      }}
      {...motionProps}
    >
      {inner}
    </motion.button>
  );
}
