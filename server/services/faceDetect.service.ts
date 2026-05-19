import {
  RekognitionClient,
  DetectFacesCommand,
  FaceDetail,
} from "@aws-sdk/client-rekognition";
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

async function runDetect(imageBuffer: Buffer, minConfidence: number): Promise<FaceDetail[]> {
  const result = await buildClient().send(
    new DetectFacesCommand({
      Image: { Bytes: imageBuffer },
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

    if (sharpness < 20) {
      return {
        hasFace: false,
        faceCount: 1,
        confidence: face.Confidence ?? 0,
        reason: "Selfie is too blurry. Please take a clearer photo in good lighting.",
      };
    }

    if (brightness < 15) {
      return {
        hasFace: false,
        faceCount: 1,
        confidence: face.Confidence ?? 0,
        reason: "Selfie is too dark. Please take a photo in better lighting.",
      };
    }

    return { hasFace: true, faceCount: 1, confidence: face.Confidence ?? 0 };
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
