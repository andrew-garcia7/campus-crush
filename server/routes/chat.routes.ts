import { z } from "zod";
import { Router } from "express";
import { blockMatchUser, deleteConversation, deleteMessage, listMatches, listMessages, markSeen, reactToMessage, reportMatchUser, sendMessage } from "../controllers/chat.controller";
import { requireAuth, requireVerified } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";

const r = Router();

const replyPreviewSchema = z.object({
  messageId: z.string().min(1),
  text: z.string(),
  senderName: z.string(),
  type: z.enum(["text", "emoji", "voice", "image"])
});

const sendSchema = z.object({
  body: z.object({
    content: z.string().optional(),
    type: z.enum(["text", "emoji", "voice", "image"]),
    mediaUrl: z.string().optional(),
    replyPreview: replyPreviewSchema.optional(),
    durationSec: z.number().optional(),
    metadata: z.object({ fileName: z.string().optional(), mimeType: z.string().optional() }).optional()
  }),
  query: z.object({}).optional(),
  params: z.object({ matchId: z.string().min(1) })
});

const reactionSchema = z.object({
  body: z.object({ reaction: z.string().min(1) }),
  query: z.object({}).optional(),
  params: z.object({ matchId: z.string().min(1), messageId: z.string().min(1) })
});

const reportSchema = z.object({
  body: z.object({ reason: z.string().min(4).max(240) }),
  query: z.object({}).optional(),
  params: z.object({ matchId: z.string().min(1) })
});

r.get("/matches", requireAuth, requireVerified, listMatches);
r.get("/:matchId", requireAuth, requireVerified, listMessages);
r.post("/:matchId", requireAuth, requireVerified, validate(sendSchema), sendMessage);
r.post("/:matchId/:messageId/reaction", requireAuth, requireVerified, validate(reactionSchema), reactToMessage);
r.delete("/:matchId", requireAuth, requireVerified, deleteConversation);
r.post("/:matchId/block", requireAuth, requireVerified, blockMatchUser);
r.post("/:matchId/report", requireAuth, requireVerified, validate(reportSchema), reportMatchUser);
r.delete("/:matchId/:messageId", requireAuth, requireVerified, deleteMessage);
r.post("/:matchId/seen", requireAuth, requireVerified, markSeen);

export default r;

