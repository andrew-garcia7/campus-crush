import mongoose, { Schema } from "mongoose";

const bookingSchema = new Schema(
  {
    coach: {
      type: Schema.Types.ObjectId,
      ref: "Coach",
      required: true
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null
    },

    // Denormalised so history works even if coach gets deleted
    coachName: {
      type: String,
      default: ""
    },

    coachImage: {
      type: String,
      default: ""
    },

    consultationType: {
      type: String,
      enum: ["chat", "video", "call"],
      required: true
    },

    scheduledFor: {
      type: Date,
      required: true
    },

    amount: {
      type: Number,
      default: 0
    },

    notes: {
      type: String,
      trim: true
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "completed",
        "cancelled"
      ],
      default: "confirmed"
    },

    paymentId: {
      type: String
    },

    orderId: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

export const CoachBooking = mongoose.models.CoachBooking || mongoose.model("CoachBooking", bookingSchema);