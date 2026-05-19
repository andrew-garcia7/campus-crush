"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Sparkles, X, Heart, MessageCircle, Send, SmilePlus } from "lucide-react";
import Picker, { SuggestionMode, Theme } from "emoji-picker-react";
import { useQueryClient } from "@tanstack/react-query";
import { mutate } from "swr";
import { SwipeCard } from "./SwipeCard";
import { useSwipeDeck } from "./useSwipeDeck";
import { MatchCelebration } from "@/components/match/MatchCelebration";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/auth-store";
import { useToastStore } from "@/store/toast-store";
import type { DiscoverProfile, SwipeAction } from "./swipe-types";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface SwipeDeckProps {
  profiles: DiscoverProfile[];
  onCardClick?: (profile: DiscoverProfile) => void;
}

interface MatchState {
  name: string;
  image: string;
  currentUserImage: string;
  currentUserName: string;
}

// ─── Daily usage limits ─────────────────────────────────────────────────────────

type ActionKey = "like" | "dislike" | "superlike" | "rose" | "compliment";

const FREE_LIMITS: Record<ActionKey, number> = {
  like: 15,
  dislike: 999,
  superlike: 1,
  rose: 2,
  compliment: 3,
};

const PREMIUM_LIMITS: Record<ActionKey, number> = {
  like: 999,
  dislike: 999,
  superlike: 10,
  rose: 10,
  compliment: 999,
};

function todayKey() {
  return `cc_usage_${new Date().toISOString().slice(0, 10)}`;
}

function readUsage(): Record<ActionKey, number> {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(todayKey()) : null;
    return raw ? JSON.parse(raw) : { like: 0, dislike: 0, superlike: 0, rose: 0, compliment: 0 };
  } catch {
    return { like: 0, dislike: 0, superlike: 0, rose: 0, compliment: 0 };
  }
}

function writeUsage(u: Record<ActionKey, number>) {
  try {
    localStorage.setItem(todayKey(), JSON.stringify(u));
    for (const k of Object.keys(localStorage)) {
      if (k.startsWith("cc_usage_") && k !== todayKey()) localStorage.removeItem(k);
    }
  } catch { /* noop */ }
}

function useDaily(isPremium: boolean) {
  const limits = isPremium ? PREMIUM_LIMITS : FREE_LIMITS;
  const [usage, setUsage] = useState<Record<ActionKey, number>>(readUsage);

  const remaining = (a: ActionKey) => Math.max(0, limits[a] - (usage[a] || 0));
  const canUse = (a: ActionKey) => remaining(a) > 0;

  const consume = (a: ActionKey) => {
    const u = { ...usage, [a]: (usage[a] || 0) + 1 };
    setUsage(u);
    writeUsage(u);
  };

  // null = unlimited (no badge shown); number = remaining count
  const badge = (a: ActionKey): number | null => {
    if (limits[a] === 999) return null;
    return remaining(a);
  };

  return { remaining, canUse, consume, badge };
}

// ─── Reaction overlays ─────────────────────────────────────────────────────────

function HeartBurst({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <div className="pointer-events-none absolute inset-0 z-40 flex items-end justify-center overflow-hidden">
          {Array.from({ length: 9 }).map((_, i) => {
            const angle = -160 + (i / 8) * 140;
            const rad = (angle * Math.PI) / 180;
            const dist = 70 + (i % 3) * 35;
            return (
              <motion.span
                key={i}
                className="absolute bottom-1/3 select-none text-xl"
                initial={{ opacity: 1, x: 0, y: 0, scale: 0.5 }}
                animate={{
                  opacity: [1, 1, 0],
                  x: Math.cos(rad) * dist,
                  y: Math.sin(rad) * dist - 40,
                  scale: [0.5, 1.5, 0.9],
                }}
                transition={{ duration: 0.65, ease: "easeOut", delay: i * 0.04 }}
              >
                ❤️
              </motion.span>
            );
          })}
        </div>
      )}
    </AnimatePresence>
  );
}

function RoseFloat({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center"
          initial={{ y: 140, opacity: 0 }}
          animate={{ y: [140, 10, -30], opacity: [0, 1, 1, 0], scale: [0.6, 1.2, 1.1, 0.95] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.85, ease: "easeOut" }}
        >
          <div className="relative flex flex-col items-center">
            <span className="select-none text-7xl drop-shadow-[0_0_28px_rgba(255,105,180,0.9)]">🌹</span>
            <motion.div
              className="absolute inset-[-16px] rounded-full bg-pink-500/20"
              animate={{ scale: [1, 2.8], opacity: [0.7, 0] }}
              transition={{ duration: 0.75, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function BubblePop({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.2 }}
          animate={{ opacity: [0, 1, 1, 0], scale: [0.2, 1.5, 1.2, 0.8] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.58, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <span className="select-none text-7xl drop-shadow-[0_0_24px_rgba(99,102,241,0.9)]">💬</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function StarPulse({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="relative flex items-center justify-center">
            <span className="select-none text-7xl drop-shadow-[0_0_36px_rgba(34,211,238,0.95)]">⭐</span>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute rounded-full border-2 border-cyan-400/70"
                style={{ width: 56, height: 56 }}
                animate={{ scale: [1, 3 + i * 0.8], opacity: [0.9, 0] }}
                transition={{ duration: 0.68, delay: i * 0.11, ease: "easeOut" }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Power Rose Modal ──────────────────────────────────────────────────────────

function PowerRoseModal({
  open,
  onConfirm,
  onClose,
}: {
  open: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
        >
          <motion.div
            className="absolute inset-0 bg-[#2D1810]/40 backdrop-blur-[8px]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
          <motion.div
            className="relative z-10 w-full max-w-[300px] rounded-[28px] bg-white px-7 py-8 text-center shadow-[0_8px_48px_rgba(255,45,120,0.2)] border border-pink-100"
            initial={{ scale: 0.8, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-pink-50 text-[#9B7065] hover:bg-pink-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Animated rose */}
            <div className="mb-5 flex justify-center">
              <div className="relative flex h-[120px] w-[120px] items-center justify-center">
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(236,72,153,0.30) 0%, rgba(139,92,246,0.12) 65%, transparent 100%)" }}
                  animate={{ scale: [1, 1.12, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="relative flex h-[88px] w-[88px] items-center justify-center rounded-full bg-gradient-to-br from-pink-50 to-rose-100 ring-1 ring-pink-200">
                  <motion.span
                    className="select-none text-[46px] leading-none"
                    animate={{ scale: [1, 1.08, 1], rotate: [-4, 4, -4] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    🌹
                  </motion.span>
                </div>
                {[
                  { top: "2%", left: "10%", d: 0 },
                  { top: "8%", right: "4%", d: 0.5 },
                  { bottom: "6%", left: "4%", d: 0.9 },
                  { bottom: "2%", right: "10%", d: 0.3 },
                ].map((s, i) => (
                  <motion.span
                    key={i}
                    className="absolute select-none text-pink-400/55 text-[13px]"
                    style={{ top: s.top, left: (s as any).left, right: (s as any).right, bottom: s.bottom }}
                    animate={{ opacity: [0.25, 0.85, 0.25], scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 2.2, repeat: Infinity, delay: s.d, ease: "easeInOut" }}
                  >
                    ✦
                  </motion.span>
                ))}
              </div>
            </div>

            <h2 className="mb-2 text-[18px] font-bold text-[#2D1810]">Power Rose</h2>
            <p className="mb-7 text-[13px] leading-relaxed text-[#9B7065]">
              A glowing rose bloom will be delivered on this picture after you confirm.
            </p>
            <motion.button
              onClick={onConfirm}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              className="w-full rounded-full bg-[#FF2D78] py-3.5 text-[15px] font-semibold text-white shadow-[0_4px_22px_rgba(255,45,120,0.42)]"
            >
              Send Rose 🌹
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Compliment Modal ──────────────────────────────────────────────────────────

const MAX_CHARS = 200;

function ComplimentModal({
  open,
  targetName,
  onSend,
  onClose,
}: {
  open: boolean;
  targetName: string;
  onSend: (msg: string) => void;
  onClose: () => void;
}) {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText("");
    setShowEmoji(false);
  };

  const handleClose = () => {
    setText("");
    setShowEmoji(false);
    onClose();
  };

  const insertEmoji = (emoji: string) => {
    const ta = textareaRef.current;
    if (!ta) {
      setText((prev) => (prev + emoji).slice(0, MAX_CHARS));
      return;
    }
    const start = ta.selectionStart ?? text.length;
    const end = ta.selectionEnd ?? text.length;
    const next = (text.slice(0, start) + emoji + text.slice(end)).slice(0, MAX_CHARS);
    setText(next);
    // Restore caret after state update
    requestAnimationFrame(() => {
      ta.focus();
      const pos = Math.min(start + emoji.length, MAX_CHARS);
      ta.setSelectionRange(pos, pos);
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
        >
          <motion.div
            className="absolute inset-0 bg-black/75 backdrop-blur-[8px]"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
          <motion.div
            className="relative z-10 w-full max-w-sm rounded-t-[28px] sm:rounded-[28px] bg-white border border-pink-100 shadow-[0_-8px_40px_rgba(255,45,120,0.12)] px-6 pt-5 pb-8"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
          >
            {/* Drag handle */}
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-pink-200 sm:hidden" />

            {/* Close / back button */}
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-pink-50 text-[#9B7065] hover:bg-pink-100 transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pink-50 ring-1 ring-pink-200">
                <MessageCircle className="h-5 w-5 text-[#FF2D78]" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#FF2D78]">Compliment</p>
                <h3 className="text-[15px] font-semibold leading-tight text-[#2D1810]">
                  Say something nice to{" "}
                  <span className="text-[#FF2D78]">{targetName}</span>
                </h3>
              </div>
            </div>

            {/* Emoji picker */}
            <AnimatePresence>
              {showEmoji && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                  className="mb-3 overflow-hidden rounded-[20px] border border-indigo-400/15"
                >
                  <Picker
                    theme={Theme.DARK}
                    onEmojiClick={(data) => insertEmoji(data.emoji)}
                    lazyLoadEmojis
                    previewConfig={{ showPreview: false }}
                    searchPlaceholder="Search emoji…"
                    suggestedEmojisMode={SuggestionMode.RECENT}
                    width="100%"
                    height={320}
                    skinTonesDisabled={false}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Textarea */}
            <div className="relative mb-3">
              <textarea
                ref={textareaRef}
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
                placeholder={`What caught your eye about ${targetName}?`}
                rows={4}
                className="w-full resize-none rounded-2xl border border-pink-100 bg-[#FFF8F0] px-4 py-3.5 pr-12 text-sm text-[#2D1810] placeholder:text-[#9B7065]/50 outline-none focus:border-[#FF2D78] focus:ring-2 focus:ring-[#FF2D78]/10 transition-colors"
              />
              {/* Emoji toggle inside textarea */}
              <button
                type="button"
                onClick={() => setShowEmoji((v) => !v)}
                className={`absolute bottom-3 right-10 flex h-6 w-6 items-center justify-center rounded-full transition-colors ${
                  showEmoji ? "text-[#FF2D78]" : "text-[#9B7065]/50 hover:text-[#FF2D78]"
                }`}
              >
                <SmilePlus className="h-4 w-4" />
              </button>
              <span
                className={`absolute bottom-3 right-3.5 text-[10px] tabular-nums transition-colors ${
                  text.length >= MAX_CHARS ? "text-rose-600" : "text-[#9B7065]/40"
                }`}
              >
                {text.length}/{MAX_CHARS}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 rounded-full border border-pink-100 py-3 text-sm text-[#9B7065] hover:bg-pink-50 transition-colors"
              >
                Cancel
              </button>
              <motion.button
                onClick={handleSend}
                disabled={!text.trim()}
                whileHover={{ scale: text.trim() ? 1.03 : 1 }}
                whileTap={{ scale: text.trim() ? 0.95 : 1 }}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#FF2D78] py-3 text-sm font-semibold text-white shadow-[0_4px_18px_rgba(255,45,120,0.42)] disabled:opacity-35"
              >
                <Send className="h-4 w-4" />
                Send
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Limit Reached Modal ────────────────────────────────────────────────────────

const ACTION_META: Record<ActionKey, { emoji: string; label: string }> = {
  like:       { emoji: "❤️", label: "Likes" },
  dislike:    { emoji: "👋", label: "Passes" },
  superlike:  { emoji: "⭐", label: "Super Likes" },
  rose:       { emoji: "🌹", label: "Roses" },
  compliment: { emoji: "💬", label: "Compliments" },
};

function LimitReachedModal({
  action,
  onClose,
}: {
  action: ActionKey | null;
  onClose: () => void;
}) {
  const meta = action ? ACTION_META[action] : null;
  return (
    <AnimatePresence>
      {action && meta && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-[#2D1810]/40 backdrop-blur-[8px]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
          <motion.div
            className="relative z-10 w-full max-w-[300px] rounded-[24px] bg-white px-7 py-8 text-center border border-pink-100 shadow-[0_8px_40px_rgba(255,45,120,0.15)]"
            initial={{ scale: 0.82, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.82, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-pink-50 text-[#9B7065]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <div className="mb-3 text-[48px]">{meta.emoji}</div>
            <h3 className="mb-2 text-[17px] font-bold text-[#2D1810]">Daily {meta.label} Used Up</h3>
            <p className="mb-6 text-[13px] leading-relaxed text-[#9B7065]">
              You've used all your free {meta.label.toLowerCase()} for today. Resets at midnight, or upgrade for unlimited.
            </p>
            <motion.button
              onClick={() => { onClose(); window.location.href = "/premium"; }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="mb-3 w-full rounded-full bg-[#FF2D78] py-3 text-[14px] font-semibold text-white shadow-[0_4px_20px_rgba(255,45,120,0.42)]"
            >
              👑 Upgrade to Premium
            </motion.button>
            <button
              onClick={onClose}
              className="text-[12px] text-[#9B7065] hover:text-[#2D1810] transition-colors"
            >
              Maybe later
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Action button ─────────────────────────────────────────────────────────────

interface ActionButtonProps {
  onClick: () => void;
  disabled: boolean;
  size: "sm" | "md" | "lg";
  colorClass: string;
  shadowClass?: string;
  label: string;
  badge?: number | null;
  children: React.ReactNode;
}

function ActionButton({
  onClick,
  disabled,
  size,
  colorClass,
  shadowClass = "",
  label,
  badge,
  children,
}: ActionButtonProps) {
  const dim = size === "lg" ? "h-14 w-14" : size === "md" ? "h-12 w-12" : "h-10 w-10";
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        <motion.button
          whileHover={{ scale: disabled ? 1 : 1.12, y: disabled ? 0 : -3 }}
          whileTap={{ scale: disabled ? 1 : 0.88 }}
          onClick={onClick}
          disabled={disabled}
          className={`flex items-center justify-center rounded-full border transition-colors ${colorClass} ${shadowClass} ${dim} disabled:opacity-30`}
        >
          {children}
        </motion.button>
        {badge !== null && badge !== undefined && (
          <motion.div
            key={badge}
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className={`absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[9px] font-bold tabular-nums leading-none ${
              badge === 0
                ? "bg-rose-500 text-white"
                : badge <= 1
                ? "bg-amber-500 text-black"
                : "bg-white/20 text-white/80"
            }`}
          >
            {badge}
          </motion.div>
        )}
      </div>
      <span className="text-[9px] uppercase tracking-wider text-[#9B7065]/60">{label}</span>
    </div>
  );
}

// ─── SwipeDeck ─────────────────────────────────────────────────────────────────

export function SwipeDeck({ profiles, onCardClick }: SwipeDeckProps) {
  const user = useAuthStore((s) => s.user);
  const toast = useToastStore((state) => state.push);
  const queryClient = useQueryClient();
  const { stack, current, exiting, performSwipe, undoSwipe, remaining } = useSwipeDeck(profiles);

  const isPremium = !!(
    (user as any)?.subscription?.status === "active" ||
    (user as any)?.isPremium
  );

  const { canUse, consume, badge } = useDaily(isPremium);

  const [reaction, setReaction] = useState<SwipeAction | null>(null);
  const [matchData, setMatchData] = useState<MatchState | null>(null);
  const [showRoseModal, setShowRoseModal] = useState(false);
  const [complimentTarget, setComplimentTarget] = useState<string | null>(null);
  const [limitAction, setLimitAction] = useState<ActionKey | null>(null);

  const currentUserImage = (user as any)?.photos?.[0] || (user as any)?.profilePhoto || "";
  const currentUserName = (user as any)?.fullName || (user as any)?.name || "You";

  const isLocked = !!exiting || showRoseModal || complimentTarget !== null;

  const executeSwipe = async (action: SwipeAction, message?: string) => {
    if (!current) return;
    const profile = current;

    consume(action as ActionKey);
    setReaction(action);
    setTimeout(() => setReaction(null), 500);
    performSwipe(action);

    // Demo profiles have non-ObjectId IDs — skip the API call silently
    const isDemo = profile.id.startsWith("demo-") || !/^[a-f\d]{24}$/i.test(profile.id);
    if (isDemo) return;

    const t0 = Date.now();
    try {
      const res = await api.post("/discover/swipe", {
        toUserId: profile.id,
        action,
        ...(message ? { message } : {}),
      });
      mutate(["/discover", { university: (user as any)?.university || "LPU", filter: "All" }]);
      mutate("/chat/matches");
      queryClient.invalidateQueries({ queryKey: ["discover"] });

      if (res.data?.data?.matched) {
        const elapsed = Date.now() - t0;
        const wait = Math.max(0, 850 - elapsed);
        setTimeout(() => {
          setMatchData({
            name: res.data.data.matchedUser?.name || profile.name,
            image: res.data.data.matchedUser?.photo || profile.image,
            currentUserImage,
            currentUserName,
          });
        }, wait);
      }
    } catch (err: any) {
      toast({
        title: "Swipe failed",
        message: err?.response?.data?.message || "Please try again.",
        variant: "error",
      });
    }
  };

  const trigger = (action: SwipeAction) => {
    if (!current || isLocked) return;
    const key = action as ActionKey;

    if (!canUse(key)) {
      setLimitAction(key);
      return;
    }

    if (action === "rose") {
      setShowRoseModal(true);
      return;
    }

    if (action === "compliment") {
      setComplimentTarget(current.name);
      return;
    }

    executeSwipe(action);
  };

  return (
    <div className="mx-auto w-full max-w-sm">
      {/* Card deck */}
      <div className="relative h-[520px]">
        {stack.length > 0 ? (
          stack.map((profile, idx) => (
            <SwipeCard
              key={profile.id}
              profile={profile}
              zIndex={30 - idx}
              offset={idx}
              isTop={idx === 0}
              onSwipe={(action) => trigger(action)}
              onInfoClick={idx === 0 && onCardClick ? () => onCardClick(profile) : undefined}
              exitAction={exiting?.id === profile.id ? exiting.action : null}
            />
          ))
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 rounded-[32px] border border-pink-100 bg-pink-50/40 text-center">
            <div className="text-4xl">💕</div>
            <p className="text-lg font-semibold text-[#2D1810]">Finding more campus matches</p>
            <p className="text-sm text-[#9B7065]">
              Try another filter or give us a second to refresh your deck.
            </p>
          </div>
        )}

        {/* Reaction overlays */}
        <HeartBurst active={reaction === "like"} />
        <RoseFloat  active={reaction === "rose"} />
        <BubblePop  active={reaction === "compliment"} />
        <StarPulse  active={reaction === "superlike"} />
      </div>

      {/* Action buttons */}
      <div className="mt-6 flex items-end justify-center gap-3">
        <ActionButton
          onClick={() => trigger("dislike")}
          disabled={isLocked || remaining === 0}
          size="lg"
          colorClass="border-rose-400/40 bg-rose-500/15 text-rose-300 hover:bg-rose-500/25"
          shadowClass="shadow-[0_0_18px_rgba(255,80,80,0.2)]"
          label="Pass"
        >
          <X className="h-6 w-6" />
        </ActionButton>

        <ActionButton
          onClick={() => trigger("superlike")}
          disabled={isLocked || remaining === 0}
          size="md"
          colorClass="border-cyan-400/40 bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25"
          shadowClass="shadow-[0_0_14px_rgba(34,211,238,0.18)]"
          label="Super"
          badge={badge("superlike")}
        >
          <Sparkles className="h-5 w-5" />
        </ActionButton>

        <ActionButton
          onClick={() => trigger("rose")}
          disabled={isLocked || remaining === 0}
          size="md"
          colorClass="border-pink-400/40 bg-pink-500/15 text-pink-200 hover:bg-pink-500/25"
          shadowClass="shadow-[0_0_14px_rgba(236,72,153,0.18)]"
          label="Rose"
          badge={badge("rose")}
        >
          <span className="text-lg leading-none">🌹</span>
        </ActionButton>

        <ActionButton
          onClick={() => trigger("compliment")}
          disabled={isLocked || remaining === 0}
          size="md"
          colorClass="border-indigo-400/40 bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25"
          shadowClass="shadow-[0_0_14px_rgba(99,102,241,0.18)]"
          label="Compliment"
          badge={badge("compliment")}
        >
          <MessageCircle className="h-5 w-5" />
        </ActionButton>

        <ActionButton
          onClick={undoSwipe}
          disabled={isLocked}
          size="md"
          colorClass="border-pink-100 bg-pink-50 text-[#9B7065] hover:bg-pink-100"
          label="Undo"
        >
          <RotateCcw className="h-4 w-4" />
        </ActionButton>

        <ActionButton
          onClick={() => trigger("like")}
          disabled={isLocked || remaining === 0}
          size="lg"
          colorClass="border-pink-400/40 bg-pink-500/15 text-pink-300 hover:bg-pink-500/25"
          shadowClass="shadow-[0_0_22px_rgba(255,79,216,0.28)]"
          label="Love"
          badge={badge("like")}
        >
          <Heart className="h-6 w-6" fill="rgba(249,168,212,0.5)" />
        </ActionButton>
      </div>

      {/* Power Rose confirmation modal */}
      <PowerRoseModal
        open={showRoseModal}
        onClose={() => setShowRoseModal(false)}
        onConfirm={() => {
          setShowRoseModal(false);
          executeSwipe("rose");
        }}
      />

      {/* Compliment message writer */}
      <ComplimentModal
        open={complimentTarget !== null}
        targetName={complimentTarget || ""}
        onClose={() => setComplimentTarget(null)}
        onSend={(msg) => {
          setComplimentTarget(null);
          executeSwipe("compliment", msg);
        }}
      />

      {/* Daily limit reached */}
      <LimitReachedModal
        action={limitAction}
        onClose={() => setLimitAction(null)}
      />

      {/* Match celebration */}
      {matchData && (
        <MatchCelebration
          open={!!matchData}
          firstUserImage={matchData.currentUserImage}
          secondUserImage={matchData.image}
          firstName={matchData.currentUserName}
          secondName={matchData.name}
          onSendMessage={() => {
            setMatchData(null);
            window.location.href = "/chat";
          }}
          onKeepSwiping={() => setMatchData(null)}
        />
      )}
    </div>
  );
}
