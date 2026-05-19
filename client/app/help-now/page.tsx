"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Send, Brain } from "lucide-react";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/auth-store";

type Message = { role: "user" | "ai"; text: string };

const QUICK_SITUATIONS = [
  "My crush is walking toward me right now! 😨",
  "They just texted me, what should I reply?",
  "I want to ask them out but I'm scared",
  "They liked my post — now what?",
];

export default function HelpNowPage() {
  const token = useAuthStore((s) => s.token);
  // Auth hydration is handled globally by ClientProviders/AuthBootstrap.
  const [msgs, setMsgs] = useState<Message[]>([
    { role: "ai", text: "🚨 I'm here! What's happening RIGHT NOW? Tell me the situation and I'll give you real-time advice!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ block: "end" }); }, [msgs]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    const userMsg = text.trim();
    setInput("");
    setMsgs((p) => [...p, { role: "user", text: userMsg }]);
    setLoading(true);
    try {
      const res = await api.post("/ai/help-now", { message: userMsg }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const reply = res.data?.data?.reply || "Give me a moment to think... You've got this! 💪";
      setMsgs((p) => [...p, { role: "ai", text: reply }]);
    } catch {
      setMsgs((p) => [...p, { role: "ai", text: "Stay calm, breathe, and be yourself. You've got this! 🌟" }]);
    }
    setLoading(false);
  };

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[36px] border border-fuchsia-300/20 bg-[#120522]/70 shadow-[0_0_45px_rgba(196,70,255,0.3)] backdrop-blur-xl"
      >
        {/* Header */}
        <div className="relative px-5 pt-6 pb-4">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-rose-500/15 blur-2xl" />
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-fuchsia-600 shadow-[0_0_16px_rgba(244,63,94,0.5)]">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Live Help Now 🚨</h1>
              <p className="text-xs text-rose-300/80">Real-time AI dating coach — always on</p>
            </div>
            <div className="ml-auto flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-500/15 px-2 py-1 text-[10px] text-emerald-200">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </div>
          </div>
        </div>

        {/* Quick situations */}
        <div className="px-5 pb-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {QUICK_SITUATIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="flex-shrink-0 rounded-full border border-rose-400/25 bg-rose-500/10 px-3 py-1.5 text-[10px] text-rose-200/80 hover:border-rose-400/50 transition-colors"
              >
                {s.length > 30 ? s.slice(0, 30) + "…" : s}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-3 px-5 pb-3">
          <AnimatePresence initial={false}>
            {msgs.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "ai" && (
                  <div className="mr-2 mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-fuchsia-500">
                    <Brain className="h-3.5 w-3.5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "rounded-tr-sm bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white"
                      : "rounded-tl-sm border border-rose-400/20 bg-rose-500/10 text-rose-100"
                  }`}
                >
                  {m.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <div className="flex justify-start gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-fuchsia-500">
                <Brain className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="rounded-2xl rounded-tl-sm border border-rose-400/20 bg-rose-500/10 px-4 py-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div key={i} animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                      className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-5 pb-6 pt-3">
          <div className="flex items-end gap-2 rounded-2xl border border-rose-400/25 bg-white/[0.05] p-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
              placeholder="What's happening right now? Get instant advice..."
              rows={2}
              className="flex-1 resize-none bg-transparent text-sm text-white outline-none placeholder:text-purple-400/40"
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => send(input)}
              disabled={loading || !input.trim()}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-fuchsia-600 shadow-[0_0_14px_rgba(244,63,94,0.4)] disabled:opacity-50"
            >
              <Send className="h-4 w-4 text-white" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
