import { motion } from "framer-motion";
import { FileText, Landmark, Network, ShieldCheck } from "lucide-react";

const FLOATING_NODES = [
  { Icon: FileText, top: "18%", left: "20%", delay: 0, size: 34 },
  { Icon: ShieldCheck, top: "62%", left: "12%", delay: 0.8, size: 28 },
  { Icon: Network, top: "30%", left: "68%", delay: 1.4, size: 30 },
];

export default function AuthIllustration() {
  return (
    <div className="relative hidden h-full flex-col justify-center overflow-hidden bg-surface px-12 lg:flex">
      <div
        className="pointer-events-none absolute inset-0 bg-mesh-gradient bg-[length:200%_200%] animate-gradient-shift"
        aria-hidden="true"
      />

      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {FLOATING_NODES.map(({ Icon, top, left, delay, size }, index) => (
          <div
            key={index}
            className="absolute animate-float-slow"
            style={{ top, left, animationDelay: `${delay}s` }}
          >
            <div className="glass-panel flex items-center justify-center p-3">
              <Icon size={size} className="text-neon-soft" />
            </div>
          </div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mx-auto flex h-40 w-40 items-center justify-center rounded-3xl bg-gradient-to-br from-neon/20 to-violet/20"
      >
        <Landmark size={64} className="text-neon-soft" aria-hidden="true" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative z-10 mx-auto mt-10 max-w-sm text-center"
      >
        <h2 className="font-display text-2xl font-semibold text-ink">
          Government paperwork, decoded.
        </h2>
        <p className="mt-3 text-sm text-ink-muted">
          Every answer NyayaAI gives you links back to the exact law or
          clause it came from — nothing is invented.
        </p>
      </motion.div>
    </div>
  );
}
