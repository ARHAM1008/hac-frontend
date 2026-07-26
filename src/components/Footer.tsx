import { motion } from "framer-motion";

const FOOTER_LINKS = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Accessibility statement", href: "/accessibility" },
  { label: "Privacy policy", href: "/privacy" },
  { label: "Terms of use", href: "/terms" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-surface/50">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <motion.div
          className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="max-w-sm">
            <p className="font-display text-lg font-semibold text-ink">NyayaAI</p>
            <p className="mt-2 text-sm text-ink-muted">
              AI legal &amp; government assistant. Independent, not affiliated
              with any government body — always confirm scheme details on the
              issuing department's official site.
            </p>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-ink-muted transition-colors hover:text-ink"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </motion.div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/5 pt-6 text-xs text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} NyayaAI. All rights reserved.</p>
          <p>Built for accessibility — WCAG 2.1 AA targeted across the app.</p>
        </div>
      </div>
    </footer>
  );
}
