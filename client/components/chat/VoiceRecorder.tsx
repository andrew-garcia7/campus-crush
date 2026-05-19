"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Mic, Square, Trash2 } from "lucide-react";

export function VoiceRecorder({ onRecorded, disabled }: { onRecorded: (blob: Blob, durationSec: number) => void; disabled?: boolean }) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Use a ref so recorder.onstop always reads the latest elapsed value (avoids stale closure)
  const elapsedRef = useRef(0);

  const stopTimer = () => {
    if (!timerRef.current) return;
    clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const start = async () => {
    if (disabled) return;
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      // Microphone permission denied or device not available — fail silently
      return;
    }
    const recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (e) => chunks.current.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks.current, { type: "audio/webm" });
      const durationSec = elapsedRef.current;
      chunks.current = [];
      stopTimer();
      elapsedRef.current = 0;
      setElapsed(0);
      onRecorded(blob, durationSec);
      stream.getTracks().forEach((t) => t.stop());
    };
    mediaRecorderRef.current = recorder;
    recorder.start();
    elapsedRef.current = 0;
    setElapsed(0);
    timerRef.current = setInterval(() => {
      elapsedRef.current += 1;
      setElapsed((v) => v + 1);
    }, 1000);
    setRecording(true);
  };

  const stop = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const cancel = () => {
    stopTimer();
    chunks.current = [];
    mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
    mediaRecorderRef.current = null;
    setElapsed(0);
    setRecording(false);
  };

  useEffect(() => () => {
    stopTimer();
    elapsedRef.current = 0;
    mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
  }, []);

  const formatTime = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  if (recording) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600">
        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="h-2 w-2 rounded-full bg-rose-400" />
        <div className="flex items-center gap-0.5">
          {[8, 14, 10, 16, 9].map((height, index) => (
            <motion.span
              key={height}
              animate={{ height: [4, height, 5] }}
              transition={{ repeat: Infinity, duration: 0.8, delay: index * 0.08 }}
              className="w-1 rounded-full bg-rose-300"
            />
          ))}
        </div>
        <span className="min-w-[40px]">{formatTime(elapsed)}</span>
        <button type="button" onClick={stop} className="rounded-full bg-rose-100 p-1.5 text-rose-600">
          <Square className="h-3.5 w-3.5 fill-current" />
        </button>
        <button type="button" onClick={cancel} className="rounded-full bg-pink-50 p-1.5 text-[#9B7065]">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={start}
      disabled={disabled}
      className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-pink-100 bg-pink-50 text-[#9B7065] transition hover:border-[#FF2D78] hover:text-[#FF2D78] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Mic className="h-4.5 w-4.5" />
    </button>
  );
}
