"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PanelRight } from "lucide-react";
import { NeonBackground } from "./neon-background";
import { ToastHost } from "@/components/ui/toast-host";
import { LeftSidebar } from "./left-sidebar";
import { RightPanel } from "./right-panel";
import { BottomNav } from "./bottom-nav";
import { FloatingAIButton } from "./floating-ai-button";
import { Footer } from "./footer";

const BARE_PATHS = ["/", "/login", "/signup", "/forgot-password", "/verification"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isBare = BARE_PATHS.includes(pathname || "");
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  if (isBare) {
    return (
      <>
        <ToastHost />
        {children}
      </>
    );
  }

  return (
    <div className="relative w-full min-h-screen">
      <NeonBackground />
      <ToastHost />

      {/* ── DESKTOP (≥1280px): full 3-column ─────────────────── */}
      <div className="hidden xl:grid w-full min-h-screen"
        style={{ gridTemplateColumns: "260px 1fr 300px" }}>

        {/* Left nav rail */}
        <div className="min-h-screen border-r" style={{ borderColor: "var(--nav-border)", background: "color-mix(in srgb, var(--nav-bg) 96%, transparent)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", isolation: "isolate" }}>
          <LeftSidebar />
        </div>

        {/* Center content */}
        <main className="min-w-0 px-7 py-7 pb-24">
          {children}
          <Footer />
        </main>

        {/* Right widget panel */}
        <div className="glass-panel min-h-screen border-l" style={{ borderColor: "var(--nav-border)", background: "color-mix(in srgb, var(--surface-panel) 88%, transparent)" }}>
          <RightPanel />
        </div>
      </div>

      {/* ── TABLET (768px–1279px): 2-column + slide drawer ─────── */}
      <div className="hidden md:flex xl:hidden w-full min-h-screen">

        {/* Compact icon rail */}
        <div className="flex-shrink-0 min-h-screen border-r"
          style={{ width: 68, borderColor: "var(--nav-border)", background: "color-mix(in srgb, var(--nav-bg) 96%, transparent)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", isolation: "isolate" }}
        >
          <LeftSidebar compact />
        </div>

        {/* Center content */}
        <main className="flex-1 min-w-0 px-5 py-5 pb-10">
          {/* Tablet top bar with drawer trigger */}
          <div className="mb-4 flex items-center justify-end">
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs backdrop-blur-sm transition-all hover:text-[var(--text-primary)]"
              style={{ borderColor: "var(--surface-border)", background: "var(--surface-hover)", color: "var(--text-soft)" }}
            >
              <PanelRight className="h-3.5 w-3.5" />
              Widgets
            </button>
          </div>
          {children}
          <Footer />
        </main>

        {/* Slide-in right drawer */}
        <AnimatePresence>
          {drawerOpen && (
            <>
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="drawer-backdrop"
                onClick={() => setDrawerOpen(false)}
              />
              <motion.div
                key="drawer"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 320, damping: 32 }}
                className="fixed right-0 top-0 bottom-0 z-50 w-[300px] glass-panel overflow-y-auto border-l"
                style={{ borderColor: "var(--nav-border)", background: "color-mix(in srgb, var(--surface-panel) 92%, transparent)" }}
              >
                <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "var(--nav-border)" }}>
                  <p className="font-display text-sm font-semibold text-[var(--text-primary)]">Widgets</p>
                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="text-xs transition-colors hover:text-[var(--text-primary)]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    ✕ Close
                  </button>
                </div>
                <RightPanel />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* ── MOBILE (<768px): full width + bottom nav ─────────────── */}
      <div className="md:hidden w-full">
        <div className="px-4 pt-4 pb-28">
          {children}
        </div>
        <BottomNav />
      </div>

      {/* Floating AI assistant — all breakpoints */}
      <FloatingAIButton />
    </div>
  );
}

