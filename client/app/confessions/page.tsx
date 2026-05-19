"use client";

import { useRef, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Flag, Ghost, Heart, MessageCircle, Plus, Send, Share2, Trash2 } from "lucide-react";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/auth-store";
import { useToastStore } from "@/store/toast-store";
import { SectionCloseButton } from "@/components/layout/section-close-button";

type ConfessionCategory = "all" | "confession" | "crush-story" | "breakup" | "funny" | "library" | "fest" | "hostel";

type ReactionBucket = { emoji: string; count: number; reacted: boolean };

type Confession = {
  _id: string;
  text: string;
  category: string;
  likes: number;
  shares: number;
  reports: number;
  commentsCount: number;
  createdAt: string;
  liked?: boolean;
  isOwner?: boolean;
  reactions?: ReactionBucket[];
};

const EMOJI_PALETTE = ["❤️", "😂", "😮", "😢", "🔥", "👍"];

const PICKER_EMOJIS = [
  "😭", "😂", "❤️", "😍", "🥺", "😅", "😊", "💕",
  "🔥", "✨", "💀", "🥲", "😤", "👀", "🫂", "💔",
  "🫣", "😬", "💯", "🎯", "🤭", "😶", "🙈", "😏",
];

const TABS: Array<{ label: string; value: ConfessionCategory }> = [
  { label: "All", value: "all" },
  { label: "Library", value: "library" },
  { label: "Hostel", value: "hostel" },
  { label: "Fest", value: "fest" },
  { label: "Breakups", value: "breakup" }
];

const SAMPLE_CONFESSIONS: Confession[] = [
  {
    _id: "sc-1",
    text: "There's someone in my CS205 lab who makes every assignment feel worth it. Haven't spoken to them once. I just panic-submit whenever they glance over 😭",
    category: "library",
    likes: 247,
    shares: 18,
    reports: 0,
    commentsCount: 34,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    liked: false,
  },
  {
    _id: "sc-2",
    text: "Matched on Campus Crush with someone from my own hostel floor. We pass each other every day and neither of us has said a single word. This app is cursed.",
    category: "hostel",
    likes: 892,
    shares: 67,
    reports: 0,
    commentsCount: 112,
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    liked: true,
  },
  {
    _id: "sc-3",
    text: "I returned a pen to someone at the library. We talked for 3 hours. We've now been dating for 4 months. Never underestimate a blue Parker.",
    category: "library",
    likes: 1432,
    shares: 201,
    reports: 0,
    commentsCount: 245,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    liked: false,
  },
  {
    _id: "sc-4",
    text: "My situationship just introduced me to their friends as 'just a friend' while they literally made eye contact with me for 4 seconds before saying it. I'm not okay.",
    category: "confession",
    likes: 543,
    shares: 44,
    reports: 0,
    commentsCount: 87,
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    liked: false,
  },
  {
    _id: "sc-5",
    text: "We broke up 3 months ago and somehow ended up in the same optional elective this semester. Professor keeps pairing us together for group activities. Universe has a sense of humor.",
    category: "breakup",
    likes: 678,
    shares: 52,
    reports: 0,
    commentsCount: 93,
    createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    liked: false,
  },
  {
    _id: "sc-6",
    text: "Accidentally texted my crush 'goodnight babe' instead of my actual partner. Wrong contact, same name. I need to move universities.",
    category: "funny",
    likes: 2104,
    shares: 338,
    reports: 0,
    commentsCount: 412,
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    liked: true,
  },
];

export default function ConfessionsPage() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const toast = useToastStore((state) => state.push);
  const queryClient = useQueryClient();
  const university = user?.university || "LPU";
  const isAuthenticated = !!token;

  const [category, setCategory] = useState<ConfessionCategory>("all");
  const [sortMode, setSortMode] = useState<"new" | "top">("new");
  const [text, setText] = useState("");
  const [postCategory, setPostCategory] = useState<ConfessionCategory>("confession");
  const [showForm, setShowForm] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const confessionsQuery = useQuery({
    queryKey: ["confessions", university, category],
    queryFn: async () => {
      const response = await api.get("/confessions", { params: { university, category } });
      return response.data?.data || [];
    },
    staleTime: 30_000
  });

  const confessionData = (confessionsQuery.data as Confession[] | undefined) || [];
  const confessions = useMemo(() => {
    const source = confessionData.length > 0 ? confessionData : SAMPLE_CONFESSIONS;
    const filtered = category === "all" ? source : source.filter((c) => c.category === category);
    if (sortMode === "top") return [...filtered].sort((left, right) => right.likes - left.likes);
    return filtered;
  }, [confessionData, sortMode, category]);

  const reload = () => queryClient.invalidateQueries({ queryKey: ["confessions"] });

  const insertEmoji = (emoji: string) => {
    const el = textareaRef.current;
    if (!el) { setText((t) => t + emoji); return; }
    const start = el.selectionStart ?? text.length;
    const end = el.selectionEnd ?? text.length;
    const next = text.slice(0, start) + emoji + text.slice(end);
    setText(next);
    // Restore cursor after emoji
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + emoji.length, start + emoji.length);
    });
    setShowEmojiPicker(false);
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated) throw new Error("Please sign in to post.");
      await api.post("/confessions", { university, text: text.trim(), category: postCategory });
    },
    onSuccess: () => {
      setText("");
      setShowForm(false);
      setShowEmojiPicker(false);
      toast({ title: "Posted anonymously", variant: "success" });
      reload();
    },
    onError: (error: any) => {
      const msg = error?.message === "Please sign in to post."
        ? "Please sign in to post anonymously."
        : error?.response?.data?.message || error?.message || "Try again.";
      toast({ title: "Post failed", message: msg, variant: "error" });
    }
  });

  const likeMutation = useMutation({ mutationFn: async (id: string) => api.post(`/confessions/${id}/like`), onSuccess: () => reload() });
  const shareMutation = useMutation({
    mutationFn: async (id: string) => api.post(`/confessions/${id}/share`),
    onSuccess: () => {
      toast({ title: "Shared", variant: "success" });
      reload();
    }
  });
  const reportMutation = useMutation({
    mutationFn: async (id: string) => api.post(`/confessions/${id}/report`),
    onSuccess: () => {
      toast({ title: "Reported", variant: "success" });
      reload();
    }
  });
  const commentMutation = useMutation({
    mutationFn: async ({ id, message }: { id: string; message: string }) => api.post(`/confessions/${id}/comment`, { text: message }),
    onSuccess: (_data, variables) => {
      setCommentDrafts((current) => ({ ...current, [variables.id]: "" }));
      reload();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/confessions/${id}`),
    onSuccess: () => {
      toast({ title: "Confession deleted", variant: "success" });
      reload();
    },
    onError: () => toast({ title: "Could not delete", variant: "error" })
  });

  const reactMutation = useMutation({
    mutationFn: async ({ id, emoji }: { id: string; emoji: string }) =>
      api.post(`/confessions/${id}/react`, { emoji }),
    onSuccess: () => reload()
  });

  const timeAgo = (value: string) => {
    const diff = Date.now() - new Date(value).getTime();
    const minutes = Math.max(1, Math.floor(diff / 60_000));
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return `${Math.floor(minutes / 1440)}d ago`;
  };

  return (
    <div className="w-full">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-pink-100 bg-white shadow-[0_4px_24px_rgba(255,45,120,0.08)]">
        <div className="relative px-5 pt-4 pb-2">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-purple-500/15 blur-2xl" />
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FF2D78] shadow-[0_4px_12px_rgba(255,45,120,0.4)]">
                <Ghost className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#2D1810]">Anonymous Wall</h1>
                <p className="text-xs text-[#9B7065]">Campus confessions, comments, reactions, and reporting</p>
              </div>
            </div>
            <SectionCloseButton />
          </div>
        </div>

        <div className="space-y-2 px-5 pb-4">
          <div className="flex gap-1 rounded-2xl border border-pink-100 bg-pink-50/60 p-1">
            <button type="button" onClick={() => setSortMode("new")} className={`flex-1 rounded-xl py-1.5 text-xs font-medium ${sortMode === "new" ? "bg-[#FF2D78] text-white" : "text-[#9B7065]"}`}>New</button>
            <button type="button" onClick={() => setSortMode("top")} className={`flex-1 rounded-xl py-1.5 text-xs font-medium ${sortMode === "top" ? "bg-[#FF2D78] text-white" : "text-[#9B7065]"}`}>Top</button>
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {TABS.map((tab) => (
              <button key={tab.value} type="button" onClick={() => setCategory(tab.value)} className={`rounded-full px-3 py-1.5 text-xs ${category === tab.value ? "bg-[#FF2D78] text-white" : "border border-pink-100 bg-pink-50/60 text-[#9B7065]"}`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-1.5 pr-1">
            {confessionsQuery.isLoading ? Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-28 animate-pulse rounded-2xl bg-pink-50" />) : null}
            <AnimatePresence initial={false}>
              {confessions.map((confession) => (
                <motion.div key={confession._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-pink-100 bg-white px-3 py-2.5">
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[11px] text-[#9B7065]">
                      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-pink-300 to-rose-400" />
                      <span>Anonymous</span>
                      <span>•</span>
                      <span>{timeAgo(confession.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full border border-pink-100 bg-pink-50 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-[#9B7065]">{confession.category}</span>
                      {confession.isOwner ? (
                        <button
                          type="button"
                          onClick={() => deleteMutation.mutate(confession._id)}
                          disabled={deleteMutation.isPending}
                          title="Delete your confession"
                          className="flex items-center justify-center rounded-full p-1 text-rose-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-[#2D1810]">{confession.text}</p>

                  {/* Emoji reactions */}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {EMOJI_PALETTE.map((emoji) => {
                      const bucket = (confession.reactions || []).find((r) => r.emoji === emoji);
                      const count = bucket?.count ?? 0;
                      const reacted = bucket?.reacted ?? false;
                      return (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => reactMutation.mutate({ id: confession._id, emoji })}
                          className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition ${
                            reacted
                              ? "border-[#FF2D78]/40 bg-pink-50 font-semibold text-[#FF2D78]"
                              : "border-pink-100 bg-white text-[#9B7065] hover:border-pink-200 hover:bg-pink-50"
                          }`}
                        >
                          <span>{emoji}</span>
                          {count > 0 ? <span>{count}</span> : null}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-2 flex items-center gap-4 text-xs text-[#9B7065]">
                      <button type="button" onClick={() => likeMutation.mutate(confession._id)} className={`flex items-center gap-1 ${confession.liked ? "text-[#FF2D78]" : ""}`}>
                      <Heart className={`h-3.5 w-3.5 ${confession.liked ? "fill-[#FF2D78]" : ""}`} />
                      {confession.likes}
                    </button>
                    <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" />{confession.commentsCount}</span>
                    <button type="button" onClick={() => shareMutation.mutate(confession._id)} className="flex items-center gap-1"><Share2 className="h-3.5 w-3.5" />{confession.shares}</button>
                    <button type="button" onClick={() => reportMutation.mutate(confession._id)} className="flex items-center gap-1 text-rose-500"><Flag className="h-3.5 w-3.5" />Report</button>
                  </div>
                  <div className="mt-1.5 flex gap-1.5">
                    <input
                      value={commentDrafts[confession._id] || ""}
                      onChange={(event) => setCommentDrafts((current) => ({ ...current, [confession._id]: event.target.value }))}
                      placeholder="Add an anonymous comment"
                      className="flex-1 rounded-full border border-pink-100 bg-[#FFF8F0] px-3 py-1.5 text-xs text-[#2D1810] outline-none placeholder:text-[#9B7065]/60"
                    />
                    <button
                      type="button"
                      onClick={() => commentMutation.mutate({ id: confession._id, message: commentDrafts[confession._id] || "" })}
                      disabled={!(commentDrafts[confession._id] || "").trim()}
                      className="rounded-full bg-[#FF2D78] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      Send
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {showForm ? (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden rounded-2xl border border-pink-100 bg-pink-50/40 p-3">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {(["confession", "crush-story", "breakup", "funny", "library", "fest", "hostel"] as ConfessionCategory[]).map((item) => (
                    <button key={item} type="button" onClick={() => setPostCategory(item)} className={`rounded-full px-3 py-1.5 text-[11px] ${postCategory === item ? "bg-[#FF2D78] text-white" : "border border-pink-100 bg-white text-[#9B7065]"}`}>
                      {item}
                    </button>
                  ))}
                </div>

                {/* Textarea + emoji picker */}
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    maxLength={400}
                    rows={4}
                    className="w-full resize-none rounded-2xl border border-pink-100 bg-white p-3 pb-8 text-sm text-[#2D1810] outline-none placeholder:text-[#9B7065]/60"
                    placeholder="Library crush? Hostel secret? Fest chaos? Drop it here."
                  />
                  {/* Emoji toggle button — bottom-left inside textarea */}
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker((v) => !v)}
                    className="absolute bottom-2.5 left-3 flex items-center gap-1 rounded-full bg-pink-50 px-2 py-0.5 text-xs text-[#9B7065] transition hover:bg-pink-100"
                  >
                    😊 <span>Emoji</span>
                  </button>
                  <span className="absolute bottom-2.5 right-3 text-[10px] text-[#9B7065]/60">{text.length}/400</span>
                </div>

                {/* Emoji picker grid */}
                <AnimatePresence>
                  {showEmojiPicker ? (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="grid grid-cols-8 gap-1 rounded-2xl border border-pink-100 bg-white p-2 shadow-sm"
                    >
                      {PICKER_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => insertEmoji(emoji)}
                          className="flex items-center justify-center rounded-lg p-1.5 text-lg transition hover:bg-pink-50 active:scale-90"
                        >
                          {emoji}
                        </button>
                      ))}
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <div className="flex gap-2">
                  <button type="button" onClick={() => { setShowForm(false); setShowEmojiPicker(false); }} className="flex-1 rounded-full border border-pink-100 bg-white py-2.5 text-xs text-[#9B7065]">Cancel</button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!isAuthenticated) {
                        toast({ title: "Sign in required", message: "Please sign in to post anonymously.", variant: "error" });
                        return;
                      }
                      createMutation.mutate();
                    }}
                    disabled={!text.trim() || createMutation.isPending}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#FF2D78] py-2.5 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {createMutation.isPending ? "Posting..." : "Post Anonymously"}
                  </button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {!showForm ? (
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }} onClick={() => setShowForm(true)} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#FF2D78] py-3 text-sm font-semibold text-white shadow-[0_4px_18px_rgba(255,45,120,0.42)]">
              <Plus className="h-4 w-4" />
              Drop a Confession
            </motion.button>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}