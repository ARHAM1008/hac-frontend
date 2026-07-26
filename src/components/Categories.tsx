/**
 * Categories.tsx
 * Landing-page section — "Find what applies to you"
 *
 * Layout:
 *  1. Facet tab pills (By document / By life event / By department)
 *  2. Circular / infinite-carousel of scheme cards that auto-rotates
 *     and can be scrubbed with Prev / Next arrows or keyboard.
 *
 * Each facet has its own rich scheme list (6 items).  The carousel shows
 * 3 cards at a time on desktop, 2 on tablet, 1 on mobile and loops infinitely.
 */

import { useState, useEffect, useRef, useCallback, type ElementType } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Home,
  Briefcase,
  Heart,
  Tractor,
  Building2,
  ShieldCheck,
  Baby,
  Landmark,
  Banknote,
  Stethoscope,
  Leaf,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Facet = "document" | "life-event" | "department";

interface SchemeItem {
  Icon: ElementType;
  label: string;
  count: number;
  tag: string;
  color: string; // tailwind bg class for the icon wrapper
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const FACETS: { id: Facet; label: string }[] = [
  { id: "document", label: "By document type" },
  { id: "life-event", label: "By life event" },
  { id: "department", label: "By department" },
];

const FACET_ITEMS: Record<Facet, SchemeItem[]> = {
  document: [
    { Icon: Home,          label: "Rental agreements",       count: 214, tag: "Housing",    color: "bg-violet/20" },
    { Icon: Briefcase,     label: "Employment contracts",    count: 158, tag: "Labour",     color: "bg-amber/20"  },
    { Icon: Building2,     label: "Property deeds",          count: 96,  tag: "Revenue",    color: "bg-neon/15"   },
    { Icon: ShieldCheck,   label: "Insurance policies",      count: 73,  tag: "Finance",    color: "bg-blue-500/20" },
    { Icon: Stethoscope,   label: "Medical records",         count: 48,  tag: "Health",     color: "bg-rose-500/20" },
    { Icon: Banknote,      label: "Loan & bank agreements",  count: 121, tag: "Banking",    color: "bg-emerald-500/20" },
  ],
  "life-event": [
    { Icon: GraduationCap, label: "Starting college",        count: 42,  tag: "Education",  color: "bg-violet/20" },
    { Icon: Heart,         label: "Getting married",         count: 37,  tag: "Family",     color: "bg-rose-500/20" },
    { Icon: Tractor,       label: "Owning farmland",         count: 51,  tag: "Agriculture",color: "bg-emerald-500/20" },
    { Icon: Baby,          label: "Having a child",          count: 29,  tag: "Welfare",    color: "bg-amber/20"  },
    { Icon: Home,          label: "Buying a home",           count: 63,  tag: "Housing",    color: "bg-neon/15"   },
    { Icon: Briefcase,     label: "Starting a business",     count: 88,  tag: "MSME",       color: "bg-blue-500/20" },
  ],
  department: [
    { Icon: Building2,     label: "Ministry of Housing",     count: 63,  tag: "Urban Dev",  color: "bg-neon/15"   },
    { Icon: Briefcase,     label: "Ministry of Labour",      count: 88,  tag: "Employment", color: "bg-amber/20"  },
    { Icon: GraduationCap, label: "Ministry of Education",   count: 74,  tag: "Scholarships",color: "bg-violet/20" },
    { Icon: Stethoscope,   label: "Ministry of Health",      count: 59,  tag: "Health",     color: "bg-rose-500/20" },
    { Icon: Leaf,          label: "Ministry of Agriculture", count: 112, tag: "Farmers",    color: "bg-emerald-500/20" },
    { Icon: Landmark,      label: "Ministry of Finance",     count: 97,  tag: "Subsidies",  color: "bg-blue-500/20" },
  ],
};

const AUTO_PLAY_MS = 3200;

// ─── Carousel ─────────────────────────────────────────────────────────────────

interface CarouselProps {
  items: SchemeItem[];
}

const schemeCardVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.38, delay: i * 0.07, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

function SchemeCard({ Icon, label, count, tag, color }: SchemeItem) {
  return (
    <div className="glass-panel flex flex-col gap-3 p-5 h-full hover:bg-white/[0.07] transition-colors cursor-default select-none">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}>
        <Icon size={20} className="text-white/90" aria-hidden="true" />
      </div>
      <div className="flex-1">
        <p className="font-display text-sm font-semibold text-ink leading-snug">{label}</p>
        <p className="mt-1 text-xs text-ink-faint">{count} schemes matched</p>
      </div>
      <span className="inline-block rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[10px] font-medium text-ink-muted">
        {tag}
      </span>
    </div>
  );
}

function Carousel({ items }: CarouselProps) {
  // We duplicate the list to achieve seamless looping
  const total = items.length; // 6
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const paused = useRef(false);

  const go = useCallback(
    (dir: 1 | -1) => {
      setDirection(dir);
      setActive((prev) => (prev + dir + total) % total);
    },
    [total]
  );

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (!paused.current) go(1);
    }, AUTO_PLAY_MS);
  }, [go]);

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTimer]);

  // Visible indices: active-1, active, active+1 (3-up on ≥md)
  const visible = [
    (active - 1 + total) % total,
    active,
    (active + 1) % total,
  ];

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0, scale: 0.95 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit:  (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0, scale: 0.95 }),
  };

  return (
    <div
      className="relative mt-10"
      onMouseEnter={() => { paused.current = true; }}
      onMouseLeave={() => { paused.current = false; }}
    >
      {/* Cards */}
      <AnimatePresence mode="popLayout" custom={direction}>
        <motion.div
          key={active}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.38, ease: [0.32, 0.72, 0, 1] }}
          className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
        >
          {visible.map((idx, position) => (
            <motion.div
              key={idx}
              custom={position}
              variants={schemeCardVariants}
              initial="hidden"
              animate="visible"
            >
              <SchemeCard {...items[idx]} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Navigation row */}
      <div className="mt-8 flex items-center justify-center gap-4">
        {/* Prev */}
        <button
          type="button"
          aria-label="Previous schemes"
          onClick={() => { go(-1); startTimer(); }}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-ink-muted transition-colors hover:bg-white/[0.10] hover:text-ink"
        >
          <ArrowLeft size={15} />
        </button>

        {/* Dot indicators */}
        <div className="flex gap-1.5" role="tablist" aria-label="Carousel position">
          {items.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === active}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => { setDirection(i > active ? 1 : -1); setActive(i); startTimer(); }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === active ? "w-6 bg-neon" : "w-1.5 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>

        {/* Next */}
        <button
          type="button"
          aria-label="Next schemes"
          onClick={() => { go(1); startTimer(); }}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-ink-muted transition-colors hover:bg-white/[0.10] hover:text-ink"
        >
          <ArrowRight size={15} />
        </button>
      </div>

      {/* "Browse all" CTA */}
      <div className="mt-6 flex justify-center">
        <a
          href="/dashboard/schemes"
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-neon transition-colors"
        >
          Browse all government schemes <ChevronRight size={14} />
        </a>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function Categories() {
  const [activeFacet, setActiveFacet] = useState<Facet>("document");

  return (
    <section id="schemes" className="mx-auto max-w-7xl px-6 py-24">
      <motion.div
        className="mx-auto max-w-2xl text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        <h2 className="font-display text-3xl font-semibold text-ink md:text-4xl">
          Find what applies to you
        </h2>
        <p className="mt-4 text-ink-muted">
          Browse government schemes the way that makes sense to you — not the
          way the ministry filed them.
        </p>
      </motion.div>

      {/* Facet pills */}
      <div
        role="tablist"
        aria-label="Browse schemes by"
        className="mx-auto mt-10 flex w-fit gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1"
      >
        {FACETS.map((facet) => (
          <button
            key={facet.id}
            role="tab"
            aria-selected={activeFacet === facet.id}
            onClick={() => setActiveFacet(facet.id)}
            className={`rounded-full px-4 py-2 font-display text-sm font-medium transition-colors ${
              activeFacet === facet.id
                ? "bg-neon text-void"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            {facet.label}
          </button>
        ))}
      </div>

      {/* Carousel — re-mounts on facet change to reset position */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeFacet}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          <Carousel items={FACET_ITEMS[activeFacet]} />
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
