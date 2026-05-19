import Razorpay from "razorpay";
import crypto from "crypto";
import { env } from "../config/env";
import { Subscription } from "../models/Subscription";

// ── Razorpay instance ─────────────────────────────────────────────────────
let razorpay: Razorpay | null = null;
if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({ key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET });
} else {
  console.warn("⚠️  Razorpay not configured – set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env");
}

// ── Plan amounts (INR) ────────────────────────────────────────────────────
export type Plan          = "starter" | "premium" | "vip";
export type BillingPeriod = "monthly" | "quarterly" | "yearly";

export const PLAN_AMOUNTS: Record<Plan, Record<BillingPeriod, number>> = {
  starter: { monthly: 199,   quarterly: 499,   yearly: 1299  },
  premium: { monthly: 499,   quarterly: 1299,  yearly: 3999  },
  vip:     { monthly: 1999,  quarterly: 4999,  yearly: 14999 }
};

// ── Create Razorpay order ─────────────────────────────────────────────────
export const createRazorpayOrder = async (
  userId: string,
  plan: Plan,
  billingPeriod: BillingPeriod = "monthly",
  customAmount?: number
) => {
  if (!razorpay) throw new Error("Payment gateway not configured");

  const amount = customAmount ?? (PLAN_AMOUNTS[plan]?.[billingPeriod] ?? PLAN_AMOUNTS[plan].monthly);

  const order = await razorpay.orders.create({
    amount:   amount * 100,
    currency: "INR",
    receipt:  `rcpt_${Date.now()}`
  });

  await Subscription.create({
    userId, provider: "razorpay", plan, billingPeriod,
    amountInr: amount, status: "pending", externalId: order.id
  });

  return { orderId: order.id, amount, currency: "INR", keyId: env.RAZORPAY_KEY_ID };
};

// ── Verify payment signature (uses KEY_SECRET, NOT webhook secret) ────────
export const verifyRazorpaySignature = (
  orderId:   string,
  paymentId: string,
  signature: string
): boolean => {
  const expected = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return expected === signature;
};

// ── Activate subscription ─────────────────────────────────────────────────
export const activateSubscriptionByExternalId = async (
  provider:   string,
  externalId: string,
  paymentId?: string
) => {
  return Subscription.findOneAndUpdate(
    { provider, externalId },
    {
      status: "active",
      ...(paymentId ? { paymentId } : {}),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    },
    { new: true }
  );
};

// ── Fail subscription ─────────────────────────────────────────────────────
export const failSubscriptionByExternalId = async (
  provider:   string,
  externalId: string
) => {
  return Subscription.findOneAndUpdate(
    { provider, externalId },
    { status: "failed" },
    { new: true }
  );
};

// ── Premium status ────────────────────────────────────────────────────────
export const getUserPremiumStatus = async (userId: string) => {
  const subscription = await Subscription
    .findOne({ userId, status: "active" })
    .sort({ createdAt: -1 })
    .lean();
  return { isPremium: !!subscription, subscription };
};