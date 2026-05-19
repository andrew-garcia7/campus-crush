import { Router, Request, Response, NextFunction } from "express";
import multer, { FileFilterCallback } from "multer";
import upload from "../middleware/upload.middleware";
import { deletePhoto, uploadGalleryPhoto, uploadProfile, uploadProfilePhoto, uploadSelfie, uploadStudentId, uploadVoice } from "../controllers/upload.controller";
import { requireAuth } from "../middleware/auth.middleware";

const r = Router();

// ── Audio upload middleware (voice messages only) ──────────────────────
const ALLOWED_AUDIO_MIMES = new Set([
  "audio/webm",
  "audio/ogg",
  "audio/mp4",
  "audio/mpeg",
  "audio/wav",
  "audio/x-m4a",
  "video/webm", // Chrome records MediaRecorder output as video/webm even for audio-only
]);

const audioUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (ALLOWED_AUDIO_MIMES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files are accepted for voice messages."));
    }
  },
});

// Multer error handler – must use 4-arg signature so Express treats it as error middleware
const multerErrorHandler = (err: any, _req: Request, res: Response, next: NextFunction) => {
  if (err?.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ success: false, message: "File too large. Maximum size is 5 MB." });
  }
  if (err?.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({ success: false, message: "Unexpected file field." });
  }
  if (err) {
    return res.status(400).json({ success: false, message: err.message || "Upload error." });
  }
  return next();
};

// requireAuth on verification uploads prevents anonymous abuse
r.post("/student-id", requireAuth, upload.single("studentId"), multerErrorHandler, uploadStudentId);
r.post("/selfie", requireAuth, upload.single("selfie"), multerErrorHandler, uploadSelfie);
r.post("/profile", upload.single("profile"), multerErrorHandler, uploadProfile);
r.post("/profile-photo", requireAuth, upload.single("profilePhoto"), multerErrorHandler, uploadProfilePhoto);
r.post("/gallery-photo", requireAuth, upload.single("galleryPhoto"), multerErrorHandler, uploadGalleryPhoto);
r.post("/voice", audioUpload.single("voice"), multerErrorHandler, uploadVoice);
r.delete("/photo", requireAuth, deletePhoto);

export default r;
