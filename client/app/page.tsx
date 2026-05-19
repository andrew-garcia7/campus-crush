"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Lock, Heart, Sparkles, Star, Zap } from "lucide-react";
import { LuxuryBackground } from "@/components/auth/luxury-background";

/* ─── tiny floating heart layer only for homepage ─── */
const MINI_HEARTS = [
  { id: 0, x: 8,  delay: 0,   dur: 9,  size: 10 },
  { id: 1, x: 22, delay: 2.3, dur: 11, size: 8  },
  { id: 2, x: 55, delay: 1.1, dur: 10, size: 12 },
  { id: 3, x: 73, delay: 3.7, dur: 12, size: 9  },
  { id: 4, x: 88, delay: 5.0, dur: 10, size: 11 },
];

/* ─── avatar stack helpers ─── */
const AVATAR_COLORS = [
  "from-pink-400 to-rose-500",
  "from-fuchsia-400 to-purple-500",
  "from-amber-400 to-orange-500",
  "from-sky-400 to-blue-500",
];

function AvatarBubble({ idx, letter, className = "" }: { idx: number; letter: string; className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-gradient-to-br font-bold text-white shadow-[0_0_12px_rgba(0,0,0,0.4)] ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} ${className}`}
    >
      {letter}
    </div>
  );
}

export default function HomePage() {
  return (
    <LuxuryBackground heartMode="subtle" backgroundMotion="subtle-zoom">
      {/* extra homepage-only mini hearts */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {MINI_HEARTS.map((h) => (
          <motion.div
            key={h.id}
            className="absolute select-none text-pink-300/50"
            style={{ left: `${h.x}%`, bottom: -30, fontSize: h.size }}
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: -600, opacity: [0, 0.7, 0.4, 0] }}
            transition={{ duration: h.dur, delay: h.delay, repeat: Infinity, ease: "linear" }}
          >
            ♥
          </motion.div>
        ))}
      </div>

      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {/* ── Main card ── */}
          <div className="relative w-full overflow-hidden rounded-[38px] border border-white/18 bg-white/[0.07] p-7 shadow-[0_32px_80px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl">

            {/* subtle inner glow top */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 rounded-t-[38px] bg-gradient-to-b from-pink-500/10 to-transparent" />

            {/* ── Brand pills ── */}
            <div className="flex flex-col items-center gap-2">
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="inline-flex items-center gap-1.5 rounded-full border border-pink-400/40 bg-pink-500/10 px-4 py-1.5 text-[11px] font-semibold tracking-[0.22em] text-pink-200 shadow-[0_0_18px_rgba(236,72,153,0.25)]"
              >
                <Sparkles className="h-3 w-3" />
                CAMPUS CRUSH AI
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22 }}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.06] px-4 py-1 text-[10px] uppercase tracking-[0.22em] text-white/55"
              >
                <ShieldCheck className="h-3 w-3 text-emerald-300/80" />
                Verified college-only dating + AI coach
              </motion.div>
            </div>

            {/* ── Heading ── */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-5 text-center"
            >
              <h1 className="font-extrabold leading-[0.9] tracking-tight">
                <span className="block text-[4.2rem] text-white drop-shadow-[0_2px_18px_rgba(255,255,255,0.18)] sm:text-[5rem]">
                  Campus
                </span>
                <span
                  className="block text-[4.2rem] sm:text-[5rem]"
                  style={{
                    background: "linear-gradient(135deg, #f9c46b 0%, #f472b6 38%, #e879f9 68%, #a78bfa 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    filter: "drop-shadow(0 0 28px rgba(249,196,107,0.5))",
                  }}
                >
                  Crush
                </span>
              </h1>

              <p className="mt-3 text-[13px] leading-[1.65] text-white/65">
                Meet verified students from your campus with<br />
                private matching and an AI coach built for real chemistry.
              </p>
            </motion.div>

            {/* ── Preview cards ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42 }}
              className="mt-6 grid grid-cols-2 gap-3"
            >
              {/* Swipe Preview */}
              <div className="group relative overflow-hidden rounded-[22px] border border-pink-400/20 bg-gradient-to-br from-pink-500/15 via-rose-500/8 to-fuchsia-500/10 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_8px_32px_rgba(236,72,153,0.15)] backdrop-blur-sm">
                {/* pulse ring */}
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 2.4, repeat: Infinity }}
                  className="absolute right-3 top-3 h-6 w-6 rounded-full bg-pink-400/30"
                />

                {/* avatar stack */}
                <div className="relative mb-3 flex items-center">
                  <AvatarBubble idx={0} letter="A" className="h-9 w-9 text-sm ring-2 ring-black/30" />
                  <AvatarBubble idx={1} letter="B" className="-ml-2.5 h-9 w-9 text-sm ring-2 ring-black/30" />
                  <AvatarBubble idx={2} letter="C" className="-ml-2.5 h-9 w-9 text-sm ring-2 ring-black/30" />
                  {/* bouncing heart */}
                  <motion.div
                    animate={{ y: [0, -4, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                    className="ml-2"
                  >
                    <Heart className="h-5 w-5 fill-pink-400 text-pink-400 drop-shadow-[0_0_6px_rgba(244,114,182,0.9)]" />
                  </motion.div>
                </div>

                <p className="text-[13px] font-semibold text-white">Swipe preview</p>
                <p className="mt-1 text-[11px] leading-[1.5] text-white/50">Curated student profiles with cleaner intent signals.</p>
              </div>

              {/* Match Preview */}
              <div className="group relative overflow-hidden rounded-[22px] border border-purple-400/20 bg-gradient-to-br from-purple-500/15 via-fuchsia-500/8 to-violet-500/10 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_8px_32px_rgba(168,85,247,0.15)] backdrop-blur-sm">
                {/* sparkle pulse */}
                <motion.div
                  animate={{ scale: [1, 1.35, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 2.8, repeat: Infinity, delay: 0.7 }}
                  className="absolute right-3 top-3 h-6 w-6 rounded-full bg-purple-400/30"
                />

                {/* two avatars with glowing match line */}
                <div className="relative mb-3 flex items-center justify-start gap-1">
                  <AvatarBubble idx={0} letter="S" className="h-8 w-8 text-xs ring-2 ring-black/30" />
                  {/* glow line */}
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5], scaleX: [0.8, 1.05, 0.8] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                    className="h-[2px] w-6 origin-center rounded-full bg-gradient-to-r from-pink-400 via-fuchsia-400 to-purple-400 shadow-[0_0_8px_rgba(217,70,239,0.8)]"
                  />
                  <AvatarBubble idx={3} letter="R" className="h-8 w-8 text-xs ring-2 ring-black/30" />
                  <motion.div
                    animate={{ rotate: [0, 12, -8, 0], scale: [1, 1.15, 1] }}
                    transition={{ duration: 2.2, repeat: Infinity }}
                    className="ml-1"
                  >
                    <Sparkles className="h-4 w-4 text-fuchsia-300 drop-shadow-[0_0_6px_rgba(217,70,239,0.9)]" />
                  </motion.div>
                </div>

                <p className="text-[13px] font-semibold text-white">Match preview</p>
                <p className="mt-1 text-[11px] leading-[1.5] text-white/50">AI coaching helps break the ice before chats begin.</p>
              </div>
            </motion.div>

            {/* ── CTA buttons ── */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.54 }}
              className="mt-6 space-y-3"
            >
              <Link href="/signup" className="block">
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 0 55px rgba(236,72,153,0.75)" }}
                  whileTap={{ scale: 0.97 }}
                  className="relative w-full overflow-hidden rounded-full py-4 text-[13px] font-bold tracking-wide text-white shadow-[0_0_36px_rgba(236,72,153,0.55)] transition-shadow"
                  style={{ background: "linear-gradient(135deg, #ec4899 0%, #d946ef 45%, #8b5cf6 100%)" }}
                >
                  {/* shimmer sweep */}
                  <motion.div
                    className="pointer-events-none absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ["-120%", "120%"] }}
                    transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }}
                  />
                  <span className="relative flex items-center justify-center gap-2">
                    <Heart className="h-4 w-4 fill-white" />
                    Create Account
                  </span>
                </motion.button>
              </Link>

              <Link href="/login" className="block">
                <motion.button
                  whileHover={{ scale: 1.02, borderColor: "rgba(255,255,255,0.35)", backgroundColor: "rgba(255,255,255,0.12)" }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full rounded-full border border-white/18 bg-white/[0.07] py-4 text-[13px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-sm transition-all"
                >
                  Login
                </motion.button>
              </Link>
            </motion.div>

            {/* ── Trust badges ── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.68 }}
              className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[11px] text-white/55"
            >
              <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                Verified
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1.5">
                <Lock className="h-3.5 w-3.5 text-sky-300" />
                Secure
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-pink-400/20 bg-pink-500/10 px-3 py-1.5">
                <Heart className="h-3.5 w-3.5 fill-pink-400 text-pink-400" />
                Real Matches
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </LuxuryBackground>
  );
}
