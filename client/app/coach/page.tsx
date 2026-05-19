"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { Brain, Crown, Mic, Send, SmilePlus, Sparkles, Star, Volume2, VolumeX, Zap } from "lucide-react";
import Picker, { SuggestionMode, Theme } from "emoji-picker-react";
import { DEMO_COACH_SEEDS, getDemoCoachSeed } from "@/lib/demo-content";
import { api } from "@/services/api";
import { useToastStore } from "@/store/toast-store";
import { CoachProfileModal } from "@/components/coach/CoachProfileModal";
import { useThemeStore } from "@/store/theme-store";
import { useVoiceTools } from "@/hooks/use-voice-tools";

type Msg = { role: "user" | "ai"; text: string };

type Coach = {
  _id: string;
  name: string;
  title: string;
  bio: string;
  specialization: string[];
  consultationTypes: Array<"chat" | "video" | "call">;
  pricePerSession: number;
  rating: number;
  reviewsCount: number;
  sessionsCompleted: number;
  avatar: string;
  badges: string[];
  photos?: string[];
  age?: number;
  occupation?: string;
  yearsExperience?: number;
  languages?: string[];
  successStories?: string[];
  testimonials?: Array<{ name: string; text: string; rating: number }>;
  sessionDuration?: number;
};

const SUGGESTIONS = [
  "How do I start a conversation with my crush?",
  "She hasn't replied in 2 days, what do I do?",
  "What's a good first date idea on campus?",
  "How to flirt without being cringe?"
];

export default function CoachPage() {
  const toast = useToastStore((state) => state.push);
  const [messages, setMessages] = useState<Msg[]>([{ role: "ai", text: "Hey! I'm Cupid AI. Ask me anything about texting, dates, mixed signals, or campus romance." }]);
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"coach" | "help">("coach");
  const [activeCoach, setActiveCoach] = useState<Coach | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const theme = useThemeStore((state) => state.theme);
  const {
    listening,
    speaking,
    voiceInputSupported,
    voiceOutputSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  } = useVoiceTools();

  const coachesQuery = useQuery({
    queryKey: ["coaches"],
    queryFn: async () => {
      const response = await api.get("/coaches");
      return response.data?.data || [];
    },
    staleTime: 60_000
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  const send = async (text?: string) => {
    const prompt = (text || input).trim();
    if (!prompt || loading) return;
    stopListening();
    setInput("");
    setShowEmoji(false);
    setMessages((prev) => [...prev, { role: "user", text: prompt }]);
    setLoading(true);
    try {
      const endpoint = mode === "help" ? "/ai/help-now" : "/ai/coach";
      const response = await api.post(endpoint, { prompt });
      const answer = response.data?.data?.answer || "Let me think about that...";
      setMessages((prev) => [...prev, { role: "ai", text: answer }]);
    } catch (error: any) {
      toast({ title: "AI error", message: error?.response?.data?.message || "Could not reach Cupid AI.", variant: "error" });
      setMessages((prev) => [...prev, { role: "ai", text: "Sorry, I'm having trouble connecting. Try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const insertEmoji = (emoji: string) => {
    const textarea = inputRef.current;
    if (!textarea) {
      setInput((current) => `${current}${emoji}`);
      return;
    }
    const start = textarea.selectionStart ?? input.length;
    const end = textarea.selectionEnd ?? input.length;
    const next = `${input.slice(0, start)}${emoji}${input.slice(end)}`;
    setInput(next);
    requestAnimationFrame(() => {
      textarea.focus();
      const caret = start + emoji.length;
      textarea.setSelectionRange(caret, caret);
    });
  };

  const toggleListening = () => {
    if (listening) {
      stopListening();
      return;
    }
    startListening((transcript) => {
      setInput(transcript);
    });
  };

  const coaches = ((coachesQuery.data as Coach[] | undefined) || []).map((coach, index) => {
    const seed = getDemoCoachSeed(coach.name, index);
    return {
      ...seed,
      ...coach,
      avatar: coach.avatar || seed.avatar,
      photos: coach.photos?.length ? coach.photos : seed.photos,
      age: coach.age ?? seed.age,
      occupation: coach.occupation || seed.occupation,
      yearsExperience: coach.yearsExperience ?? seed.yearsExperience,
      languages: coach.languages?.length ? coach.languages : seed.languages,
      successStories: coach.successStories?.length ? coach.successStories : seed.successStories,
      testimonials: coach.testimonials?.length ? coach.testimonials : seed.testimonials,
      sessionDuration: coach.sessionDuration || seed.sessionDuration,
    };
  });
  const displayCoaches = coaches.length > 0 ? coaches : DEMO_COACH_SEEDS;

  return (
    <div className="w-full space-y-4">
      {/* ─── SECTION 1: Cupid AI ─── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-[0_4px_24px_rgba(255,45,120,0.08)]">
        <div className="relative overflow-hidden px-5 pt-6 pb-3">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-purple-500/15 blur-2xl" />
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FF2D78] shadow-[0_4px_12px_rgba(255,45,120,0.4)]">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#2D1810]">Cupid AI</h1>
              <p className="text-xs text-[#9B7065]">Instant AI relationship advice, 24/7</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 px-5 pb-6">
          <div className="flex gap-2">
            <button type="button" onClick={() => setMode("coach")} className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-xs font-medium transition ${mode === "coach" ? "bg-[#FF2D78] text-white shadow-[0_2px_8px_rgba(255,45,120,0.4)]" : "border border-pink-100 bg-pink-50/60 text-[#9B7065]"}`}>
              <Sparkles className="h-3.5 w-3.5" /> Relationship Coach
            </button>
            <button type="button" onClick={() => setMode("help")} className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-xs font-medium transition ${mode === "help" ? "bg-rose-500 text-white shadow-[0_2px_8px_rgba(244,63,94,0.4)]" : "border border-pink-100 bg-pink-50/60 text-[#9B7065]"}`}>
              <Zap className="h-3.5 w-3.5" /> Help Now
            </button>
          </div>

          <div className="space-y-2 pr-1">
            <AnimatePresence initial={false}>
              {messages.map((message, index) => (
                <motion.div key={index} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${message.role === "user" ? "ml-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white" : "mr-auto border border-fuchsia-300/20 bg-white/10 text-purple-50"}`}>
                  {message.role === "ai" ? <span className="mb-0.5 block text-[10px] text-[#FF2D78]">Cupid AI</span> : null}
                  <div className="flex items-start gap-2">
                    <div className="flex-1">{message.text}</div>
                    {message.role === "ai" && voiceOutputSupported ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (speaking) stopSpeaking();
                          else speak(message.text);
                        }}
                        className="mt-0.5 rounded-md p-1 text-[#9B7065] transition hover:bg-pink-50 hover:text-[#FF2D78]"
                        aria-label="Read Cupid AI response aloud"
                      >
                        {speaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                      </button>
                    ) : null}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {loading ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mr-auto flex items-center gap-1.5 rounded-2xl border border-pink-100 bg-pink-50/50 px-4 py-3">
                {[0, 1, 2].map((index) => (
                  <motion.div key={index} className="h-1.5 w-1.5 rounded-full bg-[#FF2D78]" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: index * 0.15 }} />
                ))}
              </motion.div>
            ) : null}
            <div ref={bottomRef} />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((suggestion) => (
              <button key={suggestion} type="button" onClick={() => send(suggestion)} className="rounded-full border border-pink-100 bg-pink-50/60 px-2.5 py-1 text-[11px] text-[#9B7065] transition hover:border-[#FF2D78]/30 hover:text-[#FF2D78]">
                {suggestion}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="flex-1 rounded-2xl border border-pink-100 bg-[#FFF8F0] px-3 py-2.5">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value.slice(0, 500))}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void send();
                    }
                  }}
                  placeholder={listening ? "Listening…" : "Describe your situation..."}
                  rows={2}
                  className="w-full resize-none bg-transparent text-sm text-[#2D1810] outline-none placeholder:text-[#9B7065]/60"
                />
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button type="button" onClick={() => setShowEmoji((current) => !current)} className="rounded-lg p-1 text-[#9B7065] transition hover:bg-pink-50 hover:text-[#FF2D78]" aria-label="Open emoji picker">
                      <SmilePlus className="h-4 w-4" />
                    </button>
                    {voiceInputSupported ? (
                      <button type="button" onClick={toggleListening} className={`rounded-lg p-1 transition ${listening ? "bg-rose-100 text-rose-600" : "text-[#9B7065] hover:bg-pink-50 hover:text-[#FF2D78]"}`} aria-label={listening ? "Stop voice input" : "Start voice input"}>
                        <Mic className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                  <span className="text-[10px] text-[#9B7065]">{ input.trim().length}/500</span>
                </div>
              </div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => send()} disabled={!input.trim() || loading} className="flex h-auto min-h-[52px] w-11 items-center justify-center rounded-2xl bg-[#FF2D78] shadow-[0_4px_12px_rgba(255,45,120,0.4)] disabled:opacity-50">
                <Send className="h-4 w-4 text-white" />
              </motion.button>
            </div>
            <AnimatePresence>
              {showEmoji ? (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden rounded-[20px] border border-pink-100">
                  <Picker
                    theme={theme === "light" ? Theme.LIGHT : Theme.DARK}
                    onEmojiClick={(data) => insertEmoji(data.emoji)}
                    lazyLoadEmojis
                    previewConfig={{ showPreview: false }}
                    suggestedEmojisMode={SuggestionMode.RECENT}
                    width="100%"
                    height={300}
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }} className="overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-[0_4px_24px_rgba(255,45,120,0.08)]">
        <div className="relative overflow-hidden px-5 py-5">
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-yellow-500/12 blur-2xl" />
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-500" />
                <h2 className="text-base font-bold text-[#2D1810]">High Premium Coach Plan</h2>
              </div>
              <p className="text-xs text-[#9B7065]">Priority coach access, one featured mentor session, faster support, and premium booking perks.</p>
            </div>
            <div className="text-right">
                <p className="text-2xl font-bold text-[#2D1810]">₹1,999</p>
              <p className="text-[11px] text-[#9B7065]">per month</p>
            </div>
          </div>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-[#6B4B40]">
            {[
              "1 featured strategist session",
              "Priority slot booking",
              "Premium mentor matching",
              "Fast-track support",
            ].map((perk) => (
              <span key={perk} className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-amber-700">{perk}</span>
            ))}
          </div>
          <Link href="/premium" className="mt-4 inline-flex rounded-full bg-amber-500 px-4 py-2 text-xs font-semibold text-white shadow-[0_4px_12px_rgba(245,158,11,0.4)]">
            View premium plans
          </Link>
        </div>
      </motion.div>

      {/* ─── SECTION 2: Love Strategists ─── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-[0_4px_24px_rgba(255,45,120,0.08)]">
        <div className="relative overflow-hidden px-5 pt-6 pb-3">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-pink-500/15 blur-2xl" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FF2D78] shadow-[0_4px_12px_rgba(255,45,120,0.4)]">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#2D1810]">Love Strategists</h2>
                <p className="text-xs text-[#9B7065]">Tap a mentor to view full profile &amp; book</p>
              </div>
            </div>
            <span className="rounded-full border border-pink-200 bg-pink-50 px-2.5 py-1 text-[11px] font-semibold text-[#FF2D78]">Premium</span>
          </div>
        </div>

        <div className="space-y-3 px-5 pb-6">
          {coachesQuery.isLoading ? Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-28 animate-pulse rounded-2xl bg-pink-50" />) : null}
          {displayCoaches.map((coach) => (
            <motion.button
              key={coach._id}
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveCoach(coach)}
              className="w-full rounded-2xl border border-pink-100 bg-white p-3.5 text-left hover:border-pink-200 hover:bg-pink-50/40 transition-colors"
            >
              <div className="flex gap-3">
                <img src={coach.avatar} alt={coach.name} className="h-16 w-16 rounded-2xl object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-[#2D1810]">{coach.name}</h3>
                      <p className="text-xs text-[#FF2D78]">{coach.title}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-amber-600 flex-shrink-0">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {coach.rating.toFixed(1)}
                    </div>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#9B7065]">{coach.bio}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs font-semibold text-[#2D1810]">₹{coach.pricePerSession}/session</p>
                    <p className="text-[11px] text-[#9B7065]">{coach.sessionsCompleted}+ sessions</p>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[#9B7065]">
                    {coach.occupation ? <span>{coach.occupation}</span> : null}
                    {coach.yearsExperience != null ? <span>{coach.yearsExperience} yrs exp</span> : null}
                    {coach.languages?.length ? <span>{coach.languages.slice(0, 2).join(", ")}</span> : null}
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Coach profile modal */}
      {activeCoach && (
        <CoachProfileModal coach={activeCoach} onClose={() => setActiveCoach(null)} />
      )}
    </div>
  );
}