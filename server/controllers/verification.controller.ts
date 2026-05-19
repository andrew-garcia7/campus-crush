import { Request, Response } from "express";
import fs from "fs/promises";
import path from "path";
import { User } from "../models/User";
import { sendOtpEmail, verifyOtp } from "../services/email.service";
import { compareFaces } from "../services/faceMatch.service";
import { uploadsRoot } from "../utils/uploads-path";

/**
 * Convert a public URL like /uploads/student-ids/uuid.jpg to a disk path.
 */
function urlToFilePath(publicUrl: string): string {
  const rel = publicUrl.replace(/^\/uploads\//, "");
  return path.join(uploadsRoot, rel);
}

// SEND EMAIL OTP
export const sendEmailOtp = async (
  req: Request,
  res: Response
) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const result =
      await sendOtpEmail(email);

    return res.json({
      success: true,
      message:
        result.message ||
        "OTP sent successfully"
    });

  } catch (error: any) {
    console.error(
      "Send OTP Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to send OTP"
    });
  }
};


// VERIFY EMAIL OTP
export const verifyEmailOtp = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, otp } =
      req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message:
          "Email and OTP required"
      });
    }

    const valid =
      await verifyOtp(
        email,
        otp
      );

    if (!valid) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid or expired OTP"
      });
    }

    return res.json({
      success: true,
      message:
        "OTP verified successfully"
    });

  } catch (error: any) {
    console.error(
      "Verify OTP Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "OTP verification failed"
    });
  }
};


// FINAL VERIFICATION SUBMIT — runs face match, then marks verified/rejected
export const submitVerification = async (req: Request, res: Response) => {
  try {
    const { userId, studentIdUrl, selfieUrl } = req.body;

    if (!userId || !studentIdUrl || !selfieUrl) {
      return res.status(400).json({
        success: false,
        message: "Missing verification data",
      });
    }

    // ── 1. Load file buffers from disk ───────────────────────────────────
    let selfieBuffer: Buffer;
    let studentIdBuffer: Buffer;

    try {
      [selfieBuffer, studentIdBuffer] = await Promise.all([
        fs.readFile(urlToFilePath(selfieUrl)),
        fs.readFile(urlToFilePath(studentIdUrl)),
      ]);
    } catch {
      return res.status(422).json({
        success: false,
        message:
          "Uploaded files could not be found. Please re-upload your student ID and selfie.",
      });
    }

    // ── 2. Face match: selfie vs student ID ──────────────────────────────
    let matchResult;
    try {
      matchResult = await compareFaces(selfieBuffer, studentIdBuffer);
    } catch (err: any) {
      return res.status(503).json({
        success: false,
        message:
          "Verification service temporarily unavailable. Please try again in a moment.",
      });
    }

    if (!matchResult.matched) {
      // Face mismatch — don't permanently block; let user re-try
      return res.status(422).json({
        success: false,
        message:
          matchResult.reason ??
          "Face match failed. Your selfie must match the photo on your student ID.",
      });
    }

    // ── 3. All checks passed — mark verified ─────────────────────────────
    const user = await User.findByIdAndUpdate(
      userId,
      {
        verificationStatus: "verified",
        studentIdUrl,
        selfieUrl,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({
      success: true,
      message: "Verification complete! Welcome to Campus Crush.",
      user,
    });
  } catch (error: any) {
    console.error("Verification Submit Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Verification submission failed",
    });
  }
};