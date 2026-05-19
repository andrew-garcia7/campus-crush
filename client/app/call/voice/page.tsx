"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { VoiceCallRoom } from "@/components/calls/VoiceCallRoom";
import { useRouter } from "next/navigation";
import { PhoneCall } from "lucide-react";

export default function VoiceCallPage() {
  const [active, setActive] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [callerName, setCallerName] = useState("");
  const [photo, setPhoto] = useState("");
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCallerName(params.get("name") || "Campus Crush");
    setPhoto(params.get("photo") || "");
  }, []);

  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [active]);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="mx-auto w-full max-w-[430px]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-[36px] border border-fuchsia-300/20 bg-[#120522]/70 shadow-[0_0_45px_rgba(196,70,255,0.3)] backdrop-blur-xl"
        style={{ minHeight: 760 }}
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="px-5 pt-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-[0_0_20px_rgba(16,185,129,0.35)]">
              <PhoneCall className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Audio Call</h2>
              <p className="text-xs text-purple-300/60">{fmt(seconds)} · End-to-end encrypted</p>
            </div>
          </div>
        </div>
        {active ? (
          <div className="px-5 pb-6">
            <VoiceCallRoom callerName={callerName} photo={photo} durationLabel={fmt(seconds)} onEnd={() => { setActive(false); router.back(); }} />
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}
