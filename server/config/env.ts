import dotenv from "dotenv";
import path from "path";

// server/config/env.ts → __dirname = server/config/
// ../  = server/  (where server/.env lives)
// ../../ = project root  (fallback)
dotenv.config({ path: path.resolve(__dirname, "../.env") });   // server/.env
dotenv.config({ path: path.resolve(__dirname, "../../.env") }); // root .env (fallback)

export const env = {
  PORT: Number(process.env.PORT || 5000),
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
  MONGODB_URI: process.env.MONGODB_URI || "",
  JWT_SECRET: process.env.JWT_SECRET || "cc-dev-jwt-secret-do-not-use-in-prod",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || "",
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || "",
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || "",
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || "",
  TWILIO_API_KEY: process.env.TWILIO_API_KEY || "",
  TWILIO_API_SECRET: process.env.TWILIO_API_SECRET || "",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || "",
  SMTP_HOST: process.env.SMTP_HOST || "",
  SMTP_PORT: Number(process.env.SMTP_PORT || 587),
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || "",
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || "Campus Crush <onboarding@resend.dev>",
  // AWS Rekognition — required for face detection on selfies and student IDs.
  // If not set, face validation is skipped (OCR still runs).
  AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY || "",
  AWS_SECRET_KEY: process.env.AWS_SECRET_KEY || "",
  AWS_REGION: process.env.AWS_REGION || "ap-south-1",
};
