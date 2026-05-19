"use client";

import { Camera, CameraOff, Mic, MicOff, PhoneOff, RotateCcw, Volume2, VolumeX } from "lucide-react";

interface CallControlsProps {
  muted: boolean;
  speakerOn: boolean;
  cameraOff?: boolean;
  onMute: () => void;
  onSpeaker: () => void;
  onCamera?: () => void;
  onSwitchCamera?: () => void;
  onEnd: () => void;
}

export function CallControls({ muted, speakerOn, cameraOff, onMute, onSpeaker, onCamera, onSwitchCamera, onEnd }: CallControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 rounded-[28px] border border-purple-300/15 bg-black/35 p-3 backdrop-blur-xl">
      <button onClick={onMute} className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/15">
        {muted ? <MicOff className="h-4.5 w-4.5" /> : <Mic className="h-4.5 w-4.5" />}
      </button>
      <button onClick={onSpeaker} className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/15">
        {speakerOn ? <Volume2 className="h-4.5 w-4.5" /> : <VolumeX className="h-4.5 w-4.5" />}
      </button>
      {onCamera ? (
        <button onClick={onCamera} className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/15">
          {cameraOff ? <CameraOff className="h-4.5 w-4.5" /> : <Camera className="h-4.5 w-4.5" />}
        </button>
      ) : null}
      {onSwitchCamera ? (
        <button onClick={onSwitchCamera} className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/15">
          <RotateCcw className="h-4.5 w-4.5" />
        </button>
      ) : null}
      <button onClick={onEnd} className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-white shadow-[0_0_18px_rgba(239,68,68,0.35)] transition hover:bg-red-400">
        <PhoneOff className="h-4.5 w-4.5" />
      </button>
    </div>
  );
}
