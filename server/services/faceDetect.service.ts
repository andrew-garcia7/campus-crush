import {
  RekognitionClient,
  DetectFacesCommand,
  FaceDetail,
} from "@aws-sdk/client-rekognition";
import sharp from "sharp";
import { env } from "../config/env";

export interface FaceDetectionResult {
  hasFace: boolean;
  faceCount: number;
  confidence: number;
  reason?: string;
}

function buildClient(): RekognitionClient {
  if (!env.AWS_ACCESS_KEY || !env.AWS_SECRET_KEY) {
    throw new Error(
      "AWS Rekognition is not configured. Set AWS_ACCESS_KEY, AWS_SECRET_KEY, and AWS_REGION in your .env file."
    );
  }
  return new RekognitionClient({
    region: env.AWS_REGION || "ap-south-1",
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY,
      secretAccessKey: env.AWS_SECRET_KEY,
    },
  });
}

/**
 * Rekognition Image.Bytes only accepts JPEG, PNG, or GIF.
 * Convert any format (HEIC, WebP, AVIF, TIFF, etc.) to JPEG before calling the API.
 * This is the single source-of-truth normaliser — every Rekognition call must go through here.
 */
async function toJpegBuffer(raw: Buffer): Promise<Buffer> {
  const meta = await sharp(raw).metadata();
  if (meta.format === "jpeg" || meta.format === "jpg") {
    // Already JPEG — pass through unchanged to avoid double re-encode quality loss
    return raw;
  }
  console.log(`[FaceDetect] Converting ${meta.format ?? "unknown"} → JPEG before Rekognition call`);
  return sharp(raw)
    .rotate()           // honour EXIF orientation so Rekognition sees an upright face
    .jpeg({ quality: 92, mozjpeg: false })
    .toBuffer();
}

async function runDetect(imageBuffer: Buffer, minConfidence: number): Promise<FaceDetail[]> {
  const jpegBuffer = await toJpegBuffer(imageBuffer);
  const result = await buildClient().send(
    new DetectFacesCommand({
      Image: { Bytes: jpegBuffer },
      Attributes: ["ALL"],
    })
  );
  return (result.FaceDetails ?? []).filter((f) => (f.Confidence ?? 0) >= minConfidence);
}

/**
 * Validate a selfie:
 * - Exactly 1 real human face (rejects group photos)
 * - Sufficient sharpness and brightness (rejects blurry/dark photos)
 * - High confidence threshold (rejects anime/AI art/objects)
 */
export async function detectFaceInSelfie(imageBuffer: Buffer): Promise<FaceDetectionResult> {
  try {
    const faces = await runDetect(imageBuffer, 88);

    console.log(`[FaceDetect] Selfie — Rekognition detected ${faces.length} face(s) above 88% confidence`);

    if (faces.length === 0) {
      return {
        hasFace: false,
        faceCount: 0,
        confidence: 0,
        reason:
          "No real human face detected. Please upload a clear, well-lit selfie showing your face.",
      };
    }

    if (faces.length > 1) {
      return {
        hasFace: false,
        faceCount: faces.length,
        confidence: 0,
        reason: `${faces.length} faces detected. Please upload a solo selfie with only your face visible.`,
      };
    }

    const face = faces[0];
    const sharpness = face.Quality?.Sharpness ?? 0;
    const brightness = face.Quality?.Brightness ?? 0;
    const confidence = face.Confidence ?? 0;

    // Log every metric so you can tune thresholds without guessing
    console.log(
      `[FaceDetect] Selfie quality — confidence: ${confidence.toFixed(1)}, ` +
      `sharpness: ${sharpness.toFixed(1)}, brightness: ${brightness.toFixed(1)}, ` +
      `pose: yaw=${face.Pose?.Yaw?.toFixed(1)} pitch=${face.Pose?.Pitch?.toFixed(1)} roll=${face.Pose?.Roll?.toFixed(1)}, ` +
      `bbox: left=${face.BoundingBox?.Left?.toFixed(3)} top=${face.BoundingBox?.Top?.toFixed(3)} ` +
      `w=${face.BoundingBox?.Width?.toFixed(3)} h=${face.BoundingBox?.Height?.toFixed(3)}`
    );

    // ── Deployed thresholds ───────────────────────────────────────────────
    //   SHARPNESS_THRESHOLD   = 5   (rejects only black/white/solid-colour frames)
    //   BRIGHTNESS_THRESHOLD  = 8   (rejects only effectively-black images)
    //   HIGH_CONFIDENCE_BYPASS: when confidence ≥ 95 AND brightness ≥ 30,
    //     the sharpness check is skipped entirely. Browser JPEG re-encoding
    //     (canvas → multer → Sharp) routinely deflates Rekognition's sharpness
    //     metric for faces detected at 99%+ confidence. A face Rekognition is
    //     95%+ sure about, in a well-lit image, should never be rejected for
    //     a low sharpness score.
    // ─────────────────────────────────────────────────────────────────────
    const SHARPNESS_THRESHOLD  = 5;
    const BRIGHTNESS_THRESHOLD = 8;
    const highConfidenceBypass = confidence >= 95 && brightness >= 30;

    if (sharpness < SHARPNESS_THRESHOLD && !highConfidenceBypass) {
      console.error("422_REASON: SHARPNESS");
      console.error(`422_VALUE: ${sharpness.toFixed(2)}`);
      console.error(`422_THRESHOLD: ${SHARPNESS_THRESHOLD}`);
      return {
        hasFace: false,
        faceCount: 1,
        confidence,
        reason: "Selfie is too blurry. Please take a clearer photo in good lighting.",
      };
    }

    if (brightness < BRIGHTNESS_THRESHOLD) {
      console.error("422_REASON: BRIGHTNESS");
      console.error(`422_VALUE: ${brightness.toFixed(2)}`);
      console.error(`422_THRESHOLD: ${BRIGHTNESS_THRESHOLD}`);
      return {
        hasFace: false,
        faceCount: 1,
        confidence,
        reason: "Selfie is too dark. Please take a photo in better lighting.",
      };
    }

    if (highConfidenceBypass && sharpness < SHARPNESS_THRESHOLD) {
      console.log(
        `[FaceDetect] High-confidence bypass applied — ` +
        `confidence: ${confidence.toFixed(1)} ≥ 95, brightness: ${brightness.toFixed(1)} ≥ 30, ` +
        `sharpness: ${sharpness.toFixed(1)} < ${SHARPNESS_THRESHOLD} (bypassed)`
      );
    }

    console.log(`[FaceDetect] Selfie passed all checks — confidence: ${confidence.toFixed(1)}, sharpness: ${sharpness.toFixed(1)}, brightness: ${brightness.toFixed(1)}`);
    return { hasFace: true, faceCount: 1, confidence };
  } catch (err: any) {
    console.error("[FaceDetect] Rekognition selfie error:", err.message);
    throw new Error(err.message || "Face verification service temporarily unavailable.");
  }
}

/**
 * Validate a student ID card:
 * - At least 1 face present (the student photo printed on the card)
 */
export async function detectFaceInStudentId(imageBuffer: Buffer): Promise<FaceDetectionResult> {
  try {
    const faces = await runDetect(imageBuffer, 80);

    if (faces.length === 0) {
      return {
        hasFace: false,
        faceCount: 0,
        confidence: 0,
        reason:
          "No student photo detected on the ID card. Please upload a real university ID card with your photo clearly visible.",
      };
    }

    return { hasFace: true, faceCount: faces.length, confidence: faces[0].Confidence ?? 0 };
  } catch (err: any) {
    console.error("[FaceDetect] Rekognition ID error:", err.message);
    throw new Error(err.message || "Face verification service temporarily unavailable.");
  }
}

// Legacy alias — used by upload controller for student ID validation
export const detectFaceInImage = detectFaceInStudentId;

/**
 * Exported so upload controller can persist the normalised JPEG instead of
 * the raw HEIC/WebP that arrived from the client.
 */
export { toJpegBuffer as normalizeImageBuffer };
