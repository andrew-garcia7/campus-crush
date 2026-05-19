import nodemailer from "nodemailer";
import crypto from "crypto";
import { env } from "../config/env";

type OtpRecord = {
  code: string;
  expiresAt: number;
};

const otpStore = new Map<string, OtpRecord>();

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS
  }
});

// verify transporter on startup
transporter.verify((error, success) => {
  if (error) {
    console.log(
      "❌ SMTP connection failed:"
    );
    console.log(error);
  } else {
    console.log(
      "✅ Email server ready"
    );
  }
});


// SEND OTP
export const sendOtpEmail = async (
  email: string
) => {
  // Guard: reject immediately if SMTP is not configured
  if (!env.SMTP_USER || !env.SMTP_PASS) {
    console.error("[Email] SMTP_USER or SMTP_PASS is not set. Check your .env file.");
    throw new Error(
      "Email service is not configured. Please contact support."
    );
  }

  try {
    const code = crypto
      .randomInt(
        100000,
        999999
      )
      .toString();

    otpStore.set(
      email.toLowerCase(),
      {
        code,
        expiresAt:
          Date.now() +
          5 * 60 * 1000
      }
    );

    await transporter.sendMail({
      from: `"Campus Crush AI" <${env.SMTP_USER}>`,
      to: email,
      subject:
        "Campus Crush Verification OTP 💜",
      html: `
        <div style="
          font-family: Arial;
          padding:20px;
          background:#0f0f1a;
          color:white;
          border-radius:12px;
        ">
          <h2 style="color:#d946ef;">
            Campus Crush Verification
          </h2>

          <p>
            Your OTP code is:
          </p>

          <h1 style="
            font-size:32px;
            color:#9333ea;
          ">
            ${code}
          </h1>

          <p>
            This OTP expires in
            5 minutes.
          </p>

          <p>
            If you didn’t request this,
            ignore this email.
          </p>
        </div>
      `
    });

    console.log(
      `✅ OTP sent to ${email}`
    );

    return {
      success: true,
      message:
        "OTP sent successfully"
    };

  } catch (error: any) {
    console.error("❌ OTP email failed:", error?.message || error);

    // Surface a useful message — include SMTP reason in development
    const reason: string =
      error?.responseCode
        ? `SMTP error ${error.responseCode}: ${error.response}`
        : error?.message || "Unknown email error";

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