import { Request, Response } from "express";
import {
  activateSubscriptionByExternalId,
  createRazorpayOrder,
  failSubscriptionByExternalId,
  getUserPremiumStatus,
  verifyRazorpaySignature
} from "../services/payment.service";
import { AuthRequest } from "../middleware/auth.middleware";

// POST /api/v1/payments/checkout
export const createCheckout = async (req: Request, res: Response) => {
  try {
    const { userId, plan, billingPeriod, amount } = req.body;
    const order = await createRazorpayOrder(userId, plan, billingPeriod, amount);
    return res.json({ success: true, message: "Order created", data: order });
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message || "Failed to create order" });
  }
};

// POST /api/v1/payments/verify
export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { orderId, paymentId, signature } = req.body as {
      orderId: string; paymentId: string; signature: string;
    };
    const valid = verifyRazorpaySignature(orderId, paymentId, signature);
    if (!valid) {
      await failSubscriptionByExternalId("razorpay", orderId);
      return res.status(400).json({ success: false, message: "Payment signature mismatch" });
    }
    await activateSubscriptionByExternalId("razorpay", orderId, paymentId);
    return res.json({ success: true, message: "Payment verified and plan activated" });
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message || "Verification failed" });
  }
};

// POST /api/v1/payments/webhook/razorpay  (server-side webhook)
export const razorpayWebhook = async (req: Request, res: Response) => {
  try {
    const { orderId, paymentId, signature } = req.body as {
      orderId: string; paymentId: string; signature: string;
    };
    const valid = verifyRazorpaySignature(orderId, paymentId, signature);
    if (!valid) {
      await failSubscriptionByExternalId("razorpay", orderId);
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }
    await activateSubscriptionByExternalId("razorpay", orderId, paymentId);
    return res.json({ success: true, message: "Webhook handled" });
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

// GET /api/v1/payments/history/:userId
export const paymentHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { Subscription } = await import("../models/Subscription");
    const { CoachBooking } = await import("../models/CoachBooking");
    const userId = req.params.userId;
    if (!req.userId || req.userId !== userId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const { Types } = await import("mongoose");
    if (!Types.ObjectId.isValid(userId)) {
      return res.json({ success: true, message: "Payment history", data: [] });
    }

    const userObjectId = new Types.ObjectId(userId);

    // 1. Fetch all subscription records for this user
    const subscriptions = await Subscription.find({ userId: userObjectId }).sort({ createdAt: -1 }).lean();

    // 2. Recover any orphaned paid CoachBookings (saved before the auth fix) that have a
    //    paymentId but are NOT already represented in the subscriptions list above.
    const coveredPaymentIds = new Set(
      subscriptions.filter((s: any) => s.paymentId).map((s: any) => String(s.paymentId))
    );

    const orphanedBookings = await CoachBooking.find({
      user: userObjectId,
      paymentId: { $exists: true, $nin: [null, ""] },
    }).lean();

    const extraRecords = orphanedBookings
      .filter((b: any) => b.paymentId && !coveredPaymentIds.has(String(b.paymentId)))
      .map((b: any) => ({
        _id: b._id,
        userId: userObjectId,
        provider: "razorpay",
        plan: "session",
        billingPeriod: "one-time",
        amountInr: b.amount || 0,
        status: b.status === "confirmed" || b.status === "completed" ? "active" : b.status,
        externalId: b.orderId || null,
        paymentId: b.paymentId,
        coachName: b.coachName || "",
        coachImage: b.coachImage || "",
        sessionType: b.consultationType || "",
        scheduledFor: b.scheduledFor,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      }));

    const history = [...subscriptions, ...extraRecords].sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return res.json({ success: true, message: "Payment history", data: history });
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

// DELETE /api/v1/payments/history/:userId/:recordId
export const deletePaymentHistoryRecord = async (req: AuthRequest, res: Response) => {
  try {
    const { Subscription } = await import("../models/Subscription");
    const { userId, recordId } = req.params;
    if (!req.userId || req.userId !== userId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const deleted = await Subscription.findOneAndDelete({ _id: recordId, userId });
    if (!deleted) return res.status(404).json({ success: false, message: "Record not found" });
    return res.json({ success: true, message: "Record deleted" });
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

// GET /api/v1/payments/status/:userId
export const premiumStatus = async (req: Request, res: Response) => {
  try {
    const data = await getUserPremiumStatus(String(req.params.userId || ""));
    return res.json({ success: true, message: "Premium status", data });
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

