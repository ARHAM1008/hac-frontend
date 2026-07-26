/**
 * DashboardLayout.tsx
 *
 * Shell for all /dashboard/* routes.
 *
 * Visual layering (back → front):
 *  1. DashboardBackground  — looping frame animation canvas (z-index: -1)
 *  2. Sidebar + Topbar + main content
 *  3. DashboardIntro overlay — fullscreen intro on first visit (z-index: 9999)
 *
 * On first session visit the intro plays at full opacity.
 * Once the intro finishes (or is skipped), the background loop starts
 * and the dashboard content is revealed.
 *
 * On subsequent visits within the same session the intro is skipped and
 * the background loop runs immediately.
 */

import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { DesktopSidebar, MobileSidebar } from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import DashboardIntro, {
  hasDashboardIntroPlayed,
  markDashboardIntroPlayed,
} from "@/components/dashboard/DashboardIntro";
import DashboardBackground from "@/components/dashboard/DashboardBackground";
import { prewarmDashboardBgCache } from "@/hooks/useDashboardBackground";

// ── Page transition variants ──────────────────────────────────────────────────

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

  // showIntro: true on first visit, false on subsequent visits in same session
  const [showIntro, setShowIntro] = useState(() => !hasDashboardIntroPlayed());

  // bgActive: starts after intro completes (or immediately if intro skipped)
  const [bgActive, setBgActive] = useState(() => hasDashboardIntroPlayed());

  const location    = useLocation();
  const shouldReduce = useReducedMotion();

  // If intro was already seen this session, pre-warm the cache so the
  // background loop has frames available as fast as possible
  useEffect(() => {
    if (!showIntro) {
      prewarmDashboardBgCache();
    }
  }, [showIntro]);

  const handleIntroDone = () => {
    markDashboardIntroPlayed();
    setShowIntro(false);
    setBgActive(true);
  };

  return (
    <>
      {/* ── 1. Persistent animated background ────────────────────────────── */}
      <DashboardBackground active={bgActive} />

      {/* ── 2. Fullscreen intro (first visit only) ────────────────────────── */}
      {showIntro && <DashboardIntro onDone={handleIntroDone} />}

      {/* ── 3. Dashboard shell ────────────────────────────────────────────── */}
      <div className="flex min-h-screen">
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
    </>
  );
}
