"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Bell, Brain, Crown, Heart, MessageCircle, Star, Zap } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useApiSWR } from "@/hooks/use-api-swr";
import { DEMO_STUDENT_SEEDS } from "@/lib/demo-content";
import { formatRelativeTime, getProfileImage } from "@/lib/media";
import { RelativeTime } from "@/components/ui/RelativeTime";

type OnlineUser = {
  id: string;
  name: string;
  photo: string;
  university: string;
  age: number;
};

const COACH_TIPS = [
  "Start with a genuine compliment about their bio.",
  "Ask about their interests, not just their photos.",
  "Keep the opener playful and specific to campus life.",
  "A short confident message performs better than a paragraph.",
  "Reply to something they shared before changing topics."
];

const SAMPLE_RECENT_MATCHES = DEMO_STUDENT_SEEDS.slice(0, 3).map((student, index) => ({
  _id: `sample-chat-${index + 1}`,
  users: [
    { _id: "self" },
    {
      _id: student.id,
      fullName: student.name,
      photos: student.images,
      university: student.university,
      age: student.age,
    },
  ],
  online: student.online,
  latestMessage: {
    content: ["You still owe me coffee.", "That campus concert was actually good.", "Send me the playlist when you're free."][index],
    createdAt: new Date(Date.now() - (index + 1) * 3600000).toISOString(),
    type: "text",
  },
  unreadCount: index === 0 ? 2 : 0,
  matchedAt: new Date(Date.now() - (index + 2) * 86400000).toISOString(),
}));

export function RightPanel() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const hydrated = useAuthStore((state) => state.hydrated);

  const { data: discoverData } = useApiSWR<any[]>(token && hydrated ? ["/discover", { university: user?.university || "LPU", filter: "All" }] : null);
  const { data: matchesData } = useApiSWR<any[]>(token && hydrated ? "/chat/matches" : null);
  const { data: profileData } = useApiSWR<{ user: any }>(token && hydrated ? "/auth/profile" : null);
  const { data: eventData } = useApiSWR<any[]>(["/events", { university: user?.university || "LPU" }]);

  const tip = useMemo(() => {
    const seed = (matchesData?.length || 0) + (discoverData?.length || 0) + (eventData?.length || 0);
    return COACH_TIPS[seed % COACH_TIPS.length];
  }, [discoverData?.length, eventData?.length, matchesData?.length]);

  const onlineUsers = useMemo<OnlineUser[]>(() => {
    const source = (discoverData && discoverData.length > 0)
      ? discoverData
      : DEMO_STUDENT_SEEDS.slice(0, 5).map((student) => ({
          _id: student.id,
          fullName: student.name,
          photos: student.images,
          university: student.university,
          age: student.age,
        }));
    return source.slice(0, 5).map((entry: any) => ({
      id: String(entry._id),
      name: entry.fullName,
      photo: getProfileImage(entry.photos?.[0], entry.fullName || String(entry._id)),
      university: entry.university,
      age: entry.age || 20
    }));
  }, [discoverData]);

  const recentMatches = (matchesData && matchesData.length > 0) ? matchesData : SAMPLE_RECENT_MATCHES;

  const notifications = useMemo(() => {
    const profile = profileData?.user;
    const profileId = String(profile?.id || profile?._id || user?.id || user?._id || "");
    const unreadMatches = (matchesData || []).filter((match: any) => (match.unreadCount || 0) > 0);
    const recentMatches = (matchesData || []).slice(0, 2);
    const upcomingEvents = (eventData || []).slice(0, 2);

    return [
      ...(profile?.likesCount ? [{ id: "likes", text: `${profile.likesCount} people liked your profile`, time: "Live", type: "like" as const }] : []),
      ...(profile?.profileViews ? [{ id: "views", text: `${profile.profileViews} recent profile views`, time: "Live", type: "view" as const }] : []),
      ...unreadMatches.slice(0, 2).map((match: any) => {
        const otherUser = (match.users || []).find((entry: any) => String(entry._id || entry) !== profileId);
        return {
          id: `msg-${match._id}`,
          text: `${match.unreadCount} unread messages from ${otherUser?.fullName || "a match"}`,
          time: formatRelativeTime(match.latestMessage?.createdAt),
          type: "message" as const
        };
      }),
      ...recentMatches.map((match: any) => {
        const otherUser = (match.users || []).find((entry: any) => String(entry._id || entry) !== profileId);
        return {
          id: `match-${match._id}`,
          text: `New match with ${otherUser?.fullName || "someone new"}`,
          time: formatRelativeTime(match.matchedAt || match.createdAt),
          type: "match" as const
        };
      }),
      ...upcomingEvents.map((event: any) => ({
        id: `event-${event._id}`,
        text: `${event.title} is coming up at ${event.venue}`,
        time: formatRelativeTime(event.date),
        type: "event" as const
      }))
    ].slice(0, 5);
  }, [eventData, matchesData, profileData?.user, user?.id, user?._id]);

  return (
    <aside className="sticky top-0 flex h-fit max-h-screen w-full flex-col gap-3 overflow-y-auto px-3 py-4 scrollbar-hide">

      {/* Today's Activity — compact stat row */}
      <div className="editorial-card rounded-[26px] px-3 py-2.5">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--text-muted)]">Today</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { value: String(profileData?.user?.likesCount || 0), label: "Likes",   color: "text-pink-300"    },
            { value: String(matchesData?.length || 0),           label: "Matches", color: "text-purple-300"  },
            { value: String(profileData?.user?.profileViews || 0), label: "Views", color: "text-fuchsia-300" }
          ].map(({ value, label, color }) => (
            <div key={label} className="rounded-xl py-2" style={{ background: "var(--surface-hover)" }}>
              <p className={`text-base font-bold leading-tight ${color}`}>{value}</p>
              <p className="text-[9px] text-[var(--text-muted)]">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="editorial-card rounded-[26px] p-3">
        <div className="mb-2 flex items-center gap-2">
          <Bell className="h-3.5 w-3.5" style={{ color: "var(--nav-icon-active)" }} />
          <p className="font-display text-[12px] font-semibold text-[var(--text-primary)]">Notifications</p>
          {notifications.length > 0 && (
            <span className="ml-auto rounded-full border px-1.5 py-0.5 text-[9px] font-bold" style={{ borderColor: "color-mix(in srgb, var(--nav-icon-active) 28%, transparent)", background: "var(--surface-hover)", color: "var(--nav-icon-active)" }}>{notifications.length}</span>
          )}
        </div>
        <div className="space-y-1.5">
          {notifications.length === 0 ? (
            <p className="rounded-xl px-2.5 py-2 text-[11px] text-[var(--text-muted)]" style={{ background: "var(--surface-hover)" }}>Likes, matches &amp; events will appear here.</p>
          ) : notifications.map((n) => (
            <div key={n.id} className="flex items-start gap-2 rounded-xl px-2.5 py-1.5" style={{ background: "var(--surface-hover)" }}>
              <div className={`mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                n.type === "like" ? "bg-pink-400" : n.type === "match" ? "bg-purple-400" : n.type === "event" ? "bg-cyan-400" : n.type === "view" ? "bg-yellow-400" : "bg-emerald-400"
              }`} />
              <div className="min-w-0">
                <p className="text-[11px] leading-snug text-[var(--text-primary)]">{n.text}</p>
                <p className="text-[10px] text-[var(--text-muted)]" suppressHydrationWarning>{n.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Online Now */}
      <div className="editorial-card rounded-[26px] p-3">
        <div className="mb-2 flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.9)]" />
          <p className="font-display text-[12px] font-semibold text-[var(--text-primary)]">Online Now</p>
          <span className="ml-auto text-[10px] text-[var(--text-muted)]">{onlineUsers.length} students</span>
        </div>
        <div className="space-y-1.5">
          {onlineUsers.length === 0
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2.5 animate-pulse">
                      <div className="h-8 w-8 flex-shrink-0 rounded-full bg-[#fbcfe8]/15" />
                  <div className="flex-1 space-y-1">
                    <div className="h-2 w-20 rounded bg-[#fbcfe8]/18" />
                    <div className="h-1.5 w-14 rounded bg-[#f7e7b2]/10" />
                  </div>
                </div>
              ))
            : onlineUsers.map((u) => (
                <Link key={u.id} href="/discover">
                  <motion.div whileHover={{ x: 2 }} className="flex cursor-pointer items-center gap-2 rounded-xl px-1 py-1 transition-colors hover:bg-[var(--surface-hover)]">
                    <div className="relative h-8 w-8 flex-shrink-0">
                      <img src={u.photo} alt={u.name} className="h-8 w-8 rounded-full border object-cover" style={{ borderColor: "color-mix(in srgb, var(--nav-icon-active) 20%, transparent)" }} loading="lazy" decoding="async" />
                      <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border bg-emerald-400" style={{ borderColor: "color-mix(in srgb, var(--surface-panel) 95%, transparent)" }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-medium text-[var(--text-primary)]">{u.name}, {u.age}</p>
                      <p className="truncate text-[10px] text-[var(--text-muted)]">{u.university}</p>
                    </div>
                    <Heart className="h-3 w-3 flex-shrink-0" style={{ color: "color-mix(in srgb, var(--accent-rose) 60%, var(--text-muted) 40%)" }} />
                  </motion.div>
                </Link>
              ))}
        </div>
        <Link href="/discover">
          <button className="mt-2 w-full rounded-xl border py-1.5 text-[10px] transition-colors hover:text-[var(--text-primary)]" style={{ borderColor: "color-mix(in srgb, var(--nav-icon-active) 12%, transparent)", background: "var(--surface-hover)", color: "var(--text-muted)" }}>
            View all students →
          </button>
        </Link>
      </div>

      {/* AI Coach Tip */}
      <div className="rounded-[26px] border p-3" style={{ borderColor: "color-mix(in srgb, var(--nav-icon-active) 16%, transparent)", background: "linear-gradient(135deg, color-mix(in srgb, var(--accent-rose) 18%, var(--surface-card) 82%), color-mix(in srgb, var(--accent-purple) 14%, var(--surface-card) 86%), color-mix(in srgb, var(--accent-gold) 10%, var(--surface-card) 90%))", boxShadow: "var(--shadow-soft)" }}>
        <div className="mb-2 flex items-center gap-2">
          <Brain className="h-3.5 w-3.5" style={{ color: "var(--nav-icon-active)" }} />
          <p className="font-script text-[1.6rem] leading-none text-[var(--text-primary)]">Cupid AI</p>
          <Star className="ml-auto h-3 w-3" style={{ color: "var(--nav-icon-active)" }} />
        </div>
        <p className="text-[11px] leading-relaxed text-[var(--text-soft)]">{tip}</p>
        <Link href="/coach">
          <button className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border py-2 text-[11px] font-medium transition-all hover:bg-[var(--surface-active)]" style={{ borderColor: "color-mix(in srgb, var(--nav-icon-active) 20%, transparent)", background: "var(--surface-hover)", color: "var(--text-primary)" }}>
            <Brain className="h-3 w-3" />
            Open AI Coach
          </button>
        </Link>
      </div>

      {/* Go Premium */}
      <div className="rounded-[26px] border p-3" style={{ borderColor: "color-mix(in srgb, var(--nav-icon-active) 16%, transparent)", background: "linear-gradient(135deg, color-mix(in srgb, var(--accent-rose) 22%, var(--surface-card) 78%), color-mix(in srgb, var(--accent-gold) 18%, var(--surface-card) 82%))", boxShadow: "var(--shadow-soft)" }}>
        <div className="mb-1.5 flex items-center gap-2">
          <Crown className="h-3.5 w-3.5" style={{ color: "var(--nav-icon-active)" }} />
          <p className="font-script text-[1.6rem] leading-none text-[var(--text-primary)]">Premium</p>
        </div>
        <p className="mb-2 text-[10px] text-[var(--text-muted)]">Unlimited likes, AI coach, priority match &amp; more</p>
        <div className="mb-2 space-y-1">
          {["Unlimited Likes", "Profile Boost", "Priority Match"].map((f) => (
            <div key={f} className="flex items-center gap-1.5 text-[10px] text-[var(--text-soft)]">
              <Zap className="h-2.5 w-2.5" style={{ color: "var(--nav-icon-active)" }} />
              {f}
            </div>
          ))}
        </div>
        <Link href="/premium">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="w-full rounded-xl border border-[#f7e7b2]/26 bg-[linear-gradient(135deg,#f7e0eb_0%,#f6dce3_35%,#ead79b_100%)] py-2 text-[11px] font-semibold text-[#2a132f] shadow-[0_14px_28px_rgba(231,184,164,0.18)]">
            Upgrade Now — ₹499/mo
          </motion.button>
        </Link>
      </div>

      {/* Recent Chats */}
      <div className="editorial-card rounded-[26px] p-3">
        <div className="mb-2 flex items-center gap-2">
          <MessageCircle className="h-3.5 w-3.5" style={{ color: "var(--nav-icon-active)" }} />
          <p className="font-display text-[12px] font-semibold text-[var(--text-primary)]">Recent Chats</p>
          <Link href="/chat" className="ml-auto text-[10px] transition-colors hover:text-[var(--text-primary)]" style={{ color: "var(--nav-icon-active)" }}>All →</Link>
        </div>
        <div className="space-y-1.5">
          {recentMatches.slice(0, 3).map((match: any) => {
            const profileId = String(profileData?.user?.id || user?.id || user?._id || "");
            const otherUser = (match.users || []).find((e: any) => String(e._id || e) !== profileId);
            const image = getProfileImage(otherUser?.photos?.[0], otherUser?.fullName || String(match._id));
            const preview = match.latestMessage?.deletedAt
              ? "Message deleted"
              : match.latestMessage?.content
              || (match.latestMessage?.type === "image" ? "📷 Photo" : match.latestMessage?.type === "voice" ? "🎤 Voice" : "Start the chat");
            return (
              <Link key={match._id} href={`/chat?match=${match._id}`}>
                <div className="flex cursor-pointer items-center gap-2 rounded-xl px-1 py-1.5 transition-colors hover:bg-[var(--surface-hover)]">
                  <div className="relative h-8 w-8 flex-shrink-0">
                    <img src={image} alt={otherUser?.fullName || "Match"} className="h-8 w-8 rounded-full object-cover" loading="lazy" decoding="async" />
                    {match.online && <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border bg-emerald-400" style={{ borderColor: "color-mix(in srgb, var(--surface-panel) 95%, transparent)" }} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium text-[var(--text-primary)]">{otherUser?.fullName || "Match"}</p>
                    <p className="truncate text-[10px] text-[var(--text-muted)]">{preview}</p>
                  </div>
                  <RelativeTime value={match.latestMessage?.createdAt} className="flex-shrink-0 text-[9px] text-[var(--text-muted)]" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
