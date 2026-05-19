import { Request, Response } from "express";
import path from "path";
import { saveGalleryImage, saveProfileImage, saveSelfieVerification, saveStudentId, saveVoiceMessage } from "../services/upload.service";
import { AuthRequest } from "../middleware/auth.middleware";
import { User } from "../models/User";
import { validateStudentId } from "../services/ocr.service";
import { detectFaceInSelfie, detectFaceInStudentId } from "../services/faceDetect.service";

const extOf = (name: string) => path.extname(name).replace(".", "") || "jpg";

export const uploadStudentId = async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) return res.status(400).json({ success: false, message: "studentId file is required" });

  // ── 1. OCR validation — must contain real student ID text ─────────────
  const ocrResult = await validateStudentId(file.buffer);
  if (!ocrResult.valid) {
    return res.status(422).json({
      success: false,
      message: ocrResult.reason ?? "Invalid student ID. Please upload a real university ID card.",
    });
  }

  // ── 2. Face detection on ID — student photo must be present ──────────
  let faceResult;
  try {
    faceResult = await detectFaceInStudentId(file.buffer);
  } catch (err: any) {
    return res.status(503).json({
      success: false,
      message: "Verification service temporarily unavailable. Please try again in a moment.",
    });
  }

  if (!faceResult.hasFace) {
    return res.status(422).json({ success: false, message: faceResult.reason });
  }

  // ── 3. All checks passed — persist file ──────────────────────────────
  const saved = await saveStudentId(file.buffer, extOf(file.originalname));
  return res.json({ success: true, message: "Student ID uploaded", data: saved });
};

export const uploadSelfie = async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) return res.status(400).json({ success: false, message: "selfie file is required" });

  // ── 1. Strict selfie validation: exactly 1 real face, quality checks ──
  let faceResult;
  try {
    faceResult = await detectFaceInSelfie(file.buffer);
  } catch (err: any) {
    return res.status(503).json({
      success: false,
      message: "Verification service temporarily unavailable. Please try again in a moment.",
    });
  }

  if (!faceResult.hasFace) {
    return res.status(422).json({ success: false, message: faceResult.reason });
  }

  // ── 2. All checks passed — persist file ──────────────────────────────
  const saved = await saveSelfieVerification(file.buffer, extOf(file.originalname));
  return res.json({ success: true, message: "Selfie uploaded", data: saved });
};

export const uploadProfile = async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) return res.status(400).json({ success: false, message: "profile file is required" });
  const saved = await saveProfileImage(file.buffer, extOf(file.originalname));
  res.json({ success: true, message: "Profile image uploaded", data: saved });
};

export const uploadProfilePhoto = async (req: AuthRequest, res: Response) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, message: "profilePhoto file is required" });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const saved = await saveProfileImage(file.buffer, extOf(file.originalname));
    const nextPhotos = Array.isArray(user.photos) ? [...user.photos] : [];
    nextPhotos[0] = saved.publicUrl;
    user.photos = nextPhotos.filter(Boolean).slice(0, 6);
    await user.save();

    res.json({ success: true, message: "Profile photo uploaded", data: { ...saved, photos: user.photos } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Profile photo upload failed" });
  }
};

export const deletePhoto = async (req: AuthRequest, res: Response) => {
  try {
    const { photoUrl } = req.body;
    if (!photoUrl || typeof photoUrl !== "string") {
      return res.status(400).json({ success: false, message: "photoUrl is required" });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Normalise to pathname so both relative and absolute URLs match what is stored in the DB
    const toPath = (url: string) => {
      try { return new URL(url).pathname; } catch { return url; }
    };
    const targetPath = toPath(photoUrl);
    user.photos = (user.photos || []).filter((p: string) => toPath(p) !== targetPath);
    await user.save();

    res.json({ success: true, message: "Photo deleted", data: { photos: user.photos } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Delete failed" });
  }
};

export const uploadGalleryPhoto = async (req: AuthRequest, res: Response) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, message: "galleryPhoto file is required" });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const requestedSlot = Number(req.body?.slot);
    const slot = Number.isInteger(requestedSlot) ? requestedSlot : -1;
    if (slot < 1 || slot > 5) {
      return res.status(400).json({ success: false, message: "slot must be between 1 and 5" });
    }

    const saved = await saveGalleryImage(file.buffer, extOf(file.originalname));
    const nextPhotos = Array.isArray(user.photos) ? [...user.photos] : [];
    nextPhotos[slot] = saved.publicUrl;
    user.photos = nextPhotos.filter(Boolean).slice(0, 6);
    await user.save();

    res.json({ success: true, message: "Gallery photo uploaded", data: { ...saved, slot, photos: user.photos } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Gallery upload failed" });
  }
};

export const uploadVoice = async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) return res.status(400).json({ success: false, message: "voice file is required" });
  const ext = path.extname(file.originalname).replace(".", "") || "webm";
  const saved = await saveVoiceMessage(file.buffer, ext);
  res.json({ success: true, message: "Voice message uploaded", data: saved });
};
