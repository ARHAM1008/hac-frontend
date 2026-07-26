import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Scale } from "lucide-react";
import PremiumButton from "./ui/PremiumButton";

const NAV_LINKS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Find schemes", href: "#schemes" },
  { label: "FAQs", href: "#faqs" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-void/70 backdrop-blur-xl">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4"
        aria-label="Primary"
      >
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-neon to-violet">
            <Scale size={16} className="text-void" aria-hidden="true" />
          </span>
          NyayaAI
        </a>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-ink-muted transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA buttons */}
        <div className="hidden items-center gap-3 md:flex">
          <PremiumButton variant="ghost" href="/login" className="!px-5 !py-2 !text-sm">
            Sign in
          </PremiumButton>
          <PremiumButton variant="primary" href="/register" className="!px-5 !py-2 !text-sm">
            Get started
          </PremiumButton>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="rounded-lg p-2 text-ink md:hidden"
          onClick={() => setMobileOpen((open) => !open)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-white/5 md:hidden"
          >
            <div className="flex flex-col gap-4 px-6 py-6">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-ink-muted hover:text-ink"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-2 flex gap-3">
                <PremiumButton
                  variant="ghost"
                  href="/login"
                  className="flex-1 !py-2 !text-sm"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign in
                </PremiumButton>
                <PremiumButton
                  variant="primary"
                  href="/register"
                  className="flex-1 !py-2 !text-sm"
                  onClick={() => setMobileOpen(false)}
                >
                  Get started
                </PremiumButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
