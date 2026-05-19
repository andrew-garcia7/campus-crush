"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Plus, SmilePlus, Trash2 } from "lucide-react";
import Picker, { SuggestionMode, Theme } from "emoji-picker-react";

export type PromptCard = {
  question: string;
  answer: string;
};

const ALL_PROMPTS = [
  "Most spontaneous thing I've done…",
  "My ideal campus date is…",
  "I'll fall for you if…",
  "Biggest green flag I look for…",
  "Perfect chai partner if…",
  "The way to my heart is…",
  "I'm lowkey obsessed with…",
  "Two truths and a lie…",
  "A hot take I stand by…",
  "My love language is…",
  "Current anthem on repeat…",
  "I'm the type of person who…",
  "Life goal that scares me…",
  "I get irrationally excited about…",
  "Describe yourself in 3 emojis…",
  "My campus routine includes…",
  "Swipe right if you also…",
  "My friends would describe me as…",
];

const MAX_ANSWER = 200;

// ─── Single prompt card ───────────────────────────────────────────────────────

function PromptCardItem({
  card,
  onChangeQuestion,
  onChangeAnswer,
  onRemove,
}: {
  card: PromptCard;
  onChangeQuestion: (q: string) => void;
  onChangeAnswer: (a: string) => void;
  onRemove: () => void;
}) {
  const [showQPicker, setShowQPicker] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const insertEmoji = (emoji: string) => {
    const ta  = taRef.current;
    const ans = card.answer;
    if (!ta) { onChangeAnswer((ans + emoji).slice(0, MAX_ANSWER)); return; }
    const start = ta.selectionStart ?? ans.length;
    const end   = ta.selectionEnd   ?? ans.length;
    const next  = (ans.slice(0, start) + emoji + ans.slice(end)).slice(0, MAX_ANSWER);
    onChangeAnswer(next);
    requestAnimationFrame(() => {
      ta.focus();
      const pos = Math.min(start + emoji.length, MAX_ANSWER);
      ta.setSelectionRange(pos, pos);
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.22 }}
      className="relative overflow-hidden rounded-2xl border border-pink-200 bg-white shadow-[0_2px_12px_rgba(255,45,120,0.08)]"
    >
      {/* Left accent stripe */}
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[#FF2D78] to-pink-400" />

      <div className="p-4 pl-5">
        {/* Question selector */}
        <div className="relative mb-3">
          <button
            type="button"
            onClick={() => setShowQPicker((v) => !v)}
            className="flex w-full items-center gap-2 rounded-xl border border-pink-200 bg-[#FFF8F0] px-3 py-2 text-left transition hover:border-[#FF2D78]/40"
          >
            <span className="flex-1 truncate text-xs font-semibold text-[#2D1810]">
              {card.question || "Choose a prompt…"}
            </span>
            <ChevronDown
              className={`h-3.5 w-3.5 flex-shrink-0 text-[#9B7065] transition-transform ${
                showQPicker ? "rotate-180" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {showQPicker && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 max-h-52 overflow-y-auto rounded-xl border border-pink-100 bg-white py-1 shadow-[0_8px_24px_rgba(255,45,120,0.10)]"
              >
                {ALL_PROMPTS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => { onChangeQuestion(q); setShowQPicker(false); }}
                    className={`w-full rounded-lg px-3.5 py-2.5 text-left text-xs transition hover:bg-pink-50 ${
                      card.question === q
                        ? "bg-pink-50 text-[#FF2D78] font-medium"
                        : "text-[#2D1810]"
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Answer textarea */}
        <div className="relative">
          <textarea
            ref={taRef}
            value={card.answer}
            onChange={(e) => onChangeAnswer(e.target.value.slice(0, MAX_ANSWER))}
            placeholder="Your answer…"
            rows={3}
            className="w-full resize-none rounded-xl border border-pink-200 bg-[#FFF8F0] px-3.5 py-2.5 pr-10 text-sm text-[#2D1810] outline-none placeholder:text-[#9B7065]/50 focus:border-[#FF2D78]/50 transition-colors leading-relaxed"
          />
          {/* Emoji toggle */}
          <button
            type="button"
            onClick={() => setShowEmoji((v) => !v)}
            className={`absolute right-3 top-2.5 transition-colors ${
              showEmoji ? "text-[#FF2D78]" : "text-[#9B7065]/50 hover:text-[#FF2D78]"
            }`}
          >
            <SmilePlus className="h-4 w-4" />
          </button>
          {/* Char count */}
          <span className="absolute bottom-2.5 right-3 text-[10px] tabular-nums text-[#9B7065]/50">
            {card.answer.length}/{MAX_ANSWER}
          </span>
        </div>

        {/* Emoji picker */}
        <AnimatePresence>
          {showEmoji && (
            <motion.div
              key="emoji"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 overflow-hidden rounded-[18px] border border-pink-100"
            >
              <Picker
                theme={Theme.LIGHT}
                onEmojiClick={(data) => insertEmoji(data.emoji)}
                lazyLoadEmojis
                previewConfig={{ showPreview: false }}
                searchPlaceholder="Search emoji…"
                suggestedEmojisMode={SuggestionMode.RECENT}
                width="100%"
                height={260}
                skinTonesDisabled={false}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Remove */}
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-3 top-3 rounded-full p-1.5 text-[#9B7065]/40 transition hover:bg-rose-50 hover:text-rose-500"
        aria-label="Remove prompt"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}

// ─── Editor container ─────────────────────────────────────────────────────────

export function PromptsEditor({
  value,
  onChange,
}: {
  value: PromptCard[];
  onChange: (v: PromptCard[]) => void;
}) {
  const addPrompt = () => {
    if (value.length >= 3) return;
    const used    = new Set(value.map((c) => c.question));
    const unused  = ALL_PROMPTS.filter((q) => !used.has(q));
    const question = unused[0] ?? ALL_PROMPTS[0];
    onChange([...value, { question, answer: "" }]);
  };

  const updateQuestion = (index: number, q: string) => {
    const next = [...value];
    next[index] = { ...next[index], question: q };
    onChange(next);
  };

  const updateAnswer = (index: number, a: string) => {
    const next = [...value];
    next[index] = { ...next[index], answer: a };
    onChange(next);
  };

  const removeCard = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[#2D1810]">Personality Prompts</p>
          <p className="text-xs text-[#9B7065]">Hinge-style cards · up to 3</p>
        </div>
        <motion.span
          key={value.length}
          animate={{ scale: [1.15, 1] }}
          transition={{ duration: 0.2 }}
          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
            value.length >= 3
              ? "border-[#FF2D78]/40 bg-pink-50 text-[#FF2D78]"
              : "border-pink-200 bg-pink-50/60 text-[#9B7065]"
          }`}
        >
          {value.length}/3
        </motion.span>
      </div>

      {/* Cards */}
      <AnimatePresence initial={false} mode="popLayout">
        {value.map((card, i) => (
          <PromptCardItem
            key={`prompt-${i}`}
            card={card}
            onChangeQuestion={(q) => updateQuestion(i, q)}
            onChangeAnswer={(a) => updateAnswer(i, a)}
            onRemove={() => removeCard(i)}
          />
        ))}
      </AnimatePresence>

      {/* Add button */}
      {value.length < 3 && (
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={addPrompt}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-pink-200 bg-pink-50/40 py-4 text-sm text-[#9B7065] transition hover:border-[#FF2D78]/50 hover:bg-pink-50 hover:text-[#FF2D78]"
        >
          <Plus className="h-4 w-4" />
          Add prompt card
        </motion.button>
      )}
    </div>
  );
}
