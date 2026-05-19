import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { env } from "../config/env";
import { Message } from "../models/Message";

const onlineUsers = new Map<string, number>();

const serializeMessage = (message: any) => ({
  ...message,
  reactions: (message.reactions || []).map((reaction: any) => ({
    emoji: reaction.emoji,
    userId: String(reaction.userId),
    createdAt: reaction.createdAt
  })),
  seenBy: (message.seenBy || []).map((userId: any) => String(userId)),
  senderId: String(message.senderId)
});

export const initSocket = (server: HttpServer) => {
  const io = new Server(server, { cors: { origin: env.CLIENT_URL, credentials: true } });

  io.on("connection", (socket) => {
    socket.on("register_user", (userId: string) => {
      socket.data.userId = userId;
      onlineUsers.set(userId, (onlineUsers.get(userId) || 0) + 1);
      io.emit("presence_changed", { userId, online: true });
    });

    socket.on("request_presence", ({ userIds }: { userIds: string[] }) => {
      const onlineUserIds = userIds.filter((userId) => (onlineUsers.get(userId) || 0) > 0);
      socket.emit("presence_snapshot", { onlineUserIds });
    });

    socket.on("join_match", (matchId: string) => socket.join(matchId));

    socket.on("typing", ({ matchId, userId }: { matchId: string; userId: string }) => {
      socket.to(matchId).emit("typing", { userId });
    });

    socket.on(
      "send_message",
      async (payload: {
        matchId: string;
        senderId: string;
        content?: string;
        type: "text" | "emoji" | "voice" | "image";
        mediaUrl?: string;
        replyPreview?: { messageId: string; text: string; senderName: string; type: "text" | "emoji" | "voice" | "image" };
        durationSec?: number;
        metadata?: { fileName?: string; mimeType?: string };
      }) => {
        try {
          const message = await Message.create({
            matchId: payload.matchId,
            senderId: payload.senderId,
            content: payload.content || "",
            type: payload.type,
            mediaUrl: payload.mediaUrl,
            replyPreview: payload.replyPreview,
            durationSec: payload.durationSec,
            metadata: payload.metadata,
            seenBy: [payload.senderId]
          });
          io.to(payload.matchId).emit("new_message", serializeMessage(message.toObject()));
        } catch {
          // DB save failed (e.g. invalid ObjectId for demo matches) — echo back to sender so
          // the optimistic message in the client gets replaced with a confirmed one.
          socket.emit("new_message", {
            _id: `echo-${Date.now()}`,
            matchId: payload.matchId,
            senderId: payload.senderId,
            content: payload.content || "",
            type: payload.type,
            mediaUrl: payload.mediaUrl || "",
            replyPreview: payload.replyPreview,
            durationSec: payload.durationSec || 0,
            metadata: payload.metadata,
            seenBy: [payload.senderId],
            reactions: [],
            createdAt: new Date().toISOString(),
          });
        }
      }
    );

    socket.on("add_reaction", async ({ matchId, messageId, reaction, userId }: { matchId: string; messageId: string; reaction: string; userId: string }) => {
      const message = await Message.findById(messageId);
      if (!message) return;
      const nextReactions = (message.reactions || []).filter((entry: any) => String(entry.userId) !== userId);
      if (reaction) nextReactions.push({ emoji: reaction, userId, createdAt: new Date() } as any);
      message.reactions = nextReactions as any;
      await message.save();
      io.to(matchId).emit("reaction_updated", serializeMessage(message.toObject()));
    });

    socket.on("delete_message", async ({ matchId, messageId, userId }: { matchId: string; messageId: string; userId: string }) => {
      const message = await Message.findOne({ _id: messageId, senderId: userId });
      if (!message) return;
      message.content = "";
      message.mediaUrl = undefined;
      message.deletedAt = new Date();
      message.reactions = [] as any;
      await message.save();
      io.to(matchId).emit("message_deleted", serializeMessage(message.toObject()));
    });

    socket.on("seen", async ({ matchId, userId }: { matchId: string; userId: string }) => {
      await Message.updateMany({ matchId, senderId: { $ne: userId } }, { $addToSet: { seenBy: userId } });
      io.to(matchId).emit("seen_updated", { matchId, userId });
    });

    socket.on("disconnect", () => {
      const userId = socket.data.userId as string | undefined;
      if (!userId) return;
      const nextCount = (onlineUsers.get(userId) || 1) - 1;
      if (nextCount <= 0) {
        onlineUsers.delete(userId);
        io.emit("presence_changed", { userId, online: false });
        return;
      }
      onlineUsers.set(userId, nextCount);
    });
  });

  return io;
};
