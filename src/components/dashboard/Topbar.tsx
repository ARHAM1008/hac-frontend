import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  ChevronDown,
  LogOut,
  Moon,
  Sun,
  User as UserIcon,
  Menu,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

interface TopbarProps {
  /** Called when the mobile hamburger button is tapped */
  onMenuClick?: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = (user?.full_name ?? "?")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/5 bg-void/80 px-4 backdrop-blur-xl sm:h-16 sm:px-6">
      {/* Left: hamburger (mobile only) */}
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-lg p-2 text-ink-muted transition-colors hover:bg-white/[0.06] hover:text-ink md:hidden"
        aria-label="Open navigation menu"
      >
        <Menu size={20} />
      </button>

      {/* Spacer on desktop (sidebar fills left side) */}
      <div className="hidden md:block" />

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-lg p-2 text-ink-muted transition-colors hover:bg-white/[0.06] hover:text-ink"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <button
          type="button"
          className="relative rounded-lg p-2 text-ink-muted transition-colors hover:bg-white/[0.06] hover:text-ink"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber" aria-hidden="true" />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-white/[0.06] sm:pr-3"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-neon/30 to-violet/30 text-xs font-semibold text-ink">
              {initials}
            </span>
            <span className="hidden text-sm text-ink-muted sm:block truncate max-w-[96px]">
              {user?.full_name?.split(" ")[0]}
            </span>
            <ChevronDown size={13} className="hidden text-ink-faint sm:block" />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                role="menu"
                className="glass-panel absolute right-0 top-full mt-2 w-48 overflow-hidden p-1.5 z-50"
              >
                <p className="truncate px-3 py-2 text-xs text-ink-faint">{user?.email}</p>
                <Link
                  to="/dashboard/profile"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-muted hover:bg-white/[0.06] hover:text-ink"
                >
                  <UserIcon size={15} /> Profile
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { setMenuOpen(false); logout(); }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-300 hover:bg-red-500/10"
                >
                  <LogOut size={15} /> Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
