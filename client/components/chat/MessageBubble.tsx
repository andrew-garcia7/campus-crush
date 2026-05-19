"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, CheckCheck, ImageIcon, MoreHorizontal, Pause, Play, Reply, SmilePlus, Trash2 } from "lucide-react";
import type { ChatMessage } from "./chat-types";

const REACTION_SET = ["❤️", "😂", "🔥", "😍", "👍", "😭"];

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function AudioBubble({ src, durationSec, mine }: { src: string; durationSec?: number; mine?: boolean }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setProgress(audio.duration ? audio.currentTime / audio.duration : 0);
    };
    const onEnded = () => setPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    await audio.play();
    setPlaying(true);
  };

  return (
    <div className={`mt-2 flex min-w-[220px] items-center gap-3 rounded-2xl border px-3 py-2 ${mine ? "border-white/20 bg-white/15" : "border-pink-100 bg-pink-50/40"}`}>
      <audio ref={audioRef} src={src} preload="metadata" />
      <button type="button" onClick={togglePlayback} className={`rounded-full p-2 ${mine ? "bg-white/20 text-white" : "bg-pink-100 text-[#9B7065]"}`}>
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>
      <div className="flex flex-1 items-center gap-1">
        {Array.from({ length: 18 }).map((_, index) => {
          const active = index / 18 <= progress;
          const height = 6 + (index % 6) * 3;
          return <span key={index} className={`w-1 rounded-full ${active ? (mine ? "bg-white" : "bg-[#FF2D78]") : (mine ? "bg-white/30" : "bg-pink-200")}`} style={{ height }} />;
        })}
      </div>
      <span className={`text-[11px] ${mine ? "text-white/70" : "text-[#9B7065]"}`}>{durationSec ? `${durationSec}s` : "Voice"}</span>
    </div>
  );
}

interface MessageBubbleProps {
  message: ChatMessage;
  onReact: (messageId: string, reaction: string) => void;
  onReply: (message: ChatMessage) => void;
  onDelete: (messageId: string) => void;
}

export function MessageBubble({ message, onReact, onReply, onDelete }: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);

  const groupedReactions = useMemo(() => {
    const counts = new Map<string, number>();
    message.reactions.forEach((reaction) => counts.set(reaction.emoji, (counts.get(reaction.emoji) || 0) + 1));
    return Array.from(counts.entries());
  }, [message.reactions]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex ${message.mine ? "justify-end" : "justify-start"}`}
    >
      <div className={`max-w-[85%] ${message.mine ? "items-end" : "items-start"} flex flex-col`}>
        <AnimatePresence>
          {showActions ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className={`mb-2 flex flex-wrap items-center gap-1 rounded-full border border-pink-100 bg-white px-2 py-1 shadow-md ${message.mine ? "self-end" : "self-start"}`}
            >
              {REACTION_SET.map((reaction) => (
                <button key={reaction} type="button" onClick={() => { onReact(message.id, reaction); setShowActions(false); }} className="rounded-full px-2 py-1 text-sm hover:bg-pink-50">
                  {reaction}
                </button>
              ))}
              <button type="button" onClick={() => onReply(message)} className="rounded-full bg-pink-50 p-1.5 text-[#9B7065] hover:bg-pink-100">
                <Reply className="h-3.5 w-3.5" />
              </button>
              {message.mine ? (
                <button type="button" onClick={() => onDelete(message.id)} className="rounded-full bg-pink-50 p-1.5 text-[#9B7065] hover:bg-pink-100">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div
          className={`rounded-[24px] border px-3.5 py-2.5 shadow-sm ${
            message.mine
              ? "border-pink-300/30 bg-gradient-to-br from-[#FF2D78] to-[#ff6aa0] text-white"
              : "border-pink-100 bg-white text-[#2D1810]"
          }`}
        >
          {message.replyPreview ? (
            <div className={`mb-2 rounded-2xl border px-3 py-2 text-xs ${message.mine ? "border-white/20 bg-white/15" : "border-pink-100 bg-pink-50/60"}`}>
              <p className={`font-medium ${message.mine ? "text-white/90" : "text-[#FF2D78]"}`}>{message.replyPreview.senderName}</p>
              <p className={`truncate ${message.mine ? "text-white/70" : "text-[#2D1810]/70"}`}>{message.replyPreview.text || `Shared ${message.replyPreview.type}`}</p>
            </div>
          ) : null}

          {message.deleted ? (
            <p className={`text-sm italic ${message.mine ? "text-white/65" : "text-[#9B7065]"}`}>This message was deleted</p>
          ) : (
            <>
              {message.text ? <p className="whitespace-pre-wrap break-words text-sm leading-6">{message.text}</p> : null}
              {message.imageUrl ? (
                <div className="mt-2 overflow-hidden rounded-2xl border border-white/10 bg-black/10">
                  <img src={message.imageUrl} alt="Shared in chat" className="max-h-72 w-full object-cover" />
                </div>
              ) : null}
              {message.audioUrl ? <AudioBubble src={message.audioUrl} durationSec={message.durationSec} mine={message.mine} /> : null}
            </>
          )}

          <div className={`mt-2 flex items-center justify-between gap-3 text-[11px] ${message.mine ? "text-white/70" : "text-[#9B7065]"}`}>
            <div className="flex items-center gap-1.5">
              {message.type === "image" ? <ImageIcon className="h-3.5 w-3.5" /> : null}
              <span>{formatTime(message.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setShowActions((current) => !current)} className={`rounded-full p-1 ${message.mine ? "bg-white/15 text-white/80 hover:text-white" : "bg-pink-50 text-[#9B7065] hover:text-[#FF2D78]"}`}>
                {showActions ? <MoreHorizontal className="h-3.5 w-3.5" /> : <SmilePlus className="h-3.5 w-3.5" />}
              </button>
              {message.mine ? (
                message.seen ? <CheckCheck className="h-3.5 w-3.5 text-cyan-300" /> : <Check className="h-3.5 w-3.5 text-white/80" />
              ) : null}
            </div>
          </div>
        </div>

        {groupedReactions.length ? (
          <div className={`mt-1 flex flex-wrap gap-1 ${message.mine ? "justify-end" : "justify-start"}`}>
            {groupedReactions.map(([emoji, count]) => (
              <button
                key={emoji}
                type="button"
                onClick={() => onReact(message.id, emoji)}
              className="rounded-full border border-pink-100 bg-white px-2 py-0.5 text-xs text-[#2D1810] shadow-sm"
              >
                {emoji} {count}
              </button>
            ))}
          </div>
        ) : null}

        <p className={`mt-1 text-[10px] ${message.mine ? "text-right text-[#9B7065]" : "text-[#9B7065]/70"}`}>
          {message.mine ? (message.seen ? "Seen" : message.delivered ? "Delivered" : "Sending") : "Tap smile to react"}
        </p>
      </div>
    </motion.div>
  );
}
