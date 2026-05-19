"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MatchCelebration } from "@/components/match/MatchCelebration";

export default function MatchSuccessPage() {
  const [open, setOpen] = useState(true);

  return (
    <div className="mx-auto w-full max-w-[430px]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-[36px] border border-fuchsia-300/20 bg-[#120522]/70 shadow-[0_0_45px_rgba(196,70,255,0.3)] backdrop-blur-xl"
        style={{ minHeight: 730 }}
      >
        <div className="flex flex-col items-center gap-4 px-5 py-10 text-center">
          <p className="text-4xl">💜</p>
          <h1 className="text-2xl font-bold text-white">It's a Match!</h1>
          <p className="text-sm text-purple-300/70">You and your campus crush liked each other.</p>
          <button onClick={() => setOpen(true)} className="mt-4 rounded-full border border-purple-300/35 bg-white/10 px-6 py-2.5 text-sm text-purple-100">
            Replay Match Animation
          </button>
        </div>
      </motion.div>
      <MatchCelebration
        open={open}
        firstUserImage=""
        secondUserImage=""
        firstName="You"
        secondName="Arjun"
        onSendMessage={() => (window.location.href = "/chat")}
        onKeepSwiping={() => (window.location.href = "/discover")}
      />
    </div>
  );
}
