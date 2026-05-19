"use client";

import { motion } from "framer-motion";
import { LogOut, Bell, Map, Eye, Ghost, Shield, ChevronRight } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import Link from "next/link";

const TOGGLES = [
  { id: "map", label: "Show me on campus map", sub: "Let nearby students see you", icon: Map, defaultOn: true },
  { id: "notif", label: "Push notifications", sub: "Matches, messages, events", icon: Bell, defaultOn: true },
  { id: "receipts", label: "Read receipts", sub: "Let others see when you've read", icon: Eye, defaultOn: true },
  { id: "anon", label: "Anonymous mode", sub: "Hide your profile temporarily", icon: Ghost, defaultOn: false },
];

export default function SettingsPage() {
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-[0_4px_24px_rgba(255,45,120,0.08)]"
      >
        <div className="relative overflow-hidden px-5 pt-6 pb-4">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-purple-500/15 blur-2xl" />
          <h1 className="text-xl font-bold text-[#2D1810]">Settings</h1>
          <p className="text-xs text-[#9B7065]">Privacy &amp; preferences</p>
        </div>

        <div className="space-y-2 px-5 pb-3">
          {TOGGLES.map(({ id, label, sub, icon: Icon, defaultOn }) => (
            <label key={id} className="flex cursor-pointer items-center gap-3 rounded-2xl border border-pink-100 bg-white p-3.5 hover:border-pink-200 hover:bg-pink-50/40 transition-colors">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-pink-50">
                <Icon className="h-4 w-4 text-[#FF2D78]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#2D1810]">{label}</p>
                <p className="text-[11px] text-[#9B7065]">{sub}</p>
              </div>
              <input type="checkbox" defaultChecked={defaultOn} className="accent-[#FF2D78] h-4 w-4" />
            </label>
          ))}
        </div>

        <div className="space-y-2 px-5 pb-3">
          {[
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Terms of Service", href: "/terms" },
            { label: "Help & Support", href: "/support" },
            { label: "Report a Problem", href: "/report" },
          ].map(({ label, href }) => (
            <div key={label} className="flex items-center justify-between rounded-2xl border border-pink-100 bg-[#FFF8F0] px-4 py-3">
              <div className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-[#9B7065]" />
                <p className="text-sm text-[#6B4B40]">{label}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-[#9B7065]" />
            </div>
          ))}
        </div>

        <div className="px-5 pb-6 pt-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-50 py-3 text-sm font-medium text-rose-600 transition hover:bg-rose-100"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </motion.button>
          <p className="mt-3 text-center text-[10px] text-[#9B7065]/60">Campus Crush AI v2.0 · College-exclusive</p>
        </div>
      </motion.div>
    </div>
  );
}

