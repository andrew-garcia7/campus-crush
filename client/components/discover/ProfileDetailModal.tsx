"use client";

import { useState, useRef } from "react";
import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import {
  BadgeCheck,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Crown,
  GraduationCap,
  Heart,
  MapPin,
  MessageCircle,
  Mic2,
  Send,
  SmilePlus,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import Picker, { SuggestionMode, Theme } from "emoji-picker-react";
import { useToastStore } from "@/store/toast-store";

export interface DetailProfile {
  id: string;
  name: string;
  age: number;
  bio: string;
  images: string[];
  university: string;
  department?: string;
  interests?: string[];
  hobbies?: string[];
  prompts?: Array<{ question: string; answer: string }>;
  relationshipGoals?: string;
  height?: string;
  distance?: string;
  verified?: boolean;
  mutualCount?: number;
  online?: boolean;
  matchProbability?: number;
  compatibilityScore?: string;
  location?: string;
}

interface Props {
  profile: DetailProfile;
  onClose: () => void;
  onLike?: () => void;
  onMessage?: () => void;
  isPremium?: boolean;
}

const DEFAULT_PROMPTS = [
  { question: "Two truths and a lie", answer: "I've been to 3 countries, I can cook biryani from scratch, and I never pull all-nighters." },
  { question: "My love language is", answer: "Acts of service — nothing says I care more than showing up." },
  { question: "You'll know I like you if", answer: "I start sharing my playlist with you." },
];

const FREE_ACTION_LIMITS = {
  comment: 3,
  compliment: 2,
  powerRose: 1,
} as const;

const PREMIUM_ACTION_LIMITS = {
  comment: "Unlimited",
  compliment: "Unlimited",
  powerRose: "5/day",
} as const;

type QuickActionType = keyof typeof FREE_ACTION_LIMITS;

const ACTION_META: Record<QuickActionType, {
  title: string;
  description: string;
  accent: string;
  iconClassName: string;
  particleClassName: string;
}> = {
  comment: {
    title: "Comment",
    description: "Comment on this picture",
    accent: "from-sky-100 via-cyan-50 to-blue-50",
    iconClassName: "text-cyan-600",
    particleClassName: "text-cyan-400/70",
  },
  compliment: {
    title: "Compliment",
    description: "Compliment this picture",
    accent: "from-pink-50 via-rose-50 to-pink-100",
    iconClassName: "text-[#FF2D78]",
    particleClassName: "text-[#FF2D78]/60",
  },
  powerRose: {
    title: "Power Rose",
    description: "Send a romantic premium rose",
    accent: "from-rose-50 via-pink-50 to-orange-50",
    iconClassName: "text-rose-600",
    particleClassName: "text-rose-400/70",
  },
};

// ─── Composer Overlay (Comment / Compliment) ──────────────────────────────────

const MAX_COMPOSER_CHARS = 300;

function ComposerOverlay({
  open,
  type,
  targetName,
  photoIndex,
  onSend,
  onClose,
}: {
  open: boolean;
  type: "comment" | "compliment";
  targetName: string;
  photoIndex: number;
  onSend: (text: string) => void;
  onClose: () => void;
}) {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const handleClose = () => {
    setText("");
    setShowEmoji(false);
    onClose();
  };

  const handleSend = () => {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText("");
    setShowEmoji(false);
  };

  const insertEmoji = (emoji: string) => {
    const ta = taRef.current;
    if (!ta) { setText((p) => (p + emoji).slice(0, MAX_COMPOSER_CHARS)); return; }
    const start = ta.selectionStart ?? text.length;
    const end = ta.selectionEnd ?? text.length;
    const next = (text.slice(0, start) + emoji + text.slice(end)).slice(0, MAX_COMPOSER_CHARS);
    setText(next);
    requestAnimationFrame(() => {
      ta.focus();
      const pos = Math.min(start + emoji.length, MAX_COMPOSER_CHARS);
      ta.setSelectionRange(pos, pos);
    });
  };

  const isComment = type === "comment";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute inset-0 z-30 flex items-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.18 } }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-[#2D1810]/60 backdrop-blur-sm"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />

          {/* Sheet */}
          <motion.div
            className="relative z-10 w-full rounded-t-[28px] border border-pink-100 bg-white px-5 pt-4 pb-8 shadow-[0_-8px_40px_rgba(255,45,120,0.12)]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
          >
            {/* Drag handle */}
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-pink-200" />

            {/* Close */}
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-pink-50 text-[#9B7065] hover:bg-pink-100 transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="mb-4 flex items-center gap-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ring-1 ${
                  isComment
                    ? "bg-cyan-50 ring-cyan-200"
                    : "bg-pink-50 ring-pink-200"
                }`}
              >
                {isComment
                  ? <MessageCircle className="h-5 w-5 text-cyan-600" />
                  : <Sparkles className="h-5 w-5 text-[#FF2D78]" />}
              </div>
              <div>
                <p className={`text-[10px] uppercase tracking-widest ${
                  isComment ? "text-cyan-600" : "text-[#FF2D78]"
                }`}>
                  {isComment ? "Comment" : "Compliment"}
                </p>
                <h3 className="text-[15px] font-semibold leading-tight text-[#2D1810]">
                  {isComment ? `Photo ${photoIndex + 1}` : targetName}
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
                  transition={{ duration: 0.16 }}
                  className="mb-3 overflow-hidden rounded-[18px] border border-fuchsia-400/15"
                >
                  <Picker
                    theme={Theme.DARK}
                    onEmojiClick={(data) => insertEmoji(data.emoji)}
                    lazyLoadEmojis
                    previewConfig={{ showPreview: false }}
                    searchPlaceholder="Search emoji\u2026"
                    suggestedEmojisMode={SuggestionMode.RECENT}
                    width="100%"
                    height={300}
                    skinTonesDisabled={false}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Textarea */}
            <div className="relative mb-3">
              <textarea
                ref={taRef}
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, MAX_COMPOSER_CHARS))}
                placeholder={
                  isComment
                    ? `What do you think about this photo?`
                    : `Say something nice to ${targetName}\u2026`
                }
                rows={4}
                className={`w-full resize-none rounded-2xl border bg-[#FFF8F0] px-4 py-3.5 pr-12 text-sm text-[#2D1810] placeholder:text-[#9B7065]/50 outline-none transition-colors focus:ring-2 ${
                  isComment
                    ? "border-cyan-200 focus:border-cyan-400 focus:ring-cyan-500/15"
                    : "border-pink-100 focus:border-[#FF2D78] focus:ring-[#FF2D78]/10"
                }`}
              />
              {/* Emoji toggle */}
              <button
                type="button"
                onClick={() => setShowEmoji((v) => !v)}
                className={`absolute bottom-3 right-9 flex h-6 w-6 items-center justify-center rounded-full transition-colors ${
                  showEmoji
                    ? isComment ? "text-cyan-600" : "text-[#FF2D78]"
                    : "text-[#9B7065]/50 hover:text-[#FF2D78]"
                }`}
              >
                <SmilePlus className="h-4 w-4" />
              </button>
              {/* Char count */}
              <span
                className={`absolute bottom-3 right-3 text-[10px] tabular-nums transition-colors ${
                  text.length >= MAX_COMPOSER_CHARS ? "text-rose-600" : "text-[#9B7065]/40"
                }`}
              >
                {text.length}/{MAX_COMPOSER_CHARS}
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
                className={`flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-white disabled:opacity-35 ${
                  isComment
                    ? "bg-cyan-500 shadow-[0_4px_18px_rgba(34,211,238,0.35)]"
                    : "bg-[#FF2D78] shadow-[0_4px_18px_rgba(255,45,120,0.42)]"
                }`}
              >
                <Send className="h-4 w-4" /> Send
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Power Rose Overlay ───────────────────────────────────────────────────────

function PowerRoseOverlay({
  open,
  stage,
  onClose,
  onSend,
}: {
  open: boolean;
  stage: "preview" | "sent";
  onClose: () => void;
  onSend: () => void;
}) {
  const petals = [
    { x: -64, y: -84, rotate: -24, delay: 0 },
    { x: 72, y: -68, rotate: 28, delay: 0.08 },
    { x: -88, y: 10, rotate: -16, delay: 0.14 },
    { x: 86, y: 22, rotate: 22, delay: 0.2 },
    { x: -34, y: 88, rotate: -30, delay: 0.28 },
    { x: 42, y: 94, rotate: 18, delay: 0.34 },
  ];

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-20 flex items-center justify-center bg-[#2D1810]/60 px-5 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.86, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 18 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="relative w-full max-w-[280px] overflow-hidden rounded-[30px] border border-pink-100 bg-white px-5 py-6 text-center shadow-[0_0_45px_rgba(255,45,120,0.2)]"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-pink-50 text-[#9B7065] hover:bg-pink-100"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {petals.map((petal, index) => (
                <motion.span
                  key={`${petal.x}-${petal.y}-${index}`}
                  initial={{ opacity: 0, scale: 0.7, x: 0, y: 0, rotate: 0 }}
                  animate={{
                    opacity: [0, 1, 0.2],
                    scale: [0.7, 1, 0.84],
                    x: [0, petal.x],
                    y: [0, petal.y],
                    rotate: [0, petal.rotate],
                  }}
                  transition={{ duration: 1.8, repeat: Infinity, repeatType: "reverse", delay: petal.delay }}
                  className="absolute left-1/2 top-1/2 text-lg text-rose-200/75"
                >
                  ✿
                </motion.span>
              ))}
            </div>

            <div className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-pink-100 bg-pink-50 shadow-[0_0_30px_rgba(255,45,120,0.2)]">
              <motion.div
                animate={stage === "preview" ? { scale: [0.94, 1.08, 1], rotate: [0, -4, 4, 0] } : { scale: [1, 1.18, 1] }}
                transition={{ duration: stage === "preview" ? 2.2 : 0.85, repeat: stage === "preview" ? Infinity : 1 }}
                className="text-5xl"
              >
                🌹
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.35, 1], opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 2.4, repeat: Infinity }}
                className="absolute inset-0 rounded-full border border-pink-200"
              />
            </div>

            {stage === "preview" ? (
              <>
                <h3 className="mt-5 text-xl font-semibold text-[#2D1810]">Power Rose</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#9B7065]">A glowing rose bloom will be delivered on this picture after you confirm.</p>
                <button
                  type="button"
                  onClick={onSend}
                  className="mt-5 inline-flex items-center justify-center rounded-full bg-[#FF2D78] px-5 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(255,45,120,0.35)]"
                >
                  Send Rose 🌹
                </button>
              </>
            ) : (
              <>
                <h3 className="mt-5 text-xl font-semibold text-[#2D1810]">Rose delivered</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#9B7065]">Your rose has been delivered ❤️</p>
              </>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function ActionIconOrb({
  type,
  children,
}: {
  type: QuickActionType;
  children: React.ReactNode;
}) {
  const meta = ACTION_META[type];
  const particles = type === "comment" ? ["•", "✦", "•", "✦"] : type === "compliment" ? ["✦", "♡", "✦", "♡"] : ["✿", "✦", "✿", "✦"];

  return (
    <motion.div
      animate={{ scale: [1, 1.06, 1], y: [0, -2, 0] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      className={`relative flex h-14 w-14 items-center justify-center rounded-full border border-pink-100 bg-gradient-to-br ${meta.accent} shadow-[0_0_16px_rgba(255,45,120,0.12)]`}
    >
      <motion.div
        animate={{ scale: [1, 1.45, 1], opacity: [0.45, 0, 0.45] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
        className="absolute inset-0 rounded-full border border-white/20"
      />
      {particles.map((particle, index) => (
        <motion.span
          key={`${type}-${particle}-${index}`}
          initial={{ opacity: 0.9, scale: 0.85, x: 0, y: 0 }}
          animate={{
            opacity: [0.9, 0, 0.9],
            scale: [0.85, 1.15, 0.85],
            x: Math.cos((index / particles.length) * Math.PI * 2) * 16,
            y: Math.sin((index / particles.length) * Math.PI * 2) * 16,
          }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: index * 0.18 }}
          className={`pointer-events-none absolute text-[11px] ${meta.particleClassName}`}
        >
          {particle}
        </motion.span>
      ))}
      <div className={meta.iconClassName}>{children}</div>
    </motion.div>
  );
}

export function ProfileDetailModal({ profile, onClose, onLike, onMessage, isPremium = false }: Props) {
  const [imgIdx, setImgIdx] = useState(0);
  const [activeComposer, setActiveComposer] = useState<"comment" | "compliment" | null>(null);
  const [usage, setUsage] = useState({ comment: 0, compliment: 0, powerRose: 0 });
  const [powerRoseStage, setPowerRoseStage] = useState<"closed" | "preview" | "sent">("closed");
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-120, 120], [-8, 8]);
  const likeOpacity = useTransform(x, [20, 80], [0, 1]);
  const nopeOpacity = useTransform(x, [-80, -20], [1, 0]);
  const toast = useToastStore((state) => state.push);

  const images = profile.images?.length ? profile.images : [profile.images?.[0]].filter(Boolean);
  const prompts = profile.prompts?.length ? profile.prompts : DEFAULT_PROMPTS;
  const mutualInterests = (profile.interests || []).slice(0, 4);
  const hobbies = profile.hobbies || [];

  const getUsageLabel = (type: QuickActionType) => {
    if (isPremium) {
      if (type === "powerRose") return "♛ Premium 5/day";
      return "♛ Premium unlimited";
    }

    if (type === "powerRose") return "✦ Free 1/day";
    return `✦ Free ${FREE_ACTION_LIMITS[type]}/day`;
  };

  const canUseAction = (type: QuickActionType) => isPremium || usage[type] < FREE_ACTION_LIMITS[type];

  const submitQuickAction = (type: "comment" | "compliment" | "powerRose", composedText?: string) => {
    if (!canUseAction(type)) {
      toast({ title: "Usage limit reached", message: isPremium ? "Today's limit for this action is used up." : "Upgrade to Premium for higher limits.", variant: "error" });
      return;
    }

    const message = type === "powerRose" ? `Power Rose sent for photo ${imgIdx + 1}` : (composedText ?? "").trim();
    if (type !== "powerRose" && !message) return;

    setUsage((current) => ({ ...current, [type]: current[type] + 1 }));
    setActiveComposer(null);

    if (type === "powerRose") {
      setPowerRoseStage("sent");
      window.setTimeout(() => setPowerRoseStage("closed"), 1500);
      return;
    }

    toast({
      title: type === "compliment" ? "Compliment sent ✨" : "Comment sent 💬",
      message: `${message} · photo ${imgIdx + 1}`,
      variant: "success",
    });
  };

  const startPowerRoseFlow = () => {
    if (!canUseAction("powerRose")) {
      toast({ title: "Usage limit reached", message: isPremium ? "Today's limit for this action is used up." : "Upgrade to Premium for higher limits.", variant: "error" });
      return;
    }

    setPowerRoseStage("preview");
  };

  const nextImg = () => setImgIdx((i) => Math.min(images.length - 1, i + 1));
  const prevImg = () => setImgIdx((i) => Math.max(0, i - 1));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center bg-[#2D1810]/50 backdrop-blur-sm sm:items-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", damping: 26, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative flex max-h-[94vh] w-full max-w-sm flex-col overflow-hidden rounded-t-[36px] border border-pink-100 bg-white shadow-[0_0_60px_rgba(255,45,120,0.2)] sm:rounded-[36px]"
        >
          <PowerRoseOverlay
            open={powerRoseStage !== "closed"}
            stage={powerRoseStage === "sent" ? "sent" : "preview"}
            onClose={() => setPowerRoseStage("closed")}
            onSend={() => submitQuickAction("powerRose")}
          />

          {/* Comment / Compliment composer overlay */}
          <ComposerOverlay
            open={activeComposer !== null}
            type={activeComposer ?? "comment"}
            targetName={profile.name}
            photoIndex={imgIdx}
            onClose={() => setActiveComposer(null)}
            onSend={(text) => {
              if (activeComposer) submitQuickAction(activeComposer, text);
            }}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="overflow-y-auto">
            {/* Image carousel */}
            <div className="relative h-[380px] w-full overflow-hidden bg-black">
              <AnimatePresence mode="wait">
                <motion.img
                  key={imgIdx}
                  src={images[imgIdx]}
                  alt={profile.name}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="h-full w-full object-cover"
                />
              </AnimatePresence>

              {/* LIKE / NOPE overlay badges */}
              <motion.div style={{ opacity: likeOpacity }} className="absolute left-5 top-10 rotate-[-22deg] rounded-xl border-4 border-emerald-400 px-3 py-1">
                <p className="text-2xl font-black text-emerald-400">LIKE</p>
              </motion.div>
              <motion.div style={{ opacity: nopeOpacity }} className="absolute right-5 top-10 rotate-[22deg] rounded-xl border-4 border-rose-500 px-3 py-1">
                <p className="text-2xl font-black text-rose-500">NOPE</p>
              </motion.div>

              {/* Gradient overlay */}
              <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#2D1810] to-transparent" />

              {/* Photo dots */}
              {images.length > 1 && (
                <div className="absolute left-1/2 top-3 flex -translate-x-1/2 gap-1">
                  {images.map((_, i) => (
                    <div key={i} className={`h-1 rounded-full transition-all ${i === imgIdx ? "w-6 bg-white" : "w-2 bg-white/40"}`} />
                  ))}
                </div>
              )}

              <div className="absolute left-4 top-4 z-10 rounded-full border border-white/20 bg-[#2D1810]/35 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                Photo {imgIdx + 1} actions
              </div>

              {/* Tap zones for swipe through photos */}
              <button onClick={prevImg} disabled={imgIdx === 0} className="absolute inset-y-0 left-0 w-1/3" />
              <button onClick={nextImg} disabled={imgIdx === images.length - 1} className="absolute inset-y-0 right-0 w-1/3" />

              {/* Name block */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold text-white">
                        {profile.name}, {profile.age}
                      </h2>
                      {profile.verified && <BadgeCheck className="h-5 w-5 text-[#FF2D78]" />}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-white/80">
                      {profile.online && (
                        <span className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          Online now
                        </span>
                      )}
                      {profile.distance && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {profile.distance}
                        </span>
                      )}
                    </div>
                  </div>
                  {profile.matchProbability && (
                    <div className="flex items-center gap-1 rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-xs text-white">
                      <Heart className="h-3 w-3 fill-fuchsia-400 text-fuchsia-400" />
                      {profile.matchProbability}% match
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4 p-4 pb-6">
              {/* University */}
              <div className="flex items-center gap-2 text-sm text-[#9B7065]">
                <GraduationCap className="h-4 w-4 text-[#FF2D78] flex-shrink-0" />
                <span>{profile.university}{profile.department ? ` · ${profile.department}` : ""}</span>
              </div>

              {/* Mutual interests */}
              {mutualInterests.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-[#FF2D78]" />
                    <p className="text-xs font-medium text-[#9B7065]">
                      {profile.mutualCount ? `${profile.mutualCount} mutual connections` : "Interests"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {mutualInterests.map((i) => (
                      <span key={i} className="rounded-full border border-pink-100 bg-pink-50 px-2.5 py-1 text-[11px] text-[#FF2D78]">
                        {i}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Bio */}
              {profile.bio && (
                <div className="rounded-2xl border border-pink-100 bg-[#FFF8F0] p-3.5">
                  <p className="text-xs leading-relaxed text-[#9B7065]">{profile.bio}</p>
                </div>
              )}

              {hobbies.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium text-[#9B7065]">Hobbies</p>
                  <div className="flex flex-wrap gap-1.5">
                    {hobbies.map((hobby) => (
                      <span key={hobby} className="rounded-full border border-pink-100 bg-pink-50 px-2 py-1 text-[10px] text-[#9B7065]">
                        {hobby}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-pink-100 bg-pink-50/40 p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#2D1810]">Picture interactions</p>
                    <p className="mt-1 text-[11px] text-[#9B7065]">Add comments, compliments, or send a Power Rose on the current picture with strict free and premium usage rules.</p>
                  </div>
                  <span className="rounded-full border border-yellow-400/20 bg-yellow-500/10 px-2 py-1 text-[10px] font-semibold text-yellow-200">
                    {isPremium ? "♛ Premium" : "✦ Free"}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => setActiveComposer((current) => (current === "comment" ? null : "comment"))}
                    disabled={!canUseAction("comment")}
                    className="flex min-h-[196px] w-full flex-col overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm p-4 text-left disabled:opacity-45"
                  >
                    <div className="flex flex-col items-start gap-3 text-[#2D1810]">
                      <ActionIconOrb type="comment">
                        <MessageCircle className="h-5 w-5" />
                      </ActionIconOrb>
                      <div className="min-w-0 w-full flex-1">
                        <p className="text-sm font-semibold leading-5 text-[#2D1810]">Comment</p>
                        <p className="mt-1 break-words text-[11px] leading-5 text-[#9B7065]">Comment on photo {imgIdx + 1}</p>
                      </div>
                    </div>
                    <div className="mt-auto flex flex-wrap gap-2 pt-3 text-[10px] font-medium leading-4">
                      <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2 py-1 text-emerald-200">✦ Free {FREE_ACTION_LIMITS.comment}/day</span>
                      <span className="rounded-full border border-yellow-400/20 bg-yellow-500/10 px-2 py-1 text-yellow-200">♛ Premium {PREMIUM_ACTION_LIMITS.comment}</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveComposer((current) => (current === "compliment" ? null : "compliment"))}
                    disabled={!canUseAction("compliment")}
                    className="flex min-h-[196px] w-full flex-col overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm p-4 text-left disabled:opacity-45"
                  >
                    <div className="flex flex-col items-start gap-3 text-[#2D1810]">
                      <ActionIconOrb type="compliment">
                        <Sparkles className="h-5 w-5" />
                      </ActionIconOrb>
                      <div className="min-w-0 w-full flex-1">
                        <p className="text-sm font-semibold leading-5 text-[#2D1810]">Compliment</p>
                        <p className="mt-1 break-words text-[11px] leading-5 text-[#9B7065]">Compliment this picture respectfully</p>
                      </div>
                    </div>
                    <div className="mt-auto flex flex-wrap gap-2 pt-3 text-[10px] font-medium leading-4">
                      <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2 py-1 text-emerald-200">✦ Free {FREE_ACTION_LIMITS.compliment}/day</span>
                      <span className="rounded-full border border-yellow-400/20 bg-yellow-500/10 px-2 py-1 text-yellow-200">♛ Premium {PREMIUM_ACTION_LIMITS.compliment}</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={startPowerRoseFlow}
                    disabled={!canUseAction("powerRose")}
                    className="flex min-h-[196px] w-full flex-col overflow-hidden rounded-2xl border border-rose-300/20 bg-rose-500/10 p-4 text-left disabled:opacity-45"
                  >
                    <div className="flex flex-col items-start gap-3 text-white">
                      <ActionIconOrb type="powerRose">
                        <span className="text-xl leading-none">🌹</span>
                      </ActionIconOrb>
                      <div className="min-w-0 w-full flex-1">
                        <p className="text-sm font-semibold leading-5 text-[#2D1810]">Power Rose</p>
                        <p className="mt-1 break-words text-[11px] leading-5 text-[#9B7065]">Beautiful premium rose interaction for this picture</p>
                      </div>
                    </div>
                    <div className="mt-auto flex flex-wrap gap-2 pt-3 text-[10px] font-medium leading-4">
                      <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2 py-1 text-emerald-200">✦ Free {FREE_ACTION_LIMITS.powerRose}/day</span>
                      <span className="rounded-full border border-yellow-400/20 bg-yellow-500/10 px-2 py-1 text-yellow-200">♛ Premium {PREMIUM_ACTION_LIMITS.powerRose}</span>
                    </div>
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-[#9B7065]">
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2 py-1">✦ Used {usage.comment}/{FREE_ACTION_LIMITS.comment} comments</span>
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2 py-1">✦ Used {usage.compliment}/{FREE_ACTION_LIMITS.compliment} compliments</span>
                  <span className="rounded-full border border-yellow-400/20 bg-yellow-500/10 px-2 py-1">✦ Used {usage.powerRose}/{FREE_ACTION_LIMITS.powerRose} Power Rose</span>
                </div>

                {/* Composer overlay is rendered at the modal root, not here */}
              </div>

              {/* Prompts — Hinge-style question/answer cards */}
              {prompts.map((p, i) => (
                <div key={i} className="rounded-2xl border border-pink-100 bg-[#FFF8F0] p-4">
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <Mic2 className="h-3.5 w-3.5 text-[#FF2D78]" />
                    <p className="text-[11px] font-medium text-[#FF2D78]">{p.question}</p>
                  </div>
                  <p className="text-sm font-medium text-[#2D1810]">{p.answer}</p>
                </div>
              ))}

              {/* Relationship goals & lifestyle */}
              <div className="grid grid-cols-2 gap-2">
                {profile.relationshipGoals && (
                  <div className="flex items-center gap-2 rounded-xl border border-pink-100 bg-[#FFF8F0] p-2.5">
                    <Heart className="h-3.5 w-3.5 text-[#FF2D78] flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-[#9B7065]">Looking for</p>
                      <p className="text-xs font-medium text-[#2D1810]">{profile.relationshipGoals}</p>
                    </div>
                  </div>
                )}
                {profile.compatibilityScore && (
                  <div className="flex items-center gap-2 rounded-xl border border-pink-100 bg-[#FFF8F0] p-2.5">
                    <Users className="h-3.5 w-3.5 text-[#FF2D78] flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-[#9B7065]">Compatibility</p>
                      <p className="text-xs font-medium text-[#2D1810]">{profile.compatibilityScore}</p>
                    </div>
                  </div>
                )}
                {profile.height && (
                  <div className="flex items-center gap-2 rounded-xl border border-pink-100 bg-[#FFF8F0] p-2.5">
                    <BookOpen className="h-3.5 w-3.5 text-[#FF2D78] flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-[#9B7065]">Height</p>
                      <p className="text-xs font-medium text-[#2D1810]">{profile.height}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* All interests */}
              {(profile.interests || []).length > 4 && (
                <div>
                  <p className="mb-2 text-xs font-medium text-[#9B7065]">All interests</p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.interests!.map((interest) => (
                      <span key={interest} className="rounded-full border border-pink-100 bg-pink-50 px-2 py-1 text-[10px] text-[#9B7065]">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action bar */}
          <div className="flex items-center gap-3 border-t border-pink-100 bg-white px-5 py-4">
            <button
              onClick={onClose}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-500"
            >
              <X className="h-5 w-5" />
            </button>
            {onMessage && (
              <button
                onClick={onMessage}
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-pink-100 bg-pink-50 py-3 text-sm font-medium text-[#9B7065] hover:bg-pink-100"
              >
                <MessageCircle className="h-4 w-4" /> Message
              </button>
            )}
            {onLike && (
              <button
                onClick={onLike}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FF2D78] text-white shadow-[0_0_20px_rgba(255,45,120,0.4)]"
              >
                <Heart className="h-5 w-5 fill-white" />
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
