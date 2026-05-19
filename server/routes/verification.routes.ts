import { z } from "zod";
import { Router } from "express";
import { sendEmailOtp, submitVerification, verifyEmailOtp } from "../controllers/verification.controller";
import { validate } from "../middleware/validate.middleware";

const r = Router();

const sendOtpSchema = z.object({
  body: z.object({ email: z.string().email() }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

const verifyOtpSchema = z.object({
  body: z.object({ email: z.string().email(), otp: z.string().length(6) }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

const submitSchema = z.object({
  body: z.object({ userId: z.string().min(1), studentIdUrl: z.string().min(1), selfieUrl: z.string().min(1) }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

r.post("/email-otp/send", validate(sendOtpSchema), sendEmailOtp);
r.post("/email-otp/verify", validate(verifyOtpSchema), verifyEmailOtp);
r.post("/submit", validate(submitSchema), submitVerification);

export default r;
