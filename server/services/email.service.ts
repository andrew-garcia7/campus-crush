import { Resend } from "resend";
import crypto from "crypto";
import { env } from "../config/env";

type OtpRecord = {
  code: string;
  expiresAt: number;
};

const otpStore = new Map<string, OtpRecord>();

const resend = new Resend(env.RESEND_API_KEY);

if (!env.RESEND_API_KEY) {
  console.warn("⚠️  RESEND_API_KEY not configured — OTP email will fail");
} else {
  console.log("✅ Resend email service initialised");
}


// ─── SEND OTP ─────────────────────────────────────────────────────────────────
export const sendOtpEmail = async (email: string) => {
  console.log("OTP request received");
  console.log("Email:", email);

  if (!env.RESEND_API_KEY) {
    console.error("[Email] RESEND_API_KEY not configured. Set it in Render environment variables.");
    throw new Error("Email service is not configured. Please contact support.");
  }

  const code = crypto.randomInt(100_000, 999_999).toString();

  otpStore.set(email.toLowerCase(), {
    code,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  console.log("Sending OTP via Resend");

  try {
    const { data, error } = await resend.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to: [email],
      subject: "Campus Crush Verification OTP 💜",
      html: `
        <div style="font-family:Arial;padding:20px;background:#0f0f1a;color:white;border-radius:12px;">
          <h2 style="color:#d946ef;">Campus Crush Verification</h2>
          <p>Your OTP code is:</p>
          <h1 style="font-size:32px;color:#9333ea;">${code}</h1>
          <p>This OTP expires in 5 minutes.</p>
          <p>If you didn't request this, ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend API error:", error);
      throw new Error(error.message || "Failed to send email via Resend");
    }

    console.log("OTP sent successfully");
    console.log("Resend email id:", data?.id);

    return { success: true, message: "OTP sent successfully" };

  } catch (error: any) {
    console.error("OTP send error:", error);
    console.error("OTP email failed:", error?.message || error);
    throw new Error(error?.message || "Unknown email error");
  }
};


// VERIFY OTP
export const verifyOtp = async (
  email: string,
  code: string
) => {
  const record =
    otpStore.get(
      email.toLowerCase()
    );

  if (!record) {
    return false;
  }

  if (
    Date.now() >
    record.expiresAt
  ) {
    otpStore.delete(
      email.toLowerCase()
    );
    return false;
  }

  const valid =
    record.code === code;

  if (valid) {
    otpStore.delete(
      email.toLowerCase()
    );
  }

  return valid;
};