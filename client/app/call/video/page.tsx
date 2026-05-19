"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { VideoCallRoom } from "@/components/calls/VideoCallRoom";
import { Video } from "lucide-react";
import { useRouter } from "next/navigation";

export default function VideoCallPage() {
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

  if (!active) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="rounded-3xl border border-purple-400/20 bg-[#120522]/80 p-8 text-center">
          <p className="text-xl font-bold text-white mb-2">Call Ended</p>
          <p className="text-sm text-purple-300/60 mb-4">Duration: {fmt(seconds)}</p>
          <button onClick={() => router.back()} className="rounded-full bg-purple-600 px-6 py-2 text-sm text-white">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[430px]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden rounded-[36px] border border-fuchsia-300/20 bg-[#120522]/80 shadow-[0_0_45px_rgba(196,70,255,0.3)] backdrop-blur-xl"
        style={{ minHeight: 760 }}
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-pink-500/20 blur-3xl" />
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-500 shadow-[0_0_20px_rgba(217,70,239,0.35)]">
              <Video className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{callerName}</h2>
              <p className="text-xs text-emerald-300">{fmt(seconds)} · Encrypted</p>
            </div>
          </div>
          <div className="text-xs text-purple-300/60">HD · 30fps</div>
        </div>
        <div className="mx-5 mb-4">
          <VideoCallRoom callerName={callerName} photo={photo} durationLabel={fmt(seconds)} onEnd={() => setActive(false)} />
        </div>
        <div className="px-5 pb-6 text-center text-[11px] text-purple-400/40">
          Tap the controls below the video to mute, flip cameras, or end the call.
        </div>
      </motion.div>
    </div>
  );
}
