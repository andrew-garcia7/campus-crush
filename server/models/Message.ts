import mongoose, { Schema } from "mongoose";

const reactionSchema = new Schema(
  {
    emoji: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const replyPreviewSchema = new Schema(
  {
    messageId: { type: Schema.Types.ObjectId, ref: "Message" },
    text: { type: String, default: "" },
    senderName: { type: String, default: "" },
    type: { type: String, enum: ["text", "emoji", "voice", "image"], default: "text" }
  },
  { _id: false }
);

const metadataSchema = new Schema(
  {
    fileName: { type: String },
    mimeType: { type: String }
  },
  { _id: false }
);

const schema = new Schema(
  {
    matchId: { type: Schema.Types.ObjectId, ref: "Match", required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    content: { type: String, default: "" },
    mediaUrl: { type: String },
    type: { type: String, enum: ["text", "emoji", "voice", "image"], default: "text" },
    reactions: { type: [reactionSchema], default: [] },
    seenBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    deletedAt: { type: Date, default: null },
    replyPreview: { type: replyPreviewSchema, default: undefined },
    durationSec: { type: Number, default: 0 },
    metadata: { type: metadataSchema, default: undefined }
  },
  { timestamps: true }
);

export const Message = mongoose.model("Message", schema);
