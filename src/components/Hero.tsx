import { motion } from "framer-motion";
import { Search, FileText, Landmark, Gavel, Mic } from "lucide-react";
import CitationDemo from "./CitationDemo";

const FLOATING_ICONS = [
  { Icon: FileText, className: "left-[8%] top-[20%]", delay: 0 },
  { Icon: Landmark, className: "right-[10%] top-[12%]", delay: 1.2 },
  { Icon: Gavel, className: "left-[15%] bottom-[18%]", delay: 0.6 },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-16 md:pt-24">
      {/* Animated gradient mesh backdrop */}
      <div
        className="pointer-events-none absolute inset-0 bg-mesh-gradient bg-[length:200%_200%] animate-gradient-shift"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-neon/30 animate-pulse-glow"
        aria-hidden="true"
      />

      {/* Floating decorative icons — hidden from screen readers, purely ambient */}
      <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden="true">
        {FLOATING_ICONS.map(({ Icon, className, delay }, index) => (
          <div
            key={index}
            className={`absolute ${className} animate-float-slow opacity-20`}
            style={{ animationDelay: `${delay}s` }}
          >
            <Icon size={40} className="text-neon" />
          </div>
        ))}
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
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
            className="font-display text-4xl font-semibold leading-[1.1] tracking-tight text-ink md:text-6xl"
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
            className="mt-6 max-w-lg text-lg text-ink-muted"
          >
            Upload any contract, notice, or government form. Ask questions in
            plain English, Hindi, or Marathi. Every answer points back to the
            exact clause it came from.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <a href="/register" className="btn-primary">
              Upload your first document
            </a>
            <a href="#how-it-works" className="btn-ghost">
              See how it works
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="glass-panel mt-10 flex max-w-lg items-center gap-3 px-5 py-4"
          >
            <Search size={18} className="text-ink-faint" aria-hidden="true" />
            <span className="flex-1 text-sm text-ink-faint">
              Ask "Can I break my rental lease early?"
            </span>
            <button
              type="button"
              className="rounded-full bg-white/5 p-2 text-ink-muted transition-colors hover:bg-white/10 hover:text-neon"
              aria-label="Ask with voice"
            >
              <Mic size={16} />
            </button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex justify-center lg:justify-end"
        >
          <CitationDemo />
        </motion.div>
      </div>
    </section>
  );
}
