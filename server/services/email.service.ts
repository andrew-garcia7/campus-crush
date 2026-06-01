import nodemailer from "nodemailer";
import crypto from "crypto";
import { env } from "../config/env";

type OtpRecord = {
  code: string;
  expiresAt: number;
};

const otpStore = new Map<string, OtpRecord>();

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** True only when credentials look real — rejects empty strings AND placeholders. */
function credentialsConfigured(): boolean {
  const user = (env.SMTP_USER ?? "").trim();
  const pass = (env.SMTP_PASS ?? "").trim();
  if (!user || !pass) return false;
  if (user.includes("your_email") || pass.includes("your_app_password")) return false;
  return true;
}

/**
 * Fresh transporter per call — avoids reusing a previously stalled socket.
 * All three timeouts prevent sendMail() from hanging forever when Render's
 * outbound TCP to Gmail stalls (the primary cause of the "Sending…" freeze).
 */
function buildTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
    connectionTimeout: 10_000, // 10 s — give up if TCP never opens
    socketTimeout:     10_000, // 10 s — give up if socket goes silent
    greetingTimeout:   10_000, // 10 s — give up if SMTP greeting never arrives
  });
}

/** Hard deadline around any promise — safety net on top of Nodemailer timeouts. */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`${label} timed out after ${ms / 1000}s`)),
        ms
      )
    ),
  ]);
}

// ─── Non-blocking startup SMTP check ─────────────────────────────────────────
// Uses its own transporter so a hung verify() can never block sendMail() calls.
if (credentialsConfigured()) {
  const checkTransporter = buildTransporter();
  withTimeout(
    new Promise<void>((resolve, reject) =>
      checkTransporter.verify((err) => (err ? reject(err) : resolve()))
    ),
    12_000,
    "SMTP verify"
  )
    .then(() => console.log("✅ SMTP verified — email server ready"))
    .catch((err: Error) =>
      console.error("❌ SMTP connection check failed:", err.message)
    );
} else {
  console.warn("⚠️  SMTP_USER / SMTP_PASS not configured — OTP email will fail");
}


// ─── SEND OTP ─────────────────────────────────────────────────────────────────
export const sendOtpEmail = async (
  email: string
) => {
  console.log("OTP request received");
  console.log("Email:", email);

  // Guard: reject immediately when creds are missing or contain placeholder values
  if (!credentialsConfigured()) {
    console.error(
      "[Email] SMTP credentials missing or contain placeholder values. " +
      "Set real SMTP_USER and SMTP_PASS in Render environment variables."
    );
    throw new Error(
      "Email service is not configured. Please contact support."
    );
  }

  try {
    const code = crypto.randomInt(100_000, 999_999).toString();

    otpStore.set(
      email.toLowerCase(),
      {
        code,
        expiresAt: Date.now() + 5 * 60 * 1000
      }
    );

    console.log("Sending OTP email");

    // Fresh transporter per call — never reuses a stale/stalled socket
    const transporter = buildTransporter();

    // 15 s hard deadline — if sendMail() hangs, this throws → controller returns 500
    await withTimeout(
      transporter.sendMail({
        from:    `"Campus Crush AI" <${env.SMTP_USER}>`,
        to:      email,
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
      }),
      15_000,
      "sendMail"
    );

    console.log('OTP sent successfully');
    console.log('OTP sent to: ' + email);

    return { success: true, message: 'OTP sent successfully' };

  } catch (error: any) {
    console.error('OTP send error:', error);
    console.error('OTP email failed:', error?.message || error);
    const reason = error?.responseCode
      ? ('SMTP error ' + error.responseCode + ': ' + error.response)
      : (error?.message || 'Unknown email error');
    throw new Error(reason);
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