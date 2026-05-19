"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, EllipsisVertical, Flag, ImageIcon, Mic, Phone, Reply, Search, ShieldBan, Trash2, Video, X } from "lucide-react";
import { mutate } from "swr";
import { ChatInput } from "./ChatInput";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/auth-store";
import { getUserIdFromToken } from "@/lib/auth";
import type { ChatMessage, ReplyPreview } from "./chat-types";
import { useToastStore } from "@/store/toast-store";

const getOrigin = () => {
  const baseUrl = api.defaults.baseURL;
  return typeof baseUrl === "string" ? new URL(baseUrl).origin : "http://localhost:5000";
};

const resolveAssetUrl = (value?: string) => {
  if (!value) return "";
  if (/^https?:\/\//.test(value)) return value;
  return `${getOrigin()}${value}`;
};

const mapMessage = (message: any, currentUserId: string): ChatMessage => ({
  id: String(message._id || message.id),
  senderId: String(message.senderId),
  mine: String(message.senderId) === currentUserId,
  type: message.type,
  text: message.content || "",
  imageUrl: message.type === "image" ? resolveAssetUrl(message.mediaUrl) : undefined,
  audioUrl: message.type === "voice" ? resolveAssetUrl(message.mediaUrl) : undefined,
  createdAt: message.createdAt || new Date().toISOString(),
  seen: Array.isArray(message.seenBy) ? message.seenBy.length > 1 : false,
  delivered: true,
  deleted: Boolean(message.deletedAt),
  reactions: (message.reactions || []).map((reaction: any) => ({ emoji: reaction.emoji, userId: String(reaction.userId), createdAt: reaction.createdAt })),
  replyPreview: message.replyPreview,
  durationSec: message.durationSec || 0
});

const makeReplyPreview = (message: ChatMessage, participantName: string): ReplyPreview => ({
  messageId: message.id,
  senderName: message.mine ? "You" : participantName,
  text: message.deleted ? "Deleted message" : message.text || (message.type === "image" ? "Photo" : "Voice note"),
  type: message.type
});

export function ChatWindow({
  matchId,
  participant,
  onBack
}: {
  matchId: string;
  participant: { name: string; photo: string; fallbackPhotos?: string[]; university: string; online: boolean; otherUserId?: string };
  onBack: () => void;
}) {
  const token = useAuthStore((s) => s.token);
  const userId = getUserIdFromToken(token) || "demo-user";
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [replyingTo, setReplyingTo] = useState<ReplyPreview | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [participantOnline, setParticipantOnline] = useState(participant.online);
  const [searchQuery, setSearchQuery] = useState("");
  const [activePanel, setActivePanel] = useState<null | "search" | "media" | "voice" | "report">(null);
  const [reportReason, setReportReason] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const toast = useToastStore((state) => state.push);

  const syncSeen = async () => {
    if (!token || !matchId) return;
    await api.post(`/chat/${matchId}/seen`, {}, { headers: { Authorization: `Bearer ${token}` } }).catch(() => undefined);
    socketRef.current?.emit("seen", { matchId, userId });
  };

  useEffect(() => {
    if (!matchId) return;
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000");
    socketRef.current = socket;
    socket.emit("register_user", userId);
    socket.emit("join_match", matchId);
    if (participant.otherUserId) {
      socket.emit("request_presence", { userIds: [participant.otherUserId] });
    }

    socket.on("new_message", (m: any) => {
      const mapped = mapMessage(m, userId);
      setMessages((prev) => {
        if (prev.some((entry) => entry.id === mapped.id)) return prev;
        // Replace the last optimistic temp message when the server confirms our own message
        if (mapped.mine) {
          const withoutTemp = prev.filter((entry) => !entry.id.startsWith("temp-"));
          return [...withoutTemp, mapped];
        }
        return [...prev, mapped];
      });
      if (String(m.senderId) !== userId) syncSeen();
    });

    socket.on("typing", ({ userId: typingUserId }: { userId: string }) => {
      if (typingUserId === userId) return;
      setTypingUsers([participant.name]);
      setTimeout(() => setTypingUsers([]), 1500);
    });

    socket.on("reaction_updated", (updated: any) => {
      if (!updated?._id) return;
      const mapped = mapMessage(updated, userId);
      setMessages((prev) => prev.map((message) => (message.id === mapped.id ? { ...message, reactions: mapped.reactions } : message)));
    });

    socket.on("message_deleted", (updated: any) => {
      const mapped = mapMessage(updated, userId);
      setMessages((prev) => prev.map((message) => (message.id === mapped.id ? { ...message, deleted: true, text: "", imageUrl: undefined, audioUrl: undefined, reactions: [] } : message)));
    });

    socket.on("seen_updated", ({ userId: seenUserId }: { userId: string }) => {
      if (seenUserId === userId) return;
      setMessages((prev) => prev.map((message) => (message.mine ? { ...message, seen: true } : message)));
    });

    socket.on("presence_snapshot", ({ onlineUserIds }: { onlineUserIds: string[] }) => {
      setParticipantOnline(Boolean(participant.otherUserId && onlineUserIds.includes(participant.otherUserId)));
    });

    socket.on("presence_changed", ({ userId: changedUserId, online }: { userId: string; online: boolean }) => {
      if (changedUserId === participant.otherUserId) setParticipantOnline(online);
    });

    return () => {
      socket.disconnect();
    };
  }, [matchId, participant.name, participant.otherUserId, token, userId]);

  useEffect(() => {
    if (!token || !matchId) return;
    api
      .get(`/chat/${matchId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const mapped = (res.data?.data || []).map((message: any) => mapMessage(message, userId));
        setMessages(mapped);
        syncSeen();
      })
      .catch(() => setMessages([]));
  }, [token, userId, matchId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages, typingUsers]);

  const notificationCount = useMemo(() => messages.filter((m) => !m.mine && !m.seen).length, [messages]);
  const mediaMessages = useMemo(() => messages.filter((message) => message.imageUrl && !message.deleted), [messages]);
  const voiceMessages = useMemo(() => messages.filter((message) => message.audioUrl && !message.deleted), [messages]);
  const visibleMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    const query = searchQuery.trim().toLowerCase();
    return messages.filter((message) => {
      const haystacks = [message.text, message.replyPreview?.text, message.replyPreview?.senderName]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());
      return haystacks.some((value) => value.includes(query));
    });
  }, [messages, searchQuery]);

  const handleParticipantPhotoError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;
    const fallbackSources = Array.from(new Set([...(participant.fallbackPhotos || []), participant.photo]));
    const currentIndex = Number(image.dataset.fallbackIndex || "0");
    const nextSource = fallbackSources[currentIndex + 1];

    if (nextSource) {
      image.dataset.fallbackIndex = String(currentIndex + 1);
      image.src = nextSource;
      return;
    }

    image.onerror = null;
  };

  const uploadAsset = async (file: File) => {
    const fd = new FormData();
    const isAudio = file.type.startsWith("audio/") || file.type === "video/webm";
    if (isAudio) {
      fd.append("voice", file);
      const res = await api.post("/uploads/voice", fd);
      return resolveAssetUrl(res.data?.data?.publicUrl);
    }
    fd.append("profile", file);
    const res = await api.post("/uploads/profile", fd);
    return resolveAssetUrl(res.data?.data?.publicUrl);
  };

  const emitMessage = (type: "text" | "image" | "voice" | "emoji", content?: string, mediaUrl?: string, durationSec?: number, metadata?: { fileName?: string; mimeType?: string }) => {
    if (!matchId) return;
    // Optimistically add message so it appears immediately without waiting for server roundtrip
    const tempMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      senderId: userId,
      mine: true,
      type,
      text: content || "",
      imageUrl: type === "image" ? mediaUrl : undefined,
      audioUrl: type === "voice" ? mediaUrl : undefined,
      createdAt: new Date().toISOString(),
      seen: false,
      delivered: false,
      deleted: false,
      reactions: [],
      replyPreview: replyingTo || undefined,
      durationSec: durationSec || 0,
    };
    setMessages((prev) => [...prev, tempMsg]);
    socketRef.current?.emit("send_message", { matchId, senderId: userId, type, content, mediaUrl, replyPreview: replyingTo || undefined, durationSec, metadata });
    setReplyingTo(null);
  };

  const handleDeleteConversation = async () => {
    try {
      await api.delete(`/chat/${matchId}`);
      mutate("/chat/matches");
      toast({ title: "Conversation deleted", variant: "success" });
      onBack();
    } catch (error: any) {
      toast({ title: "Could not delete chat", message: error?.response?.data?.message || "Please try again.", variant: "error" });
    }
  };

  const handleBlockUser = async () => {
    try {
      await api.post(`/chat/${matchId}/block`);
      mutate("/chat/matches");
      toast({ title: `${participant.name} blocked`, variant: "success" });
      onBack();
    } catch (error: any) {
      toast({ title: "Could not block user", message: error?.response?.data?.message || "Please try again.", variant: "error" });
    }
  };

  const handleReportUser = async () => {
    try {
      await api.post(`/chat/${matchId}/report`, { reason: reportReason.trim() || "Inappropriate behavior" });
      setReportReason("");
      setActivePanel(null);
      toast({ title: "Report submitted", variant: "success" });
    } catch (error: any) {
      toast({ title: "Could not report user", message: error?.response?.data?.message || "Please try again.", variant: "error" });
    }
  };

  const runMenuAction = (action: "search" | "media" | "voice" | "clearReply" | "deleteChat" | "blockUser" | "reportUser") => {
    setShowMenu(false);
    if (action === "search") setActivePanel("search");
    if (action === "media") setActivePanel("media");
    if (action === "voice") setActivePanel("voice");
    if (action === "clearReply") setReplyingTo(null);
    if (action === "deleteChat") void handleDeleteConversation();
    if (action === "blockUser") void handleBlockUser();
    if (action === "reportUser") setActivePanel("report");
  };

  const latestStatus = notificationCount > 0 ? `${notificationCount} unread` : participantOnline ? "Online now" : "Away";

  return (
    <div className="flex flex-col">
      <div className="border-b border-pink-100 px-4 pb-3 pt-4 sm:px-5">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full border border-pink-100 bg-pink-50 text-[#9B7065] transition hover:border-[#FF2D78] hover:text-[#FF2D78]">
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
          <div className="h-11 w-11 overflow-hidden rounded-full border border-pink-200 bg-pink-50">
            {participant.photo ? (
              <img src={participant.photo} alt={participant.name} className="h-full w-full object-cover" data-fallback-index="0" onError={handleParticipantPhotoError} />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#2D1810]">{participant.name}</p>
            <div className="flex items-center gap-2 text-xs text-[#9B7065]">
              <span className={`h-2 w-2 rounded-full ${participantOnline ? "bg-emerald-400" : "bg-gray-300"}`} />
              <span>{latestStatus}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => { window.location.href = `/call/voice?name=${encodeURIComponent(participant.name)}&photo=${encodeURIComponent(participant.photo || "")}`; }} className="flex h-10 w-10 items-center justify-center rounded-full border border-pink-100 bg-pink-50 text-[#9B7065] transition hover:border-[#FF2D78] hover:text-[#FF2D78]">
              <Phone className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => { window.location.href = `/call/video?name=${encodeURIComponent(participant.name)}&photo=${encodeURIComponent(participant.photo || "")}`; }} className="flex h-10 w-10 items-center justify-center rounded-full border border-pink-100 bg-pink-50 text-[#9B7065] transition hover:border-[#FF2D78] hover:text-[#FF2D78]">
              <Video className="h-4 w-4" />
            </button>
            <div className="relative">
              <button type="button" onClick={() => setShowMenu((current) => !current)} className="flex h-10 w-10 items-center justify-center rounded-full border border-pink-100 bg-pink-50 text-[#9B7065] transition hover:border-[#FF2D78] hover:text-[#FF2D78]">
                <EllipsisVertical className="h-4 w-4" />
              </button>
              <AnimatePresence>
                {showMenu ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 top-[calc(100%+8px)] z-20 min-w-[220px] rounded-2xl border border-pink-100 bg-white p-2 shadow-xl"
                  >
                    {[
                      { label: "Search in chat", icon: Search, action: "search" as const },
                      { label: "View media", icon: ImageIcon, action: "media" as const },
                      { label: "Starred voice notes", icon: Mic, action: "voice" as const },
                      { label: "Clear reply bar", icon: Reply, action: "clearReply" as const },
                      { label: "Delete chat", icon: Trash2, action: "deleteChat" as const },
                      { label: "Block user", icon: ShieldBan, action: "blockUser" as const },
                      { label: "Report user", icon: Flag, action: "reportUser" as const }
                    ].map(({ label, icon: Icon, action }) => (
                      <button key={label} type="button" onClick={() => runMenuAction(action)} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-[#2D1810] transition hover:bg-pink-50">
                        <Icon className="h-4 w-4" />
                        {label}
                      </button>
                    ))}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {activePanel ? (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="border-b border-pink-100 px-3 py-3 sm:px-4">
              <div className="rounded-2xl border border-pink-100 bg-pink-50/50 p-3">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-[#2D1810]">
                  {activePanel === "search" ? "Search messages" : activePanel === "media" ? "Media gallery" : activePanel === "voice" ? "Voice history" : "Report user"}
                </p>
                <button type="button" onClick={() => setActivePanel(null)} className="rounded-full bg-pink-50 p-1.5 text-[#9B7065] hover:text-[#FF2D78]">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {activePanel === "search" ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 rounded-2xl border border-pink-100 bg-[#FFF8F0] px-3 py-2.5">
                    <Search className="h-4 w-4 text-[#9B7065]" />
                    <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search messages or replies" className="w-full bg-transparent text-sm text-[#2D1810] outline-none placeholder:text-[#9B7065]/40" />
                  </div>
                  <p className="text-xs text-[#9B7065]">{visibleMessages.length} matching messages</p>
                </div>
              ) : null}

              {activePanel === "media" ? (
                mediaMessages.length ? (
                  <div className="grid grid-cols-3 gap-2">
                    {mediaMessages.map((message) => (
                      <img key={message.id} src={message.imageUrl} alt="Shared media" className="aspect-square rounded-2xl object-cover" loading="lazy" decoding="async" />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#9B7065]">No images have been shared yet.</p>
                )
              ) : null}

              {activePanel === "voice" ? (
                voiceMessages.length ? (
                  <div className="space-y-2">
                    {voiceMessages.map((message) => (
                      <div key={message.id} className="flex items-center justify-between rounded-2xl border border-pink-100 bg-white px-3 py-2 text-sm text-[#2D1810]">
                        <div>
                          <p>{message.mine ? "You" : participant.name}</p>
                          <p className="text-xs text-[#9B7065]">{new Date(message.createdAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                        <span className="rounded-full bg-pink-50 px-2 py-1 text-xs text-[#9B7065]">{message.durationSec ? `${message.durationSec}s` : "Voice"}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#9B7065]">No voice notes yet.</p>
                )
              ) : null}

              {activePanel === "report" ? (
                <div className="space-y-3">
                  <textarea value={reportReason} onChange={(event) => setReportReason(event.target.value)} rows={3} placeholder="Tell us what happened" className="w-full resize-none rounded-2xl border border-pink-100 bg-[#FFF8F0] p-3 text-sm text-[#2D1810] outline-none placeholder:text-[#9B7065]/40" />
                  <button type="button" onClick={handleReportUser} className="rounded-full bg-[#FF2D78] px-4 py-2 text-sm font-semibold text-white">Submit report</button>
                </div>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="space-y-3 px-3 py-4 sm:px-4">
        {visibleMessages.length === 0 ? (
          <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-pink-200">
              <Reply className="h-6 w-6 text-[#FF2D78]" />
            </div>
            <div>
              <p className="text-base font-semibold text-[#2D1810]">{searchQuery ? "No results found" : "Start the conversation"}</p>
              <p className="mt-1 max-w-xs text-sm text-[#9B7065]">{searchQuery ? "Try another keyword or clear search." : "Send a message, drop a photo, or record a voice note to break the ice."}</p>
            </div>
          </div>
        ) : (
          visibleMessages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onReply={(nextMessage) => setReplyingTo(makeReplyPreview(nextMessage, participant.name))}
              onDelete={(messageId) => socketRef.current?.emit("delete_message", { matchId, messageId, userId })}
              onReact={(messageId, reaction) => socketRef.current?.emit("add_reaction", { matchId, messageId, reaction, userId })}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <TypingIndicator users={typingUsers} />

      <ChatInput
        onSendText={(text) => emitMessage("text", text)}
        onSendImage={async (file, caption) => {
          const url = await uploadAsset(file);
          emitMessage("image", caption, url, 0, { fileName: file.name, mimeType: file.type });
        }}
        onSendVoice={async (blob, durationSec) => {
          const voiceFile = new File([blob], `voice-${Date.now()}.webm`, { type: "audio/webm" });
          const url = await uploadAsset(voiceFile);
          emitMessage("voice", undefined, url, durationSec, { fileName: voiceFile.name, mimeType: voiceFile.type });
        }}
        onTyping={() => socketRef.current?.emit("typing", { matchId, userId })}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
      />
    </div>
  );
}
