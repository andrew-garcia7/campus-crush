"use client";

import { useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Clock3, Compass, Heart, Menu, MessageCircle, Crown, MapPin, Brain, UserCircle, Ghost } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const TABS: Array<{ href: Route; icon: LucideIcon; label: string }> = [
  { href: "/discover", icon: Compass,       label: "Discover" },
  { href: "/matches",  icon: Heart,         label: "Matches"  },
  { href: "/chat",     icon: MessageCircle, label: "Chats"    },
  { href: "/map",      icon: MapPin,        label: "Map"      },
  { href: "/coach",    icon: Brain,         label: "Coach"    },
  { href: "/profile",  icon: UserCircle,    label: "Profile"  },
];

const EXTRA_TABS: Array<{ href: Route; icon: LucideIcon; label: string }> = [
  { href: "/events", icon: Calendar, label: "Events" },
  { href: "/confessions", icon: Ghost, label: "Wall" },
  { href: "/premium", icon: Crown, label: "Premium" },
  { href: "/history", icon: Clock3, label: "History" },
];

export function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const hidden = ["/login", "/signup", "/verification", "/"].includes(pathname || "");
  if (hidden) return null;

  return (
    <>
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.button
              key="more-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: "var(--surface-overlay)" }}
              onClick={() => setMoreOpen(false)}
            />
            <motion.div
              key="more-sheet"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="fixed bottom-[74px] left-4 right-4 z-50 rounded-[24px] p-3 md:hidden"
              style={{
                border: "1px solid var(--surface-border)",
                background: "color-mix(in srgb, var(--surface-panel) 94%, transparent)",
                boxShadow: "var(--shadow-card)"
              }}
            >
              <div className="grid grid-cols-2 gap-2">
                {EXTRA_TABS.map(({ href, icon: Icon, label }) => {
                  const active = pathname === href || pathname?.startsWith(href);
                  return (
                    <Link key={href} href={href} onClick={() => setMoreOpen(false)}>
                      <div
                        className="flex items-center gap-2 rounded-2xl border px-3 py-3"
                        style={active ? {
                          borderColor: "color-mix(in srgb, var(--surface-border) 70%, var(--accent-fuchsia) 30%)",
                          background: "color-mix(in srgb, var(--surface-active) 80%, var(--accent-fuchsia) 20%)",
                          color: "var(--text-primary)"
                        } : {
                          borderColor: "var(--surface-border)",
                          background: "var(--surface-hover)",
                          color: "var(--text-soft)"
                        }}
                      >
                        <Icon className="h-4 w-4" style={{ color: active ? "var(--accent-fuchsia)" : "var(--nav-icon)" }} />
                        <span className="text-xs font-medium">{label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-safe">
      <div
        className="absolute inset-0 border-t"
        style={{
          background: "var(--nav-bg)",
          borderColor: "var(--nav-border)"
        }}
      />

      <div className="relative flex items-center justify-around px-2 py-1">
        {TABS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/" && pathname?.startsWith(href));
          return (
            <Link key={href} href={href} className="flex-1">
              <motion.div
                whileTap={{ scale: 0.84 }}
                className="flex flex-col items-center gap-0.5 py-1.5"
              >
                <div className={`relative flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 ${
                  active
                    ? "shadow-[0_0_12px_rgba(168,85,247,0.35)]"
                    : ""
                }`} style={active ? { background: "linear-gradient(135deg, color-mix(in srgb, var(--accent-purple) 42%, transparent), color-mix(in srgb, var(--accent-fuchsia) 26%, transparent))" } : undefined}>
                  <Icon
                    className="h-[18px] w-[18px] transition-all duration-200"
                    style={{
                      color: active ? "var(--accent-fuchsia)" : "var(--nav-icon)",
                      filter: active ? "drop-shadow(0 0 6px rgba(232,121,249,0.55))" : undefined
                    }}
                  />
                  {active && (
                    <motion.span
                      layoutId="bottom-active-dot"
                      className="absolute -bottom-1 h-1 w-4 rounded-full shadow-[0_0_6px_rgba(232,121,249,0.7)]"
                      style={{ background: "var(--accent-fuchsia)" }}
                      transition={{ type: "spring", stiffness: 480, damping: 30 }}
                    />
                  )}
                </div>
                <span className="text-[9px] font-medium transition-colors" style={{ color: active ? "var(--accent-fuchsia)" : "var(--nav-icon)" }}>
                  {label}
                </span>
              </motion.div>
            </Link>
          );
        })}

        <button type="button" onClick={() => setMoreOpen((current) => !current)} className="flex-1">
          <motion.div whileTap={{ scale: 0.84 }} className="flex flex-col items-center gap-0.5 py-1.5">
            <div className={`relative flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 ${moreOpen ? "shadow-[0_0_12px_rgba(168,85,247,0.35)]" : ""}`} style={moreOpen ? { background: "linear-gradient(135deg, color-mix(in srgb, var(--accent-purple) 42%, transparent), color-mix(in srgb, var(--accent-fuchsia) 26%, transparent))" } : undefined}>
              <Menu className="h-[18px] w-[18px] transition-all duration-200" style={{ color: moreOpen ? "var(--accent-fuchsia)" : "var(--nav-icon)", filter: moreOpen ? "drop-shadow(0 0 6px rgba(232,121,249,0.55))" : undefined }} />
            </div>
            <span className="text-[9px] font-medium transition-colors" style={{ color: moreOpen ? "var(--accent-fuchsia)" : "var(--nav-icon)" }}>
              More
            </span>
          </motion.div>
        </button>
      </div>
      </nav>
    </>
  );
}

