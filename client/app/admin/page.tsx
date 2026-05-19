"use client";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-[36px] border border-fuchsia-300/20 bg-[#120522]/70 shadow-[0_0_45px_rgba(196,70,255,0.3)] backdrop-blur-xl"
      >
        <div className="relative overflow-hidden px-5 pt-6 pb-4">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-purple-500/15 blur-2xl" />
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-500">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
              <p className="text-xs text-purple-300/60">Moderation and verification controls</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 px-5 pb-6">
          <div className="rounded-2xl border border-purple-300/20 bg-white/[0.04] p-3 text-xs text-purple-200">Pending Verifications</div>
          <div className="rounded-2xl border border-purple-300/20 bg-white/[0.04] p-3 text-xs text-purple-200">Reports Queue</div>
          <div className="rounded-2xl border border-purple-300/20 bg-white/[0.04] p-3 text-xs text-purple-200">Banned Users</div>
          <div className="rounded-2xl border border-purple-300/20 bg-white/[0.04] p-3 text-xs text-purple-200">Daily Analytics</div>
        </div>
      </motion.div>
    </div>
  );
}
