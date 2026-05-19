"use client";

import { motion } from "framer-motion";
import { CallControls } from "./CallControls";
import { useWebRTC } from "./useWebRTC";

export function VideoCallRoom({ onEnd, callerName, photo, durationLabel }: { onEnd: () => void; callerName: string; photo?: string; durationLabel: string }) {
  const { localVideoRef, muted, cameraOff, speakerOn, toggleMute, toggleCamera, toggleSpeaker, switchCamera } = useWebRTC();

  return (
    <div className="space-y-4 px-1 pb-4 pt-2">
      <div className="relative overflow-hidden rounded-[32px] border border-purple-300/15 bg-black/55">
        <div className="flex h-[430px] items-center justify-center bg-gradient-to-br from-[#19092f] via-[#120522] to-[#09020f]">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="h-24 w-24 rounded-full border border-fuchsia-400/35 bg-gradient-to-br from-purple-600/40 to-pink-600/30 bg-cover bg-center" style={photo ? { backgroundImage: `url(${photo})` } : {}} />
            <div>
              <p className="text-lg font-semibold text-white">{callerName}</p>
              <p className="text-sm text-purple-300/60">{durationLabel} · Live video</p>
            </div>
          </div>
        </div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-4 right-4 overflow-hidden rounded-[24px] border border-fuchsia-400/20 bg-black/50 shadow-2xl">
          <video ref={localVideoRef} autoPlay playsInline muted className="h-40 w-28 bg-black object-cover sm:h-44 sm:w-32" />
          <div className="absolute left-2 top-2 rounded-full bg-black/40 px-2 py-0.5 text-[10px] text-white/85">You</div>
        </motion.div>
      </div>
      <CallControls
        muted={muted}
        speakerOn={speakerOn}
        cameraOff={cameraOff}
        onMute={toggleMute}
        onSpeaker={toggleSpeaker}
        onCamera={toggleCamera}
        onSwitchCamera={switchCamera}
        onEnd={onEnd}
      />
    </div>
  );
}
