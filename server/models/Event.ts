import mongoose, { Document, Schema } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description: string;
  category: "fest" | "concert" | "workshop" | "hackathon" | "meetup" | "dating" | "sports" | "cultural";
  venue: string;
  university: string;
  date: Date;
  time: string;
  coverImage?: string;
  organizer: mongoose.Types.ObjectId;
  attendees: mongoose.Types.ObjectId[];
  maxAttendees?: number;
  tags: string[];
  isPublic: boolean;
  createdAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["fest", "concert", "workshop", "hackathon", "meetup", "dating", "sports", "cultural"],
      default: "meetup"
    },
    venue: { type: String, required: true },
    university: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, default: "6:00 PM" },
    coverImage: { type: String },
    organizer: { type: Schema.Types.ObjectId, ref: "User" },
    attendees: [{ type: Schema.Types.ObjectId, ref: "User" }],
    maxAttendees: { type: Number },
    tags: [{ type: String }],
    isPublic: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Event = mongoose.model<IEvent>("Event", EventSchema);
