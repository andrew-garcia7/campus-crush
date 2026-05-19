"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Mic, Send, SmilePlus, Sparkles, Volume2, VolumeX, X } from "lucide-react";
import Picker, { SuggestionMode, Theme } from "emoji-picker-react";
import { api } from "@/services/api";
import { useThemeStore } from "@/store/theme-store";
import { useVoiceTools } from "@/hooks/use-voice-tools";

type Msg = { role: "user" | "ai"; text: string };

export function FloatingAIButton() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "ai", text: "Hey! Ask me anything about campus dating or relationships 💜" }
  ]);
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = async () => {
    const prompt = input.trim();
    if (!prompt || loading) return;
    stopListening();
    setInput("");
    setShowEmoji(false);
    setMessages((prev) => [...prev, { role: "user", text: prompt }]);
    setLoading(true);
    try {
      const res = await api.post("/ai/coach", { prompt });
      const answer = res.data?.data?.answer || "Let me think about that...";
      setMessages((prev) => [...prev, { role: "ai", text: answer }]);
    } catch {
      setMessages((prev) => [...prev, { role: "ai", text: "Sorry, I'm having trouble right now. Try again!" }]);
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

  return (
    <>
      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="ai-chat"
            initial={{ opacity: 0, scale: 0.88, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 16 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="fixed bottom-[88px] right-4 z-50 w-[320px] overflow-hidden rounded-[28px] border border-[#f7e7b2]/14 bg-[linear-gradient(180deg,rgba(45,22,50,0.9),rgba(26,10,31,0.95))] shadow-[0_20px_58px_rgba(11,4,13,0.28)] backdrop-blur-2xl md:bottom-6 md:right-6 xl:bottom-8 xl:right-8"
          >
            {/* Header */}
            <div className="flex items-center gap-2.5 border-b border-white/8 px-4 py-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl border border-[#f7e7b2]/22 bg-[linear-gradient(145deg,rgba(249,231,239,0.24),rgba(234,215,155,0.18))] shadow-[0_10px_24px_rgba(8,3,10,0.18)]">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-script text-[1.8rem] leading-none text-white">Cupid AI</p>
                <div className="flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <p className="text-[10px] text-[#d6bbc9]/58">Always online</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-[#d6bbc9]/52 transition-all hover:bg-white/[0.06] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex max-h-[260px] flex-col gap-2 overflow-y-auto px-4 py-3 scrollbar-hide">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * i }}
                  className={`max-w-[88%] rounded-2xl px-3 py-2 text-[12px] leading-relaxed ${m.role === "user" ? "ml-auto border border-[#f7e7b2]/22 bg-[linear-gradient(135deg,#f7e0eb_0%,#f1cfdd_45%,#ead79b_100%)] text-[#2a132f]" : "mr-auto border border-[#f7e7b2]/15 bg-white/[0.07] text-[#fff7fb]"}`}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1">{m.text}</div>
                    {m.role === "ai" && voiceOutputSupported ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (speaking) stopSpeaking();
                          else speak(m.text);
                        }}
                        className="mt-0.5 rounded-md p-1 text-[#f7e7b2]/70 transition hover:bg-white/10 hover:text-white"
                        aria-label="Read aloud"
                      >
                        {speaking ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                      </button>
                    ) : null}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="mr-auto flex items-center gap-1 rounded-2xl border border-fuchsia-300/15 bg-white/[0.07] px-3 py-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-[#f7e7b2]"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.13 }}
                    />
                  ))}
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t border-white/8 px-3 py-2.5">
              <div className="flex gap-2">
                <div className="flex-1 rounded-xl border border-[#f7e7b2]/12 bg-white/[0.07] px-2 py-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void send();
                      }
                    }}
                    placeholder={listening ? "Listening…" : "Ask Cupid AI..."}
                    rows={2}
                    className="w-full resize-none bg-transparent px-1 py-0 text-[12px] text-white outline-none placeholder:text-[#d6bbc9]/45"
                  />
                  <div className="mt-1 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setShowEmoji((current) => !current)}
                        className="rounded-lg p-1 text-[#d6bbc9]/55 transition hover:bg-white/[0.06] hover:text-white"
                        aria-label="Open emoji picker"
                      >
                        <SmilePlus className="h-3.5 w-3.5" />
                      </button>
                      {voiceInputSupported ? (
                        <button
                          type="button"
                          onClick={toggleListening}
                          className={`rounded-lg p-1 transition ${listening ? "bg-rose-500/15 text-rose-300" : "text-[#d6bbc9]/55 hover:bg-white/[0.06] hover:text-white"}`}
                          aria-label={listening ? "Stop voice input" : "Start voice input"}
                        >
                          <Mic className="h-3.5 w-3.5" />
                        </button>
                      ) : null}
                    </div>
                    <span className="text-[10px] text-[#d6bbc9]/45">{input.trim().length}/300</span>
                  </div>
                </div>
                <button
                  onClick={send}
                  disabled={!input.trim() || loading}
                  className="flex h-auto min-h-[44px] w-10 flex-shrink-0 items-center justify-center self-stretch rounded-xl border border-[#f7e7b2]/24 bg-[linear-gradient(135deg,#f7e0eb_0%,#f1cfdd_45%,#ead79b_100%)] shadow-[0_12px_22px_rgba(231,184,164,0.18)] transition-opacity disabled:opacity-40"
                >
                  <Send className="h-3.5 w-3.5 text-[#2a132f]" />
                </button>
              </div>
              <AnimatePresence>
                {showEmoji && (
                  <motion.div
                    key="floating-cupid-emojis"
                    initial={{ opacity: 0, height: 0, y: 6 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: 6 }}
                    className="mt-2 overflow-hidden rounded-[18px] border border-fuchsia-400/15"
                  >
                    <Picker
                      theme={theme === "light" ? Theme.LIGHT : Theme.DARK}
                      onEmojiClick={(data) => insertEmoji(data.emoji)}
                      lazyLoadEmojis
                      previewConfig={{ showPreview: false }}
                      suggestedEmojisMode={SuggestionMode.RECENT}
                      width="100%"
                      height={280}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating trigger button */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        className="fixed bottom-[84px] right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-[#f7e7b2]/24 bg-[linear-gradient(145deg,#f7e0eb_0%,#f1cfdd_48%,#ead79b_100%)] shadow-[0_16px_34px_rgba(231,184,164,0.24)] md:bottom-6 md:right-6 xl:bottom-8 xl:right-8"
        aria-label="Open Cupid AI"
      >
        {/* Pulse ring */}
        <motion.div
          className="absolute h-12 w-12 rounded-full bg-[#fbcfe8]/25"
          animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        />
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
              <X className="h-5 w-5 text-[#2a132f]" />
            </motion.span>
          ) : (
            <motion.span key="brain" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}>
              <Brain className="h-5 w-5 text-[#2a132f]" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
