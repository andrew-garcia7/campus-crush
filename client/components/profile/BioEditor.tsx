"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SmilePlus, Wand2 } from "lucide-react";
import Picker, { SuggestionMode, Theme } from "emoji-picker-react";
import { api } from "@/services/api";

const MAX_BIO = 300;

const BIO_TEMPLATES = [
  { label: "Campus coffee ☕", text: "Campus coffee runs, late-night playlists, and conversations that actually go somewhere." },
  { label: "Gym + chai 💪☕", text: "Usually between class, gym, and finding the best chai spot on campus." },
  { label: "Spontaneous 🌙", text: "Equal parts ambitious, romantic, and always down for a campus walk at golden hour." },
  { label: "Banter queen ✨", text: "Looking for someone who can match energy, banter, and spontaneous food plans." },
];

const AI_TONES = [
  { key: "witty",    label: "😏 Witty"    },
  { key: "flirty",   label: "😍 Flirty"   },
  { key: "romantic", label: "💖 Romantic" },
  { key: "funny",    label: "😂 Funny"    },
] as const;

type Tone = typeof AI_TONES[number]["key"];

export function BioEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [aiTone, setAiTone] = useState<Tone>("witty");
  const taRef = useRef<HTMLTextAreaElement>(null);

  const insertEmoji = (emoji: string) => {
    const ta = taRef.current;
    if (!ta) { onChange((value + emoji).slice(0, MAX_BIO)); return; }
    const start = ta.selectionStart ?? value.length;
    const end   = ta.selectionEnd   ?? value.length;
    const next  = (value.slice(0, start) + emoji + value.slice(end)).slice(0, MAX_BIO);
    onChange(next);
    requestAnimationFrame(() => {
      ta.focus();
      const pos = Math.min(start + emoji.length, MAX_BIO);
      ta.setSelectionRange(pos, pos);
    });
  };

  const generateBio = async () => {
    setGenerating(true);
    try {
      const prompt =
        `Write a ${aiTone} dating app bio for a college student. ` +
        `Max 250 characters. No hashtags. Gen Z tone. Be authentic. ` +
        `Reply with ONLY the bio text, no quotes, no extra words.`;
      const res = await api.post("/ai/coach", { prompt });
      const raw = (res.data?.data?.answer || "")
        .replace(/^["']|["']$/g, "")
        .trim()
        .slice(0, MAX_BIO);
      onChange(raw);
    } catch {
      // silently fail — user can retry
    } finally {
      setGenerating(false);
    }
  };

  const chars = value.length;
  const pct   = (chars / MAX_BIO) * 100;
  const isFull = chars >= MAX_BIO;

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-[#2D1810]">Bio</span>
        <motion.button
          type="button"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAI((v) => !v)}
          className="flex items-center gap-1.5 rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-[11px] font-semibold text-[#FF2D78] transition hover:bg-pink-100"
        >
          <Wand2 className="h-3 w-3" />
          AI Bio
        </motion.button>
      </div>

      {/* AI panel */}
      <AnimatePresence>
        {showAI && (
          <motion.div
            key="ai-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-pink-100 bg-pink-50/60 p-4">
              <p className="mb-2.5 text-xs font-semibold text-[#9B7065]">Choose a vibe:</p>
              <div className="mb-3 flex flex-wrap gap-2">
                {AI_TONES.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setAiTone(t.key)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      aiTone === t.key
                        ? "border-[#FF2D78]/50 bg-[#FF2D78]/10 text-[#FF2D78]"
                        : "border-pink-200 bg-white text-[#9B7065] hover:text-[#FF2D78]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => { void generateBio(); setShowAI(false); }}
                disabled={generating}
                className="w-full rounded-full bg-[#FF2D78] py-2.5 text-xs font-bold text-white shadow-[0_4px_18px_rgba(255,45,120,0.35)] disabled:opacity-60"
              >
                {generating ? "Generating…" : "✨ Generate Bio"}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Textarea */}
      <div>
        <div
          className={`relative rounded-2xl border transition-all duration-200 ${
            value
              ? "border-[#FF2D78]/40 shadow-[0_0_12px_rgba(255,45,120,0.08)]"
              : "border-pink-200"
          } bg-[#FFF8F0]`}
        >
          <textarea
            ref={taRef}
            value={value}
            onChange={(e) => onChange(e.target.value.slice(0, MAX_BIO))}
            rows={4}
            placeholder="Write something unforgettable…"
            className="w-full resize-none bg-transparent px-4 py-3.5 pr-11 text-sm text-[#2D1810] outline-none placeholder:text-[#9B7065]/50 leading-relaxed"
          />
          <button
            type="button"
            onClick={() => setShowEmoji((v) => !v)}
            className={`absolute right-3 top-3.5 transition-colors ${
              showEmoji ? "text-[#FF2D78]" : "text-[#9B7065]/60 hover:text-[#FF2D78]"
            }`}
          >
            <SmilePlus className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Progress bar + counter */}
        <div className="mt-1.5 flex items-center gap-2 px-0.5">
          <div className="h-[3px] flex-1 rounded-full bg-pink-100">
            <motion.div
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.3 }}
              className={`h-full rounded-full ${
                isFull ? "bg-rose-500" : pct >= 60 ? "bg-[#FF2D78]" : "bg-pink-400"
              }`}
            />
          </div>
          <span
            className={`flex-shrink-0 text-[10px] tabular-nums ${
              isFull ? "text-rose-500" : "text-[#9B7065]/70"
            }`}
          >
            {chars}/{MAX_BIO}
          </span>
        </div>
      </div>

      {/* Emoji picker */}
      <AnimatePresence>
        {showEmoji && (
          <motion.div
            key="emoji-picker"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden rounded-[18px] border border-pink-100"
          >
            <Picker
              theme={Theme.LIGHT}
              onEmojiClick={(data) => insertEmoji(data.emoji)}
              lazyLoadEmojis
              previewConfig={{ showPreview: false }}
              searchPlaceholder="Search emoji…"
              suggestedEmojisMode={SuggestionMode.RECENT}
              width="100%"
              height={300}
              skinTonesDisabled={false}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick-fill templates */}
      <div className="flex flex-wrap gap-2">
        {BIO_TEMPLATES.map((t) => (
          <motion.button
            key={t.label}
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onChange(t.text)}
            className="rounded-full border border-pink-200 bg-white px-3 py-1.5 text-xs text-[#9B7065] transition hover:border-[#FF2D78]/40 hover:bg-pink-50 hover:text-[#FF2D78]"
          >
            {t.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
