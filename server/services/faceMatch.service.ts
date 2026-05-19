import {
  RekognitionClient,
  CompareFacesCommand,
} from "@aws-sdk/client-rekognition";
import { env } from "../config/env";

const MATCH_THRESHOLD = 85;

export interface FaceMatchResult {
  matched: boolean;
  similarity: number;
  reason?: string;
}

function buildClient(): RekognitionClient {
  if (!env.AWS_ACCESS_KEY || !env.AWS_SECRET_KEY) {
    throw new Error("AWS Rekognition is not configured.");
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
 * Compare a selfie against the face on a student ID card.
 * Returns matched=true only when similarity >= MATCH_THRESHOLD (85%).
 */
export async function compareFaces(
  selfieBuffer: Buffer,
  studentIdBuffer: Buffer
): Promise<FaceMatchResult> {
  try {
    const result = await buildClient().send(
      new CompareFacesCommand({
        SourceImage: { Bytes: selfieBuffer },
        TargetImage: { Bytes: studentIdBuffer },
        SimilarityThreshold: MATCH_THRESHOLD,
      })
    );

    const matches = result.FaceMatches ?? [];

    if (matches.length === 0) {
      return {
        matched: false,
        similarity: 0,
        reason:
          "Your selfie does not match the face on your student ID card. Please re-upload matching photos.",
      };
    }

    const similarity = matches[0].Similarity ?? 0;

    if (similarity < MATCH_THRESHOLD) {
      return {
        matched: false,
        similarity,
        reason: `Face similarity too low (${similarity.toFixed(0)}%). Your selfie must clearly match your student ID photo.`,
      };
    }

    return { matched: true, similarity };
  } catch (err: any) {
    if (err.name === "InvalidParameterException") {
      return {
        matched: false,
        similarity: 0,
        reason:
          "Could not detect a face in one of the uploaded images. Please re-upload clearer photos.",
      };
    }
    console.error("[FaceMatch] Rekognition error:", err.message);
    throw new Error(err.message || "Face comparison service temporarily unavailable.");
  }
}