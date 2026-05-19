import { z } from "zod";
import { Router } from "express";

import {
  bookCoach,
  createCoachPaymentOrder,
  deleteMyBooking,
  getCoachById,
  getMyBookings,
  listCoaches,
  verifyCoachPayment
} from "../controllers/coach.controller";

import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";

const router = Router();

/* -----------------------------
   Shared Validation Constants
------------------------------ */

const consultationTypeEnum = z.enum([
  "chat",
  "video",
  "call"
]);

const coachIdParamSchema = z.object({
  id: z.string().min(1, "Coach ID is required")
});

/* -----------------------------
   Book Coach Validation
------------------------------ */

const bookingSchema = z.object({
  body: z.object({
    consultationType: consultationTypeEnum,

    scheduledFor: z
      .string()
      .datetime("Invalid scheduled date format"),

    notes: z
      .string()
      .max(500, "Notes cannot exceed 500 characters")
      .optional()
  }),

  params: coachIdParamSchema,

  query: z.object({}).optional()
});

/* -----------------------------
   Verify Payment Validation
------------------------------ */

const verifySchema = z.object({
  body: z.object({
    orderId: z
      .string()
      .min(1, "Order ID required"),

    paymentId: z
      .string()
      .min(1, "Payment ID required"),

    signature: z
      .string()
      .min(1, "Payment signature required"),

    consultationType: consultationTypeEnum,

    scheduledFor: z
      .string()
      .datetime("Invalid scheduled date format"),

    notes: z
      .string()
      .max(500, "Notes cannot exceed 500 characters")
      .optional()
  }),

  params: coachIdParamSchema,

  query: z.object({}).optional()
});

/* -----------------------------
   Public Routes
------------------------------ */

// Get all coaches
router.get("/", listCoaches);

/* -----------------------------
   Protected User Routes
   MUST be defined before /:id so Express doesn't swallow "/my-bookings"
   as the :id wildcard parameter.
------------------------------ */

// User bookings
router.get("/my-bookings", requireAuth, getMyBookings);

// Cancel booking
router.delete(
  "/my-bookings/:bookingId",
  requireAuth,
  deleteMyBooking
);

// Get single coach details (wildcard — keep AFTER all fixed-path routes)
router.get("/:id", getCoachById);

// Direct booking without payment
router.post(
  "/:id/book",
  requireAuth,
  validate(bookingSchema),
  bookCoach
);

/* -----------------------------
   Payment Routes
------------------------------ */

// Payment order — no auth required (coach ID + Razorpay handles security)
router.post(
  "/:id/payment-order",
  createCoachPaymentOrder
);

// Verify payment + create booking — requireAuth so userId is recorded on the booking
router.post(
  "/:id/verify-payment",
  requireAuth,
  validate(verifySchema),
  verifyCoachPayment
);

export default router;