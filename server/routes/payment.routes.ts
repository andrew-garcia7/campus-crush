import { z } from "zod";
import { Router } from "express";
import {
  createCheckout,
  deletePaymentHistoryRecord,
  paymentHistory,
  premiumStatus,
  razorpayWebhook,
  verifyPayment
} from "../controllers/payment.controller";
import { rateLimit } from "../middleware/rate-limit.middleware";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";

const r = Router();

const checkoutSchema = z.object({
  body: z.object({
    userId:        z.string().min(1),
    plan:          z.enum(["starter", "premium", "vip"]),
    billingPeriod: z.enum(["monthly", "quarterly", "yearly"]).optional(),
    amount:        z.number().positive().optional()
  }),
  query:  z.object({}).optional(),
  params: z.object({}).optional()
});

const verifySchema = z.object({
  body: z.object({
    orderId:   z.string().min(1),
    paymentId: z.string().min(1),
    signature: z.string().min(1)
  }),
  query:  z.object({}).optional(),
  params: z.object({}).optional()
});

r.use(rateLimit(45, 60_000));
r.post("/checkout",          validate(checkoutSchema), createCheckout);
r.post("/verify",            validate(verifySchema),   verifyPayment);
r.post("/webhook/razorpay",  razorpayWebhook);
r.get("/status/:userId",     premiumStatus);
r.get("/history/:userId",    requireAuth, paymentHistory);
r.delete("/history/:userId/:recordId", requireAuth, deletePaymentHistoryRecord);

export default r;
