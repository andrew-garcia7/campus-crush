import Tesseract from "tesseract.js";

// ─── College / university keywords ─────────────────────────────────────────
// A real student ID will almost always contain at least one of these.
const COLLEGE_KEYWORDS = [
  // Generic
  "university", "college", "institute", "school", "faculty", "campus",
  "student", "registration", "reg no", "roll no", "roll number",
  "enrollment", "enrolment", "id card", "identity", "admit",
  "department", "dept", "batch", "semester", "session", "course",
  "programme", "program", "academic",
  // Indian universities / abbreviations
  "lpu", "lovely professional",
  "vit", "vellore",
  "manipal",
  "amity",
  "iit", "nit", "bits", "srm", "kiit", "jnu", "bhu",
  "du", "delhi university",
  "symbiosis", "anna university", "pune university",
  "mumbai university", "bangalore university",
  "hyderabad university", "chandigarh", "punjab",
  // Degree / stream markers often printed on IDs
  "b.tech", "btech", "b.e", "m.tech", "mtech", "mca", "bca",
  "b.sc", "m.sc", "mba", "b.com", "b.a", "ph.d", "phd",
  "engineering", "technology", "science", "management", "arts",
  "medical", "pharmacy", "law",
];

// Pattern for student / registration numbers  (e.g. 12205XXXX, MCA23XXX, REG20XXX)
const ID_NUMBER_PATTERN = /\b[A-Z0-9]{6,20}\b/i;

// ─── Types ──────────────────────────────────────────────────────────────────
export interface OcrValidationResult {
  valid: boolean;
  text: string;
  confidence: number;
  reason?: string;
}

// ─── Main export ────────────────────────────────────────────────────────────
export const validateStudentId = async (
  imageBuffer: Buffer
): Promise<OcrValidationResult> => {
  let text = "";
  let confidence = 0;

  // ── Run Tesseract OCR ──
  try {
    const base64 = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;
    const { data } = await Tesseract.recognize(base64, "eng", {
      logger: () => {}, // silence progress
    });
    text = data.text ?? "";
    confidence = data.confidence ?? 0;
  } catch (err) {
    console.error("[OCR] Tesseract failed:", err);
    return {
      valid: false,
      text: "",
      confidence: 0,
      reason: "Could not read the image. Please upload a clearer photo.",
    };
  }

  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  // ── Rule 1: minimum readable text (blurry / blank images produce almost nothing) ──
  if (trimmed.length < 15) {
    return {
      valid: false,
      text,
      confidence,
      reason:
        "No readable text found. Please upload a clear, well-lit photo of your student ID card.",
    };
  }

  // ── Rule 2: very low OCR confidence on short text ──
  if (confidence < 25 && trimmed.length < 60) {
    return {
      valid: false,
      text,
      confidence,
      reason:
        "Image is too blurry or low resolution. Please upload a sharper photo.",
    };
  }

  // ── Rule 3: must contain a college/university keyword ──
  const hasCollegeKeyword = COLLEGE_KEYWORDS.some((kw) => lower.includes(kw));
  if (!hasCollegeKeyword) {
    return {
      valid: false,
      text,
      confidence,
      reason:
        "Invalid student ID. Please upload a real university or college ID card.",
    };
  }

  // ── Rule 4: must contain a plausible ID / reg number ──
  if (!ID_NUMBER_PATTERN.test(trimmed)) {
    return {
      valid: false,
      text,
      confidence,
      reason:
        "No student ID number detected. Please upload a real university ID card.",
    };
  }

  return { valid: true, text, confidence };
};
