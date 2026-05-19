"use client";

import { motion } from "framer-motion";
import { CallControls } from "./CallControls";
import { useWebRTC } from "./useWebRTC";
import { Phone } from "lucide-react";

export function VoiceCallRoom({ onEnd, callerName, photo, durationLabel }: { onEnd: () => void; callerName: string; photo?: string; durationLabel: string }) {
  const { muted, speakerOn, toggleMute, toggleSpeaker } = useWebRTC({ audioOnly: true });

  return (
    <div className="space-y-6 px-1 pb-4 pt-3">
      <div className="flex flex-col items-center justify-center rounded-[32px] border border-purple-300/15 bg-white/[0.04] px-6 py-10 text-center">
        <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 2.2 }} className="relative mb-5">
          <div className="absolute inset-0 rounded-full bg-fuchsia-500/20 blur-xl" />
          <div className="relative h-28 w-28 rounded-full border border-fuchsia-400/35 bg-gradient-to-br from-purple-600/40 to-pink-600/30 bg-cover bg-center" style={photo ? { backgroundImage: `url(${photo})` } : {}} />
        </motion.div>
        <p className="text-xl font-semibold text-white">{callerName}</p>
        <p className="mt-1 text-sm text-purple-300/60">{durationLabel} · Crystal clear audio</p>
        <div className="mt-5 flex items-center gap-1.5">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <motion.span
              key={index}
              animate={{ height: [8, 24 + (index % 3) * 8, 8] }}
              transition={{ repeat: Infinity, duration: 0.9, delay: index * 0.08 }}
              className="w-1.5 rounded-full bg-fuchsia-300"
            />
          ))}
        </div>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
          <Phone className="h-3.5 w-3.5" /> Connected
        </div>
      </div>
      <CallControls
        muted={muted}
        speakerOn={speakerOn}
        onMute={toggleMute}
        onSpeaker={toggleSpeaker}
        onEnd={onEnd}
      />
    </div>
  );
}
