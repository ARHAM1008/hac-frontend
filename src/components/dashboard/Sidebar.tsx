/**
 * Sidebar.tsx
 *
 * Desktop  → sticky collapsible sidebar
 * Mobile   → hidden by default; renders as a full-screen drawer
 *
 * Upgrade additions:
 *  - Active nav item shows a left-edge neon indicator bar (layoutId animated)
 *  - Icon scales on hover via Framer Motion whileHover
 *  - Label nudges right on hover
 *  - Glass backdrop on desktop sidebar
 */

import { motion, AnimatePresence } from "framer-motion";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  UploadCloud,
  MessagesSquare,
  Landmark,
  ClipboardCheck,
  History,
  User,
  Settings,
  MessageSquareWarning,
  ChevronsLeft,
  Scale,
  X,
  type LucideIcon,
} from "lucide-react";

const NAV_ITEMS: { to: string; label: string; Icon: LucideIcon; end: boolean }[] = [
  { to: "/dashboard",             label: "Dashboard",      Icon: LayoutDashboard,     end: true  },
  { to: "/dashboard/upload",      label: "Upload",         Icon: UploadCloud,          end: false },
  { to: "/dashboard/chat",        label: "AI Chat",        Icon: MessagesSquare,       end: false },
  { to: "/dashboard/schemes",     label: "Scheme finder",  Icon: Landmark,             end: false },
  { to: "/dashboard/eligibility", label: "Eligibility",    Icon: ClipboardCheck,       end: false },
  { to: "/dashboard/history",     label: "Chat history",   Icon: History,              end: false },
  { to: "/dashboard/profile",     label: "Profile",        Icon: User,                 end: false },
  { to: "/dashboard/settings",    label: "Settings",       Icon: Settings,             end: false },
  { to: "/dashboard/feedback",    label: "Feedback",       Icon: MessageSquareWarning, end: false },
];

// ─── Shared nav content ────────────────────────────────────────────────────────

function NavContent({
  collapsed,
  onLinkClick,
}: {
  collapsed: boolean;
  onLinkClick?: () => void;
}) {
  return (
    <nav className="flex-1 space-y-0.5 px-3" aria-label="Dashboard navigation">
      {NAV_ITEMS.map(({ to, label, Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onLinkClick}
          title={collapsed ? label : undefined}
          className={({ isActive }) =>
            `relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors overflow-hidden ${
              isActive
                ? "bg-neon/10 text-neon nav-link-active"
                : "text-ink-muted hover:bg-white/[0.05] hover:text-ink nav-link-inactive"
            }`
          }
        >
          {({ isActive }) => (
            <>
              {/* Left indicator bar — slides between items via layoutId */}
              {isActive && (
                <motion.span
                  layoutId="sidebar-active-bar"
                  className="active-indicator-bar absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-neon"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  aria-hidden="true"
                />
              )}

              {/* Icon — scales on hover */}
              <motion.span
                whileHover={{ scale: 1.12 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="shrink-0 flex items-center"
                aria-hidden="true"
              >
                <Icon size={18} />
              </motion.span>

              {/* Label — nudges right on hover */}
              {!collapsed && (
                <motion.span
                  whileHover={{ x: 2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="truncate"
                >
                  {label}
                </motion.span>
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

// ─── Desktop sidebar ──────────────────────────────────────────────────────────

export function DesktopSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.22, ease: "easeInOut" }}
      className="desktop-sidebar hidden shrink-0 flex-col border-r border-white/5 bg-surface/60 backdrop-blur-xl py-5 md:flex overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 pb-6">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-neon to-violet">
          <Scale size={16} className="text-void" aria-hidden="true" />
        </span>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="font-display text-base font-semibold text-ink overflow-hidden whitespace-nowrap"
            >
              NyayaAI
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <NavContent collapsed={collapsed} />

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={onToggle}
        className="mx-3 mt-4 flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-ink-faint hover:bg-white/[0.05] hover:text-ink transition-colors"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <motion.span animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.22 }}>
          <ChevronsLeft size={16} />
        </motion.span>
        {!collapsed && "Collapse"}
      </button>
    </motion.aside>
  );
}

// ─── Mobile drawer ────────────────────────────────────────────────────────────

export function MobileSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Scrim */}
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.aside
            key="drawer"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/5 bg-void backdrop-blur-xl py-5 md:hidden"
          >
            {/* Header row */}
            <div className="flex items-center justify-between px-5 pb-6">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-neon to-violet">
                  <Scale size={16} className="text-void" aria-hidden="true" />
                </span>
                <span className="font-display text-base font-semibold text-ink">NyayaAI</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="rounded-lg p-1.5 text-ink-muted hover:bg-white/[0.06] hover:text-ink transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <NavContent collapsed={false} onLinkClick={onClose} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Default export ───────────────────────────────────────────────────────────

export default function Sidebar() {
  return null;
}
