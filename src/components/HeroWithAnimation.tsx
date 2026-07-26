/**
 * HeroWithAnimation.tsx
 * Hero section content rendered as a child of ScrollFrameAnimation so it sits
 * inside the sticky viewport, on top of the canvas.
 *
 * Upgrades:
 *  - Premium CTA buttons (PremiumButton) replacing the plain .btn-primary / .btn-ghost links
 *  - Mouse-tracking parallax on ambient floating icons (spring-smoothed)
 *  - prefers-reduced-motion safe (parallax disabled when reduced motion is on)
 */

import { useCallback, type ElementType } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from 'framer-motion';
import { Search, FileText, Landmark, Gavel, Mic } from 'lucide-react';
import CitationDemo from './CitationDemo';
import ScrollFrameAnimation from './ScrollFrameAnimation';
import PremiumButton from './ui/PremiumButton';

// ─── Per-icon parallax component ─────────────────────────────────────────────
// Extracted so useTransform is called at the top level of a component,
// not inside a .map() callback — satisfies the rules-of-hooks.

interface ParallaxIconProps {
  Icon: ElementType;
  className: string;
  delay: number;
  parallaxFactor: number;
  smoothX: MotionValue<number>;
  smoothY: MotionValue<number>;
  reduced: boolean;
}

function ParallaxIcon({
  Icon,
  className,
  delay,
  parallaxFactor,
  smoothX,
  smoothY,
  reduced,
}: ParallaxIconProps) {
  const iconX = useTransform(smoothX, (v) => v * parallaxFactor);
  const iconY = useTransform(smoothY, (v) => v * parallaxFactor);

  return (
    <motion.div
      className={`absolute ${className} animate-float-slow opacity-10`}
      style={reduced ? {} : { x: iconX, y: iconY }}
      aria-hidden="true"
    >
      <div style={{ animationDelay: `${delay}s` }}>
        <Icon size={40} className="text-neon" />
      </div>
    </motion.div>
  );
}

// ─── Icon config ──────────────────────────────────────────────────────────────

const FLOATING_ICONS = [
  { Icon: FileText, className: 'left-[8%]  top-[20%]',     delay: 0,   parallaxFactor: 0.022 },
  { Icon: Landmark, className: 'right-[10%] top-[12%]',    delay: 1.2, parallaxFactor: 0.035 },
  { Icon: Gavel,    className: 'left-[15%]  bottom-[18%]', delay: 0.6, parallaxFactor: 0.018 },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  onAnimationComplete?: () => void;
}

export default function HeroWithAnimation({ onAnimationComplete }: Props) {
  const shouldReduce = useReducedMotion() ?? false;

  // Raw mouse position (pixels from section centre)
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  // Spring-smooth so icons lag behind the cursor for a natural feel
  const smoothX = useSpring(rawX, { stiffness: 80, damping: 25 });
  const smoothY = useSpring(rawY, { stiffness: 80, damping: 25 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (shouldReduce) return;
      const rect = e.currentTarget.getBoundingClientRect();
      rawX.set(e.clientX - rect.left - rect.width  / 2);
      rawY.set(e.clientY - rect.top  - rect.height / 2);
    },
    [rawX, rawY, shouldReduce],
  );

  const handleMouseLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  return (
    <ScrollFrameAnimation
      totalFrames={240}
      scrollMultiplier={5}
      onAnimationComplete={onAnimationComplete}
    >
      {/* ── Overlay content ─────────────────────────────────────────────────── */}
      <section
        aria-label="Hero section"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative flex h-full items-center justify-center overflow-hidden px-6 pb-24 pt-16 md:pt-24"
      >
        {/* Dark gradient so text is readable over any frame */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"
        />

        {/* ── Ambient floating icons with parallax ─────────────────────────── */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden md:block">
          {FLOATING_ICONS.map((cfg, i) => (
            <ParallaxIcon
              key={i}
              {...cfg}
              smoothX={smoothX}
              smoothY={smoothY}
              reduced={shouldReduce}
            />
          ))}
        </div>

        {/* ── Main content grid ────────────────────────────────────────────── */}
        <div className="relative mx-auto grid max-w-7xl w-full items-center gap-16 lg:grid-cols-2">

          {/* Left column — headline + CTAs */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet/30 bg-violet/10 px-4 py-1.5 font-mono text-xs text-violet-soft"
            >
              Citation-backed answers · not guesses
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-4xl font-semibold leading-[1.1] tracking-tight text-white md:text-6xl"
            >
              Legal documents,
              <br />
              <span className="bg-gradient-to-r from-neon to-violet-soft bg-clip-text text-transparent">
                explained in plain words.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 max-w-lg text-lg text-white/80"
            >
              Upload any contract, notice, or government form. Ask questions in
              plain English, Hindi, or Marathi. Every answer points back to the
              exact clause it came from.
            </motion.p>

            {/* ── Premium CTA buttons ───────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <PremiumButton variant="primary" href="/register">
                Upload your first document
              </PremiumButton>
              <PremiumButton variant="ghost" href="#how-it-works">
                See how it works
              </PremiumButton>
            </motion.div>

            {/* ── Search preview bar ────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="glass-panel mt-10 flex max-w-lg items-center gap-3 px-5 py-4"
            >
              <Search size={18} className="text-white/40" aria-hidden="true" />
              <span className="flex-1 text-sm text-white/50">
                Ask "Can I break my rental lease early?"
              </span>
              <button
                type="button"
                aria-label="Ask with voice"
                className="rounded-full bg-white/5 p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-neon"
              >
                <Mic size={16} />
              </button>
            </motion.div>
          </div>

          {/* Right column — demo card (desktop only) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="hidden lg:flex justify-end"
          >
            <CitationDemo />
          </motion.div>
        </div>
      </section>
    </ScrollFrameAnimation>
  );
}
