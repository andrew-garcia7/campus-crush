"use client";

import { useEffect, useMemo, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { useAuthStore } from "@/store/auth-store";
import { getUserIdFromToken } from "@/lib/auth";
import { motion } from "framer-motion";
import { MessageCircle, Search, Sparkles } from "lucide-react";
import type { ChatMatch } from "@/components/chat/chat-types";
import { useApiSWR } from "@/hooks/use-api-swr";
import { getProfileImage } from "@/lib/media";
import { DEMO_STUDENT_SEEDS } from "@/lib/demo-content";
import { uniqueStrings, getDemoStudentSeed } from "@/lib/demo-content";
import { SectionCloseButton } from "@/components/layout/section-close-button";
import { RelativeTime } from "@/components/ui/RelativeTime";

const SAMPLE_MATCH_MESSAGES = [
  { content: "Hey! When are you free this weekend? 😊", type: "text" as const, minutesAgo: 8, unreadCount: 2 },
  { content: "That biryani place you recommended was 🔥", type: "text" as const, minutesAgo: 120, unreadCount: 0 },
  { content: "Photo", type: "image" as const, minutesAgo: 15, unreadCount: 5 },
  { content: "See you at the speed dating night tomorrow?", type: "text" as const, minutesAgo: 1440, unreadCount: 0 },
  { content: "Voice note", type: "voice" as const, minutesAgo: 45, unreadCount: 1 },
];

const SAMPLE_MATCHES: ChatMatch[] = DEMO_STUDENT_SEEDS.slice(0, 5).map((student, index) => ({
  matchId: `demo-match-${index + 1}`,
  name: student.name,
  photo: student.images[0],
  fallbackPhotos: uniqueStrings([...student.images, getProfileImage("", student.name)]),
  university: student.university,
  unreadCount: SAMPLE_MATCH_MESSAGES[index]?.unreadCount || 0,
  online: student.online,
  latestMessage: {
    content: SAMPLE_MATCH_MESSAGES[index]?.content,
    type: SAMPLE_MATCH_MESSAGES[index]?.type,
    createdAt: new Date(Date.now() - (SAMPLE_MATCH_MESSAGES[index]?.minutesAgo || 10) * 60000).toISOString(),
    deletedAt: null,
  },
}));

export default function ChatPage() {
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthStore((s) => s.hydrated);
  const userId = getUserIdFromToken(token);
  const [matches, setMatches] = useState<ChatMatch[]>(SAMPLE_MATCHES);
  const [activeMatch, setActiveMatch] = useState<ChatMatch | null>(null);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useApiSWR<any[]>(token && hydrated ? "/chat/matches" : null);

  const mappedMatches = useMemo<ChatMatch[]>(() => {
    return (data || []).map((match: any) => {
      const other = match.users?.find((entry: any) => String(entry._id || entry) !== userId);
      const seed = getDemoStudentSeed(other?.fullName, 0);
      const fallbackPhotos = uniqueStrings([
        ...(Array.isArray(other?.photos) ? other.photos.map((photo: string) => getProfileImage(photo, other?.fullName || String(match._id))) : []),
        ...seed.images,
        getProfileImage("", other?.fullName || seed.name)
      ]);
      return {
        matchId: String(match._id),
        name: other?.fullName || "Match",
        photo: fallbackPhotos[0] || getProfileImage("", other?.fullName || seed.name),
        fallbackPhotos,
        university: other?.university || "",
        unreadCount: match.unreadCount || 0,
        otherUserId: match.otherUserId ? String(match.otherUserId) : undefined,
        online: Boolean(match.online),
        latestMessage: match.latestMessage
          ? {
              content: match.latestMessage.content,
              type: match.latestMessage.type,
              createdAt: match.latestMessage.createdAt,
              deletedAt: match.latestMessage.deletedAt || null
            }
          : null
      };
    });
  }, [data, userId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const matchParam = params.get("match");
    if (matchParam) {
      setActiveMatch({ matchId: matchParam, name: "Chat", photo: "", university: "", unreadCount: 0, online: false });
    }
  }, []);

  useEffect(() => {
    setMatches(mappedMatches.length > 0 ? mappedMatches : SAMPLE_MATCHES);
    const params = new URLSearchParams(window.location.search);
    const matchParam = params.get("match");
    if (matchParam) {
      const deepLinked = mappedMatches.find((match) => match.matchId === matchParam);
      if (deepLinked) setActiveMatch(deepLinked);
    }
  }, [mappedMatches]);

  useEffect(() => {
    if (!userId || !matches.length) return;
    const socket: Socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000");
    socket.emit("register_user", userId);
    socket.emit("request_presence", { userIds: matches.map((match) => match.otherUserId).filter(Boolean) });
    socket.on("presence_snapshot", ({ onlineUserIds }: { onlineUserIds: string[] }) => {
      setMatches((current) => current.map((match) => ({ ...match, online: Boolean(match.otherUserId && onlineUserIds.includes(match.otherUserId)) })));
    });
    socket.on("presence_changed", ({ userId: changedUserId, online }: { userId: string; online: boolean }) => {
      setMatches((current) => current.map((match) => (match.otherUserId === changedUserId ? { ...match, online } : match)));
    });
    return () => {
      socket.disconnect();
    };
  }, [matches.length, userId]);

  const cardClass = "mx-auto w-full max-w-[430px]";
  const innerClass = "overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-[0_4px_24px_rgba(255,45,120,0.08)]" ;
  const visibleMatches = matches.filter((match) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return match.name.toLowerCase().includes(query) || match.university.toLowerCase().includes(query);
  });
  const onlineMatches = matches.filter((match) => match.online).slice(0, 8);

  const previewText = (match: ChatMatch) => {
    if (!match.latestMessage) return "Say hi and start your first conversation";
    if (match.latestMessage.deletedAt) return "Message deleted";
    if (match.latestMessage.type === "image") return "Photo";
    if (match.latestMessage.type === "voice") return "Voice note";
    return match.latestMessage.content || "New message";
  };

  const handleMatchPhotoError = (event: React.SyntheticEvent<HTMLImageElement>, match: ChatMatch) => {
    const image = event.currentTarget;
    const fallbackSources = uniqueStrings([...(match.fallbackPhotos || []), getProfileImage("", match.name)]);
    const currentIndex = Number(image.dataset.fallbackIndex || "0");
    const nextSource = fallbackSources[currentIndex + 1];

    if (nextSource) {
      image.dataset.fallbackIndex = String(currentIndex + 1);
      image.src = nextSource;
      return;
    }

    image.onerror = null;
    image.src = getProfileImage("", match.name);
  };

  if (activeMatch) {
    return (
      <div className={cardClass}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={innerClass}>
          <ChatWindow matchId={activeMatch.matchId} participant={activeMatch} onBack={() => setActiveMatch(null)} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className={cardClass}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={innerClass}>
        <div className="relative overflow-hidden px-5 pt-6 pb-3">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-pink-500/15 blur-2xl" />
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FF2D78] shadow-[0_4px_12px_rgba(255,45,120,0.4)]">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#2D1810]">Chats</h1>
                <p className="text-xs text-[#9B7065]">Search, reply, call, and stay in sync</p>
              </div>
            </div>
            <SectionCloseButton />
          </div>
        </div>
        <div className="space-y-4 px-4 pb-6 sm:px-5">
          <div className="flex items-center gap-2 rounded-2xl border border-pink-100 bg-[#FFF8F0] px-3 py-2.5">
            <Search className="h-4 w-4 text-[#9B7065]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search chats"
              className="w-full bg-transparent text-sm text-[#2D1810] outline-none placeholder:text-[#9B7065]/60"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.28em] text-[#9B7065]">
              <Sparkles className="h-3.5 w-3.5" /> Online now
            </div>
            {isLoading ? (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex min-w-[72px] flex-col items-center gap-2 animate-pulse">
                    <div className="h-14 w-14 rounded-full bg-pink-100" />
                    <div className="h-2.5 w-10 rounded bg-pink-100" />
                  </div>
                ))}
              </div>
            ) : onlineMatches.length === 0 ? (
              <div className="rounded-2xl border border-pink-100 bg-pink-50/60 px-3 py-4 text-center text-sm text-[#9B7065]">
                No one from your recent chats is online right now.
              </div>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                {onlineMatches.map((match) => (
                  <button key={match.matchId} type="button" onClick={() => setActiveMatch(match)} className="flex min-w-[72px] flex-col items-center gap-2">
                    <div className="relative h-14 w-14 overflow-hidden rounded-full border border-pink-200 bg-gradient-to-br from-pink-100 to-rose-100">
                      <img src={match.photo} alt={match.name} className="h-full w-full object-cover" loading="lazy" decoding="async" data-fallback-index="0" onError={(event) => handleMatchPhotoError(event, match)} />
                      <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400" />
                    </div>
                    <span className="truncate text-xs text-[#2D1810]">{match.name.split(" ")[0]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-3 pt-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-20 animate-pulse rounded-[24px] bg-pink-50" />
              ))}
            </div>
          ) : visibleMatches.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <MessageCircle className="h-12 w-12 text-pink-300" />
              <p className="text-sm font-medium text-[#2D1810]">No chats found</p>
              <p className="text-xs text-[#9B7065]">Try another name or keep swiping to find your campus crush.</p>
            </div>
          ) : (
            visibleMatches.map((match) => (
              <motion.button
                key={match.matchId}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveMatch(match)}
                className="flex w-full items-center gap-3 rounded-[24px] border border-pink-100 bg-white p-3 text-left transition hover:border-pink-200 hover:bg-pink-50/40"
              >
                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-pink-200 bg-gradient-to-br from-pink-100 to-rose-100">
                  <img src={match.photo} alt={match.name} className="h-full w-full object-cover" loading="lazy" decoding="async" data-fallback-index="0" onError={(event) => handleMatchPhotoError(event, match)} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-[#2D1810]">{match.name}</p>
                    {match.online ? <span className="h-2 w-2 rounded-full bg-emerald-400" /> : null}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-[#9B7065]">{previewText(match)}</p>
                  <p className="mt-1 text-[11px] text-[#9B7065]/70">{match.university}</p>
                </div>
                <div className="ml-auto flex flex-col items-end gap-1">
                  {match.latestMessage?.createdAt ? <RelativeTime value={match.latestMessage.createdAt} className="text-[10px] text-[#9B7065]/60" /> : null}
                  {match.unreadCount > 0 ? <span className="rounded-full bg-[#FF2D78] px-2 py-0.5 text-[10px] font-semibold text-white">{match.unreadCount}</span> : null}
                </div>
              </motion.button>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}

