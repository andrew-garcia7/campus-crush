import { Request, Response } from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../middleware/auth.middleware";
import { Coach } from "../models/Coach";
import { CoachBooking } from "../models/CoachBooking";
import Razorpay from "razorpay";
import crypto from "crypto";
import { env } from "../config/env";

/** Extract userId from the Bearer token in the Authorization header.
 * Used as a fallback when requireAuth middleware is not on the route. */
const getUserIdFromRequest = (req: Request): string | null => {
  if ((req as AuthRequest).userId) return (req as AuthRequest).userId!;
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  try {
    const payload = jwt.verify(auth.slice(7), env.JWT_SECRET) as { userId?: string };
    return payload.userId || null;
  } catch {
    return null;
  }
};

let razorpay: Razorpay | null = null;
if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({ key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET });
}

export const listCoaches = async (_req: Request, res: Response) => {
	try {
		const data = await Coach.find({ active: true }).sort({ isFeatured: -1, rating: -1, reviewsCount: -1 }).lean();
		res.json({ success: true, message: "Coaches", data });
	} catch (error: any) {
		res.status(500).json({ success: false, message: error.message || "Unable to load coaches" });
	}
};

export const getCoachById = async (req: Request, res: Response) => {
	try {
		const coach = await Coach.findById(req.params.id).lean();
		if (!coach) return res.status(404).json({ success: false, message: "Coach not found" });
		res.json({ success: true, message: "Coach detail", data: coach });
	} catch (error: any) {
		res.status(500).json({ success: false, message: error.message || "Unable to load coach" });
	}
};

export const bookCoach = async (req: AuthRequest, res: Response) => {
	try {
		const coach = await Coach.findById(req.params.id);
		if (!coach) return res.status(404).json({ success: false, message: "Coach not found" });

		const booking = await CoachBooking.create({
			coach:            coach._id,
			user:             req.userId,
			coachName:        coach.name,
			coachImage:       coach.avatar || "",
			consultationType: req.body.consultationType,
			scheduledFor:     req.body.scheduledFor,
			amount:           coach.pricePerSession,
			notes:            req.body.notes || ""
		});

		res.status(201).json({ success: true, message: "Consultation booked", data: booking });
	} catch (error: any) {
		res.status(400).json({ success: false, message: error.message || "Unable to book coach" });
	}
};

export const createCoachPaymentOrder = async (req: AuthRequest, res: Response) => {
	try {
		if (!razorpay) {
			// No Razorpay keys — return a signal for the frontend to fallback to free booking
			return res.json({ success: true, data: { orderId: null, razorpayKeyId: null } });
		}
		if (!mongoose.Types.ObjectId.isValid(String(req.params.id))) {
			// Demo / invalid ID — return no-payment signal so frontend falls back to free booking
			return res.json({ success: true, data: { orderId: null, razorpayKeyId: null } });
		}
		const coach = await Coach.findById(req.params.id);
		if (!coach) return res.status(404).json({ success: false, message: "Coach not found" });

		const platformFee = Math.round(coach.pricePerSession * 0.05);
		const total = coach.pricePerSession + platformFee;

		const order = await razorpay.orders.create({
			amount: total * 100,
			currency: "INR",
			receipt: `coach_${Date.now()}`
		});

		res.json({
			success: true,
			data: {
				orderId: order.id,
				amount: total,
				baseAmount: coach.pricePerSession,
				platformFee,
				currency: "INR",
				coachName: coach.name,
				razorpayKeyId: env.RAZORPAY_KEY_ID
			}
		});
	} catch (error: any) {
		res.status(500).json({ success: false, message: error.message || "Failed to create order" });
	}
};

export const verifyCoachPayment = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const {
      orderId,
      paymentId,
      signature,
      consultationType,
      scheduledFor,
      notes
    } = req.body;

    console.log("VERIFY PAYMENT BODY:", req.body);

    // Razorpay signature verification
    const expected = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    if (expected !== signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed"
      });
    }

    const coach = await Coach.findById(req.params.id);

    if (!coach) {
      return res.status(404).json({
        success: false,
        message: "Coach not found"
      });
    }

    const platformFee = Math.round(
      coach.pricePerSession * 0.05
    );

    const totalAmount =
      coach.pricePerSession + platformFee;

    // Always resolve userId from the JWT token (set by requireAuth or parsed from header)
    const currentUserId = getUserIdFromRequest(req);

    if (!currentUserId) {
      return res.status(401).json({ success: false, message: "Unauthorized – please sign in" });
    }

    // dynamic payload
    const bookingPayload: any = {
      coach: coach._id,
      user: currentUserId,

      coachName: coach.name,
      coachImage: coach.avatar || "",

      consultationType,
      scheduledFor: new Date(scheduledFor),

      amount: totalAmount,
      notes: notes || "",

      paymentId,
      orderId,

      status: "confirmed"
    };

    const booking = await CoachBooking.create(bookingPayload);

    // Save payment history record
    try {
      const { Subscription } = await import("../models/Subscription");
      await Subscription.create({
        userId: currentUserId,
        provider: "razorpay",
        plan: "session",
        billingPeriod: "one-time",
        amountInr: totalAmount,
        status: "active",
        externalId: orderId,
        paymentId,
        coachName: coach.name,
        coachImage: coach.avatar || "",
        sessionType: consultationType,
        scheduledFor: new Date(scheduledFor)
      });
    } catch (subscriptionError) {
      // Non-fatal – booking succeeded; log so we can diagnose
      console.error("Subscription record save failed:", subscriptionError);
    }

    return res.status(201).json({
      success: true,
      message:
        "Payment verified & booking confirmed",
      data: booking
    });

  } catch (error: any) {
    console.log(
      "VERIFY PAYMENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Booking failed"
    });
  }
};



export const getMyBookings = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.userId) {
      return res.json({
        success: true,
        message: "No authenticated user",
        data: []
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.userId)) {
      return res.json({ success: true, message: "Bookings fetched", data: [] });
    }

    const bookings =
      await CoachBooking.find({
        user: req.userId
      })
        .populate(
          "coach",
          "name title avatar pricePerSession"
        )
        .sort({ createdAt: -1 })
        .lean();

    const normalized = bookings.map(
      (b: any) => ({
        ...b,
        coachName:
          b.coach?.name ||
          b.coachName ||
          "Coach",

        coachImage:
          b.coach?.avatar ||
          b.coachImage ||
          ""
      })
    );

    return res.json({
      success: true,
      message: "Bookings fetched",
      data: normalized
    });

  } catch (error: any) {
    console.log(
      "GET BOOKINGS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to load bookings"
    });
  }
};



export const deleteMyBooking = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Login required"
      });
    }

    const deleted =
      await CoachBooking.findOneAndDelete({
        _id: req.params.bookingId,
        user: req.userId
      });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    return res.json({
      success: true,
      message:
        "Booking deleted successfully"
    });

  } catch (error: any) {
    console.log(
      "DELETE BOOKING ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to delete booking"
    });
  }
};