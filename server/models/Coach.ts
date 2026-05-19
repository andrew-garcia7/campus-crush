import mongoose, { Schema } from "mongoose";

const coachSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    bio: { type: String, required: true, trim: true },
    specialization: [{ type: String, required: true }],
    consultationTypes: [{ type: String, enum: ["chat", "video", "call"], required: true }],
    pricePerSession: { type: Number, required: true },
    rating: { type: Number, default: 4.8 },
    reviewsCount: { type: Number, default: 0 },
    sessionsCompleted: { type: Number, default: 0 },
    avatar: { type: String, required: true },
    badges: [{ type: String }],
    photos: [{ type: String }],
    age: { type: Number },
    occupation: { type: String, trim: true },
    yearsExperience: { type: Number },
    languages: [{ type: String }],
    successStories: [{ type: String }],
    testimonials: [
      {
        name: { type: String },
        text: { type: String },
        rating: { type: Number, default: 5 }
      }
    ],
    sessionDuration: { type: Number, default: 60 },
    isFeatured: { type: Boolean, default: false },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Coach = mongoose.models.Coach || mongoose.model("Coach", coachSchema);