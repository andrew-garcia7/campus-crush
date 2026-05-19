import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { Message } from "../models/Message";
import { Match } from "../models/Match";
import { User } from "../models/User";
import { Report } from "../models/Report";

const bootstrapSeedMatches = async (currentUserId: string) => {
  const existingMatches = await Match.find({ users: currentUserId }).lean();
  if (existingMatches.length) {
    return existingMatches;
  }

  const currentUser = await User.findById(currentUserId).lean();
  if (!currentUser) {
    return [];
  }

  const blockedIds = new Set((currentUser.blockedUsers || []).map((value: any) => String(value)));
  const candidates = await User.find({
    _id: { $ne: currentUserId, $nin: Array.from(blockedIds) },
    isBanned: false,
    verificationStatus: "verified",
    university: currentUser.university
  })
    .sort({ profileViews: -1, updatedAt: -1, createdAt: -1 })
    .limit(6)
    .select("_id")
    .lean();

  if (!candidates.length) {
    return [];
  }

  const insertedMatches = await Match.insertMany(
    candidates.map((candidate: any, index) => ({
      users: [currentUserId, candidate._id],
      university: currentUser.university,
      matchedAt: new Date(Date.now() - index * 1000 * 60 * 60 * 12)
    }))
  );

  return insertedMatches.map((match: any) => (typeof match.toObject === "function" ? match.toObject() : match));
};

const serializeMessage = (message: any, currentUserId: string) => ({
  ...message,
  reactions: (message.reactions || []).map((reaction: any) => ({
    emoji: reaction.emoji,
    userId: String(reaction.userId),
    createdAt: reaction.createdAt
  })),
  seenBy: (message.seenBy || []).map((userId: any) => String(userId)),
  senderId: String(message.senderId),
  isMine: String(message.senderId) === currentUserId
});

export const listMatches = async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = await User.findById(req.userId).lean();
    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    await bootstrapSeedMatches(req.userId!);

    const matches = await Match.find({ users: req.userId })
      .populate("users", "fullName photos university age interests")
      .sort({ updatedAt: -1 })
      .lean();

    const matchIds = matches.map((match) => match._id);
    const latestMessages = await Message.aggregate([
      { $match: { matchId: { $in: matchIds }, deletedAt: null } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: "$matchId", latestMessage: { $first: "$$ROOT" } } }
    ]);

    const unreadCounts = await Message.aggregate([
      {
        $match: {
          matchId: { $in: matchIds },
          senderId: { $ne: req.userId },
          seenBy: { $ne: req.userId },
          deletedAt: null
        }
      },
      { $group: { _id: "$matchId", unreadCount: { $sum: 1 } } }
    ]);

    const latestByMatch = new Map(latestMessages.map((entry) => [String(entry._id), entry.latestMessage]));
    const unreadByMatch = new Map(unreadCounts.map((entry) => [String(entry._id), entry.unreadCount]));

    const data = matches.map((match, index) => {
      const otherUser = (match.users as any[]).find((user) => String(user._id) !== req.userId);
      const latest = latestByMatch.get(String(match._id));
      const mutualInterests = ((otherUser?.interests || []) as string[]).filter((interest) =>
        (currentUser?.interests || []).map((value: string) => value.toLowerCase()).includes(String(interest).toLowerCase())
      );
      return {
        ...match,
        otherUserId: otherUser?._id,
        matchedAt: match.matchedAt || match.createdAt,
        mutualInterests,
        latestMessage: latest
          ? serializeMessage(latest, req.userId!)
          : null,
        unreadCount: unreadByMatch.get(String(match._id)) || 0,
        online: index < 4
      };
    });

    res.json({ success: true, message: "Matches", data });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const listMessages = async (req: AuthRequest, res: Response) => {
  const data = await Message.find({ matchId: req.params.matchId })
    .sort({ createdAt: 1 })
    .limit(200)
    .lean();
  res.json({ success: true, message: "Messages", data: data.map((message) => serializeMessage(message, req.userId!)) });
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  const { content, type, mediaUrl, replyPreview, durationSec, metadata } = req.body;
  const data = await Message.create({
    matchId: req.params.matchId,
    senderId: req.userId,
    content,
    type,
    mediaUrl,
    replyPreview,
    durationSec,
    metadata,
    seenBy: [req.userId]
  });
  res.status(201).json({ success: true, message: "Sent", data: serializeMessage(data.toObject(), req.userId!) });
};

export const reactToMessage = async (req: AuthRequest, res: Response) => {
  const { messageId } = req.params;
  const { reaction } = req.body as { reaction: string };
  const message = await Message.findById(messageId);
  if (!message) return res.status(404).json({ success: false, message: "Message not found" });

  const nextReactions = (message.reactions || []).filter((entry: any) => String(entry.userId) !== req.userId);
  if (reaction) {
    nextReactions.push({ emoji: reaction, userId: req.userId, createdAt: new Date() } as any);
  }
  message.reactions = nextReactions as any;
  await message.save();

  res.json({ success: true, message: "Reaction updated", data: serializeMessage(message.toObject(), req.userId!) });
};

export const deleteMessage = async (req: AuthRequest, res: Response) => {
  const { messageId } = req.params;
  const message = await Message.findOne({ _id: messageId, senderId: req.userId });
  if (!message) return res.status(404).json({ success: false, message: "Message not found" });

  message.content = "";
  message.mediaUrl = undefined;
  message.deletedAt = new Date();
  message.reactions = [] as any;
  await message.save();

  res.json({ success: true, message: "Message deleted", data: serializeMessage(message.toObject(), req.userId!) });
};

export const markSeen = async (req: AuthRequest, res: Response) => {
  const { matchId } = req.params;
  await Message.updateMany({ matchId, senderId: { $ne: req.userId } }, { $addToSet: { seenBy: req.userId } });
  res.json({ success: true, message: "Seen updated" });
};

export const deleteConversation = async (req: AuthRequest, res: Response) => {
  const { matchId } = req.params;
  const match = await Match.findOne({ _id: matchId, users: req.userId });
  if (!match) return res.status(404).json({ success: false, message: "Conversation not found" });

  await Message.deleteMany({ matchId });
  await Match.deleteOne({ _id: matchId });

  res.json({ success: true, message: "Conversation deleted" });
};

export const blockMatchUser = async (req: AuthRequest, res: Response) => {
  const { matchId } = req.params;
  const match = await Match.findOne({ _id: matchId, users: req.userId }).lean();
  if (!match) return res.status(404).json({ success: false, message: "Conversation not found" });

  const otherUserId = (match.users as any[]).map(String).find((userId) => userId !== req.userId);
  if (!otherUserId) return res.status(400).json({ success: false, message: "User not found" });

  await User.updateOne({ _id: req.userId }, { $addToSet: { blockedUsers: otherUserId } });
  await Message.deleteMany({ matchId });
  await Match.deleteOne({ _id: matchId });

  res.json({ success: true, message: "User blocked" });
};

export const reportMatchUser = async (req: AuthRequest, res: Response) => {
  const { matchId } = req.params;
  const { reason } = req.body as { reason: string };
  const match = await Match.findOne({ _id: matchId, users: req.userId }).lean();
  if (!match) return res.status(404).json({ success: false, message: "Conversation not found" });

  const otherUserId = (match.users as any[]).map(String).find((userId) => userId !== req.userId);
  if (!otherUserId) return res.status(400).json({ success: false, message: "User not found" });

  await Report.create({ reporterId: req.userId, targetUserId: otherUserId, reason });
  res.status(201).json({ success: true, message: "User reported" });
};
