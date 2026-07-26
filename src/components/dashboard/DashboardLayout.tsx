/**
 * DashboardLayout.tsx
 *
 * Shell for all /dashboard/* routes.
 *
 * Desktop  → collapsible sticky sidebar on the left
 * Mobile   → full-width layout; sidebar opens as a drawer via hamburger button
 *
 * Upgrade: AnimatePresence + motion.div keyed on pathname so dashboard
 * sub-pages transition in/out with a fade+slide animation.
 */

import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { DesktopSidebar, MobileSidebar } from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.26, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.18, ease: "easeIn" as const },
  },
};

const noMotionVariants = {
  initial: {},
  animate: {},
  exit: {},
};

export default function DashboardLayout() {
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const shouldReduce = useReducedMotion();

  return (
    <div className="flex min-h-screen bg-void">
      {/* Desktop sidebar */}
      <DesktopSidebar
        collapsed={desktopCollapsed}
        onToggle={() => setDesktopCollapsed((v) => !v)}
      />

      {/* Mobile drawer + scrim */}
      <MobileSidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main content column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={shouldReduce ? noMotionVariants : pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
