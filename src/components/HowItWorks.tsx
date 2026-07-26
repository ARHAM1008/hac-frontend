import { motion } from "framer-motion";
import { UploadCloud, MessagesSquare, ShieldCheck } from "lucide-react";

const STEPS = [
  {
    Icon: UploadCloud,
    title: "Upload your document",
    body: "Drop in a PDF or a photo of a scanned form — OCR reads it, no manual typing.",
  },
  {
    Icon: MessagesSquare,
    title: "Ask in your own words",
    body: "Type or speak your question in English, Hindi, or Marathi.",
  },
  {
    Icon: ShieldCheck,
    title: "Get a cited answer",
    body: "Every response links back to the exact clause or section it's drawn from.",
  },
];

// ── Animation variants ────────────────────────────────────────────────────────

const headingVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.12, ease: "easeOut" },
  }),
};

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative mx-auto max-w-7xl px-6 py-24 overflow-hidden">
      {/* ── Ambient colour blobs ─────────────────────────────────────────────── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[15%] top-[-80px] h-80 w-80 rounded-full bg-neon/8 blur-[110px] animate-pulse-glow" />
        <div className="absolute right-[10%] bottom-[-60px] h-72 w-72 rounded-full bg-violet/8 blur-[100px] animate-pulse-glow [animation-delay:2.2s]" />
      </div>

      {/* ── Heading ───────────────────────────────────────────────────────────── */}
      <motion.div
        className="mx-auto max-w-2xl text-center"
        variants={headingVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
      >
        <h2 className="font-display text-3xl font-semibold text-ink md:text-4xl">
          Three steps. No legal jargon.
        </h2>
        <p className="mt-4 text-ink-muted">
          The whole point of NyayaAI is that you shouldn't need a law degree
          to understand what you signed.
        </p>
      </motion.div>

      {/* ── Step cards ────────────────────────────────────────────────────────── */}
      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {STEPS.map(({ Icon, title, body }, index) => (
          <motion.div
            key={title}
            custom={index}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="glass-panel group relative p-8 transition-transform duration-300 hover:-translate-y-1.5"
          >
            <span className="font-mono text-xs text-ink-faint">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-neon/20 to-violet/20">
              <Icon size={22} className="text-neon-soft" aria-hidden="true" />
            </div>
            <h3 className="mt-5 font-display text-lg font-semibold text-ink">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
