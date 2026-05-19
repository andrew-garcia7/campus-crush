import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    userId:        { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    provider:      { type: String, enum: ["razorpay"], default: "razorpay" },
    plan:          { type: String, enum: ["starter", "premium", "vip", "session"], required: true },
    billingPeriod: { type: String, enum: ["monthly", "quarterly", "yearly", "one-time"], default: "monthly" },
    amountInr:     { type: Number, required: true },
    status:        { type: String, enum: ["pending", "active", "cancelled", "failed"], default: "pending" },
    externalId:    { type: String },  // Razorpay orderId
    paymentId:     { type: String },  // Razorpay paymentId (set after verification)
    expiresAt:     { type: Date },
    // Coach session fields (plan = "session")
    coachName:     { type: String },
    coachImage:    { type: String },
    sessionType:   { type: String },
    scheduledFor:  { type: Date }
  },
  { timestamps: true }
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
