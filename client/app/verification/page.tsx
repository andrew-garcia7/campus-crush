"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  ShieldCheck,
  Camera,
  CheckCircle2,
  Sparkles,
  Upload,
  ArrowRight,
  RefreshCw,
  Heart,
  Eye,
  Loader2,
} from "lucide-react";

import { api } from "@/services/api";
import { useAuthStore } from "@/store/auth-store";
import { getUserIdFromToken } from "@/lib/auth";
import { useToastStore } from "@/store/toast-store";
import { LuxuryBackground } from "@/components/auth/luxury-background";

function OtpBoxes({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const length = 6;
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.split("").concat(Array(length).fill("")).slice(0, length);

  const setDigit = (index: number, char: string) => {
    const next = digits
      .map((digit, currentIndex) => (currentIndex === index ? char : digit))
      .join("")
      .replace(/ /g, "");

    onChange(next);

    if (char && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-2.5">
      {digits.map((digit, index) => (
        <motion.input
          key={index}
          ref={(element) => {
            refs.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.07, type: "spring", stiffness: 300 }}
          onChange={(event) => setDigit(index, event.target.value.replace(/\D/g, "").slice(-1))}
          onKeyDown={(event) => {
            if (event.key === "Backspace") {
              onChange(value.slice(0, index) + value.slice(index + 1));
              if (index > 0) {
                refs.current[index - 1]?.focus();
              }
            }
          }}
          onFocus={(event) => event.target.select()}
          className={`h-14 w-11 rounded-2xl border-2 text-center text-xl font-bold text-white outline-none transition-all duration-200
            ${digit
              ? "border-[#FF2D78] bg-[#FF2D78]/20 shadow-[0_0_12px_rgba(255,45,120,0.4)]"
              : "border-white/25 bg-white/[0.07] focus:border-[#FF2D78] focus:bg-white/[0.12] focus:shadow-[0_0_8px_rgba(255,45,120,0.3)]"}`}
        />
      ))}
    </div>
  );
}

function UploadCard({
  label,
  sublabel,
  accept,
  uploading,
  uploaded,
  previewUrl,
  onFile,
}: {
  label: string;
  sublabel: string;
  accept: string;
  uploading: boolean;
  uploaded: boolean;
  previewUrl?: string;
  onFile: (file: File) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <motion.div
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        const file = event.dataTransfer.files[0];
        if (file) {
          onFile(file);
        }
      }}
      onClick={() => !uploading && !uploaded && inputRef.current?.click()}
      whileHover={!uploaded && !uploading ? { scale: 1.01 } : {}}
      className={`relative cursor-pointer rounded-3xl border-2 border-dashed p-8 text-center transition-all duration-300
        ${uploaded
          ? "border-emerald-400/50 bg-emerald-500/10"
          : dragging
            ? "border-[#FF2D78] bg-[#FF2D78]/15 shadow-[0_0_20px_rgba(255,45,120,0.2)]"
            : "border-white/20 bg-white/[0.05] hover:border-[#FF2D78]/50 hover:bg-white/[0.09]"}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            onFile(file);
          }
        }}
      />

      <AnimatePresence mode="wait">
        {uploading ? (
          <motion.div
            key="uploading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3"
          >
            <Loader2 className="h-10 w-10 animate-spin text-[#FF2D78]" />
            <p className="text-sm font-medium text-white/60">Uploading...</p>
          </motion.div>
        ) : uploaded ? (
          <motion.div
            key="uploaded"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/40 bg-emerald-500/10">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
            <p className="text-sm font-semibold text-emerald-400">Uploaded successfully!</p>
            {previewUrl && (
              <img
                src={previewUrl}
                alt="preview"
                className="mt-1 h-24 w-auto rounded-2xl border border-emerald-200 object-cover"
              />
            )}
          </motion.div>
        ) : (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/[0.07]">
              <Upload className="h-6 w-6 text-[#FF2D78]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{label}</p>
              <p className="mt-0.5 text-xs text-white/50">{sublabel}</p>
            </div>
            <span className="rounded-full border border-white/20 bg-white/[0.07] px-3 py-1 text-xs text-[#FF2D78]">
              Click or drag &amp; drop
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const steps = [
  { icon: Mail, label: "Email OTP", desc: "Verify your college email" },
  { icon: ShieldCheck, label: "Student ID", desc: "Upload your student ID card" },
  { icon: Camera, label: "Selfie", desc: "Quick face verification" },
  { icon: CheckCircle2, label: "Complete", desc: "You're all set!" },
];

export default function VerificationPage() {
  const router = useRouter();
  const hydrated = useAuthStore((state) => state.hydrated);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const toast = useToastStore((state) => state.push);

  const userId = getUserIdFromToken(token) || user?._id || user?.id || "";

  const [step, setStep] = useState(0);
  const [email, setEmail] = useState(user?.email || "");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [studentIdUrl, setStudentIdUrl] = useState("");
  const [selfieUrl, setSelfieUrl] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [uploadingId, setUploadingId] = useState(false);
  const [uploadingSelfie, setUploadingSelfie] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [cameraOn, setCameraOn] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // Prevents React Strict Mode double-getUserMedia race — see camera useEffect below
  const cameraInitLockRef = useRef(false);

  /**
   * Callback ref for the <video> element.
   * Framer Motion animates height: 0 → "auto" by measuring the element at mount time.
   * Before a stream is attached the video has 0px intrinsic height, so Framer Motion
   * measures 0 and animates 0→0 (video stays invisible).
   * Using a callback ref means we also assign srcObject the instant the element
   * appears in the DOM, even if getUserMedia has already resolved.
   */
  const setVideoRef = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node && streamRef.current) {
      console.log("[Camera] video element mounted after stream ready — assigning srcObject");
      node.srcObject = streamRef.current;
      node.play().catch((e) => console.warn("[Camera] autoplay blocked:", e));
    }
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (!token) {
      router.replace("/login");
      return;
    }

    const currentUser = useAuthStore.getState().user;
    if (currentUser?.verificationStatus === "verified") {
      router.replace("/discover");
    }
  }, [hydrated, token, router]);

  useEffect(() => {
    // ── Stream teardown ───────────────────────────────────────────────────
    const stopStream = () => {
      if (streamRef.current) {
        console.log("STREAM_STOPPED");
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };

    if (!cameraOn) {
      stopStream();
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      toast({
        title: "Camera not supported",
        message: "Camera requires a secure (HTTPS) connection or localhost.",
        variant: "error",
      });
      setCameraOn(false);
      return;
    }

    // ── Dual guard against React Strict Mode double-invocation ───────────
    //
    // React <StrictMode> runs every effect TWICE in development:
    //   effect-1 → cleanup-1 → effect-2
    //
    // Layer 1 — setTimeout(150 ms):
    //   cleanup-1 calls clearTimeout, cancelling Layer-1's pending timer before
    //   it fires. Only effect-2's timer fires (once, cleanly).
    //
    // Layer 2 — cameraInitLockRef boolean:
    //   If both timers somehow fire at the same time (e.g. tab suspended/resumed
    //   causing cleanup to arrive late), the boolean lock ensures only one
    //   getUserMedia call is active at any time. The lock is acquired before
    //   getUserMedia, released unconditionally in the finally block, and also
    //   cleared in the cleanup function so the next mount starts clean.
    //
    // The two layers are independent — either one alone would usually suffice,
    // but both together give a hard guarantee.
    // ─────────────────────────────────────────────────────────────────────
    const timerId = setTimeout(async () => {
      // Layer 2: acquire init lock
      if (cameraInitLockRef.current) {
        console.log("CAMERA_INIT_SKIPPED — lock held by another invocation");
        return;
      }
      cameraInitLockRef.current = true;

      console.log("CAMERA_START");

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        });

        // If cleanup fired while getUserMedia was in flight, discard the
        // stream and do nothing — the OS will release the hardware lock.
        if (!cameraInitLockRef.current) {
          console.log("CAMERA_START — cleanup fired mid-await; discarding obtained stream");
          stream.getTracks().forEach((t) => t.stop());
          console.log("STREAM_STOPPED");
          return;
        }

        console.log(
          "STREAM_OBTAINED",
          stream.getTracks().map((t) => `${t.kind}:${t.label}`).join(", "),
        );
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current
            .play()
            .then(() => console.log("VIDEO_PLAY_STARTED"))
            .catch((e) => console.warn("AUTOPLAY_BLOCKED", e));
        } else {
          // setVideoRef callback ref will assign srcObject when element mounts
          console.log("VIDEO_ELEMENT_NOT_MOUNTED_YET — callback ref will assign srcObject");
        }
      } catch (err: any) {
        console.error("CAMERA_ERROR_NAME", err.name);
        console.error("CAMERA_ERROR_MESSAGE", err.message);

        stopStream();

        let message = "Could not access camera.";
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          message = "Camera permission denied. Allow it in browser/OS settings and try again.";
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          message = "No camera found on this device.";
        } else if (
          err.name === "NotReadableError" ||
          err.name === "TrackStartError" ||
          err.name === "AbortError"
        ) {
          message = "Camera is temporarily unavailable. Refresh the page and try again.";
        } else if (err.name === "OverconstrainedError") {
          message = "Camera does not support the required resolution. Try another browser.";
        } else if (err.name === "SecurityError") {
          message = "Camera requires a secure (HTTPS) connection.";
        }
        toast({ title: "Camera error", message, variant: "error" });
        setCameraOn(false);
      } finally {
        // Always release the lock so the next mount / toggle can proceed
        cameraInitLockRef.current = false;
      }
    }, 150);

    return () => {
      clearTimeout(timerId);           // Layer 1: cancel pending getUserMedia before it fires
      cameraInitLockRef.current = false; // Layer 2: release lock so next mount starts clean
      stopStream();
    };
  }, [cameraOn, toast]);

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }

    const timer = setTimeout(() => setCountdown((current) => current - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  /**
   * Re-encode any image format to JPEG using a canvas.
   * Handles WebP from Android/Chrome, HEIC from iOS (Safari converts HEIC→JPEG
   * transparently when loading into an <img>, so this also catches edge cases).
   * Skips re-encoding if the file is already JPEG to avoid quality loss.
   */
  const toJpegFile = (file: File): Promise<File> => {
    if (file.type === "image/jpeg" || file.type === "image/jpg") {
      return Promise.resolve(file);
    }
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext("2d")!.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (!blob) { reject(new Error("Canvas toBlob returned null")); return; }
            resolve(new File([blob], "selfie.jpg", { type: "image/jpeg" }));
          },
          "image/jpeg",
          0.92,
        );
      };
      img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error("Could not load image")); };
      img.src = objectUrl;
    });
  };

  const uploadFile = async (file: File, type: "student-id" | "selfie") => {
    const formData = new FormData();
    formData.append(type === "student-id" ? "studentId" : "selfie", file);
    const response = await api.post(`/uploads/${type}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data?.data?.publicUrl as string;
  };

  const absoluteUploadUrl = (url: string) => {
    if (!url) {
      return "";
    }

    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000").replace("/api/v1", "");
    return url.startsWith("http") ? url : `${base}${url}`;
  };

  const handleSendOtp = async () => {
    if (!email.trim()) {
      toast({ title: "Enter your email first", variant: "error" });
      return;
    }

    try {
      setSendingOtp(true);
      await api.post("/verification/email-otp/send", { email });
      setOtpSent(true);
      setOtp("");
      setCountdown(45);
      toast({ title: "OTP sent!", message: `Check ${email}`, variant: "success" });
    } catch {
      toast({ title: "Failed to send OTP", variant: "error" });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) {
      toast({ title: "Enter the full 6-digit OTP", variant: "error" });
      return;
    }

    try {
      setVerifyingOtp(true);
      await api.post("/verification/email-otp/verify", { email, otp });
      toast({ title: "Email verified!", variant: "success" });
      setStep(1);
    } catch {
      toast({ title: "Invalid OTP", message: "Check the code and try again", variant: "error" });
    } finally {
      setVerifyingOtp(false);
    }
  };

  const captureSelfie = async () => {
    const video = videoRef.current;
    // readyState >= 2 (HAVE_CURRENT_DATA) ensures at least one frame is decoded
    if (!video || video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      toast({ title: "Camera not ready", message: "Wait for the camera preview to load, then try again.", variant: "error" });
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
    if (!blob) {
      toast({ title: "Capture failed", message: "Could not capture from camera. Please try again.", variant: "error" });
      return;
    }

    try {
      setUploadingSelfie(true);
      const url = await uploadFile(new File([blob], "selfie.jpg", { type: "image/jpeg" }), "selfie");
      setSelfieUrl(url);
      toast({ title: "Selfie captured!", variant: "success" });
      setCameraOn(false);
      setTimeout(() => setStep(3), 700);
    } catch (error: any) {
      const message = error?.response?.data?.message ?? "No face detected. Please upload a clear selfie.";
      toast({ title: message, variant: "error" });
    } finally {
      setUploadingSelfie(false);
    }
  };

  const completeVerification = async () => {
    try {
      setCompleting(true);
      setSubmitError("");
      const response = await api.post("/verification/submit", { userId, studentIdUrl, selfieUrl });
      const updatedUser = response.data?.user || response.data?.data?.user;
      if (updatedUser) {
        setUser(updatedUser);
      }
      setSubmitted(true);
      toast({ title: "You're verified!", message: "Welcome to Campus Crush!", variant: "success" });

      setTimeout(() => {
        router.replace("/discover");
      }, 1200);
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Verification failed. Please try again.";
      setSubmitError(msg);
      toast({ title: "Verification failed", message: msg, variant: "error" });
    } finally {
      setCompleting(false);
    }
  };

  return (
    <LuxuryBackground>
      <div className="mx-auto max-w-sm px-4 pb-20 pt-10">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center justify-center gap-2">
          <Heart className="h-5 w-5 fill-[#FF2D78] text-[#FF2D78]" />
          <span className="text-base font-bold tracking-tight text-white">
            Campus Crush <span className="text-[#FF2D78]">AI</span>
          </span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8 flex items-center justify-between">
          {steps.map((stepItem, index) => {
            const Icon = stepItem.icon;
            const done = step > index;
            const active = step === index;

            return (
              <div key={stepItem.label} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <motion.div
                    animate={active ? { boxShadow: ["0 0 0px rgba(255,45,120,0)", "0 0 18px rgba(255,45,120,0.6)", "0 0 0px rgba(255,45,120,0)"] } : {}}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-500
                      ${done
                        ? "border-emerald-400 bg-emerald-500/20"
                        : active
                          ? "border-[#FF2D78] bg-[#FF2D78]/15"
                          : "border-white/20 bg-white/[0.07]"}`}
                  >
                    {done ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <Icon className={`h-5 w-5 ${active ? "text-[#FF2D78]" : "text-white/40"}`} />
                    )}
                  </motion.div>
                  <span className={`text-[10px] font-medium leading-tight text-center ${active ? "text-[#FF2D78]" : done ? "text-emerald-400" : "text-white/40"}`}>
                    {stepItem.label}
                  </span>
                </div>

                {index < steps.length - 1 && (
                  <div className="relative mx-1 mb-5 h-[2px] flex-1">
                    <div className="absolute inset-0 rounded-full bg-white/15" />
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-400 to-[#FF2D78]"
                      animate={{ width: done ? "100%" : "0%" }}
                      transition={{ duration: 0.7 }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="email-otp"
              initial={{ opacity: 0, y: 28, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-3xl border border-white/20 bg-white/10 backdrop-blur-2xl p-7 shadow-[0_16px_48px_rgba(0,0,0,0.45)]"
            >
              <div className="mb-6 text-center">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.08] border border-white/20"
                >
                  <Mail className="h-8 w-8 text-[#FF2D78]" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white">Verify your email</h2>
                <p className="mt-1.5 text-sm text-white/60">We&apos;ll send a 6-digit code to your college email</p>
              </div>

              <div className="mb-5">
                <label className="mb-1.5 block text-xs font-medium text-white/50">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                  <input
                    type="email"
                    value={email}
                    placeholder="you@college.edu"
                    onChange={(event) => setEmail(event.target.value)}
                    onKeyDown={(event) => event.key === "Enter" && !otpSent && handleSendOtp()}
                    className="w-full rounded-2xl border border-white/20 bg-white/[0.08] py-4 pl-11 pr-4 text-sm text-white placeholder:text-white/35 outline-none transition-all focus:border-[#FF2D78] focus:bg-white/[0.12]"
                  />
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSendOtp}
                disabled={sendingOtp || !email.trim()}
                className="mb-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FF2D78] py-4 text-sm font-bold text-white shadow-[0_4px_18px_rgba(255,45,120,0.42)] transition-all hover:bg-[#e0195f] disabled:cursor-not-allowed disabled:opacity-55"
              >
                {sendingOtp ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> {otpSent ? "Resend OTP" : "Send OTP"}
                  </>
                )}
              </motion.button>

              <AnimatePresence>
                {otpSent && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: 10 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="mb-4 text-center text-xs text-white/50">
                      Enter the 6-digit code sent to <span className="font-semibold text-[#FF2D78]">{email}</span>
                    </p>

                    <OtpBoxes value={otp} onChange={setOtp} />

                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleVerifyOtp}
                      disabled={verifyingOtp || otp.length < 6}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FF2D78] py-4 text-sm font-bold text-white shadow-[0_4px_18px_rgba(255,45,120,0.42)] transition-all hover:bg-[#e0195f] disabled:opacity-55"
                    >
                      {verifyingOtp ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-4 w-4" /> Verify OTP <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </motion.button>

                    <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-white/50">
                      {countdown > 0 ? (
                        <>
                          <RefreshCw className="h-3 w-3" /> Resend in {countdown}s
                        </>
                      ) : (
                        <button onClick={() => { setOtp(""); handleSendOtp(); }} className="flex items-center gap-1 text-[#FF2D78] transition-colors hover:text-[#e0195f]">
                          <RefreshCw className="h-3 w-3" /> Resend OTP
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="student-id"
              initial={{ opacity: 0, y: 28, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-3xl border border-white/20 bg-white/10 backdrop-blur-2xl p-7 shadow-[0_16px_48px_rgba(0,0,0,0.45)]"
            >
              <div className="mb-6 text-center">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.08] border border-white/20"
                >
                  <ShieldCheck className="h-8 w-8 text-[#FF2D78]" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white">Student ID</h2>
                <p className="mt-1.5 text-sm text-white/60">Upload a clear photo of your student ID card</p>
              </div>

              <UploadCard
                label="Upload Student ID"
                sublabel="JPG, PNG - Max 10 MB"
                accept="image/*"
                uploading={uploadingId}
                uploaded={!!studentIdUrl}
                previewUrl={studentIdUrl ? absoluteUploadUrl(studentIdUrl) : undefined}
                onFile={async (file) => {
                  try {
                    setUploadingId(true);
                    const url = await uploadFile(file, "student-id");
                    setStudentIdUrl(url);
                    toast({ title: "Student ID verified!", variant: "success" });
                    setTimeout(() => setStep(2), 700);
                  } catch (error: any) {
                    const message = error?.response?.data?.message ?? "Invalid student ID. Please upload a real university ID card.";
                    toast({ title: message, variant: "error" });
                  } finally {
                    setUploadingId(false);
                  }
                }}
              />

              {studentIdUrl && (
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setStep(2)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FF2D78] py-4 text-sm font-bold text-white shadow-[0_4px_18px_rgba(255,45,120,0.42)]"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </motion.button>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="selfie"
              initial={{ opacity: 0, y: 28, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-3xl border border-white/20 bg-white/10 backdrop-blur-2xl p-7 shadow-[0_16px_48px_rgba(0,0,0,0.45)]"
            >
              <div className="mb-6 text-center">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.08] border border-white/20"
                >
                  <Camera className="h-8 w-8 text-[#FF2D78]" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white">Selfie Verification</h2>
                <p className="mt-1.5 text-sm text-white/60">Take a selfie or upload one. Make sure your face is clearly visible.</p>
              </div>

              <AnimatePresence>
                {cameraOn && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-4 overflow-hidden rounded-2xl">
                    {/* aspect-[4/3] gives the container a defined height before the stream
                        loads — without it Framer Motion measures 0px and animates 0→0,
                        keeping the video permanently invisible (overflow-hidden + height 0). */}
                    <div className="relative aspect-[4/3] w-full bg-black/40 rounded-2xl">
                      <video ref={setVideoRef} autoPlay playsInline muted className="absolute inset-0 h-full w-full rounded-2xl object-cover" />
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div className="h-52 w-40 rounded-[50%] border-2 border-dashed border-[#FF2D78]/60" />
                      </div>
                      <p className="absolute bottom-12 left-0 right-0 text-center text-[11px] text-[#FF2D78]/70">Align your face inside the oval</p>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={captureSelfie}
                        disabled={uploadingSelfie}
                        className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#FF2D78] px-7 py-2.5 text-sm font-bold text-white shadow-[0_4px_18px_rgba(255,45,120,0.42)]"
                      >
                        {uploadingSelfie ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                        {uploadingSelfie ? "Uploading..." : "Capture"}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!selfieUrl && (
                <>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setCameraOn(!cameraOn)}
                    className="mb-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/[0.07] py-4 text-sm font-semibold text-[#FF2D78] transition-all hover:bg-white/[0.12]"
                  >
                    <Camera className="h-4 w-4" />
                    {cameraOn ? "Close Camera" : "Open Camera"}
                  </motion.button>

                  <div className="mb-3 flex items-center gap-3">
                    <div className="h-px flex-1 bg-white/20" />
                    <span className="text-[11px] text-white/40">OR</span>
                    <div className="h-px flex-1 bg-white/20" />
                  </div>

                  <UploadCard
                    label="Upload Selfie"
                    sublabel="Make sure your face is clearly visible"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif"
                    uploading={uploadingSelfie}
                    uploaded={!!selfieUrl}
                    onFile={async (rawFile) => {
                      try {
                        setUploadingSelfie(true);
                        // Re-encode any format (HEIC, WebP, PNG) to JPEG before upload
                        // so Rekognition always receives a supported image format.
                        const jpegFile = await toJpegFile(rawFile);
                        const url = await uploadFile(jpegFile, "selfie");
                        setSelfieUrl(url);
                        toast({ title: "Selfie verified!", variant: "success" });
                        setTimeout(() => setStep(3), 700);
                      } catch (error: any) {
                        const message = error?.response?.data?.message ?? "No face detected. Please upload a clear selfie.";
                        toast({ title: message, variant: "error" });
                      } finally {
                        setUploadingSelfie(false);
                      }
                    }}
                  />
                </>
              )}

              {selfieUrl && (
                <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 260 }} className="flex flex-col items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-500/10">
                    <CheckCircle2 className="h-9 w-9 text-emerald-400" />
                  </div>
                  <p className="text-sm font-semibold text-emerald-400">Selfie ready!</p>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep(3)} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FF2D78] py-4 text-sm font-bold text-white shadow-[0_4px_18px_rgba(255,45,120,0.42)]">
                    Continue <ArrowRight className="h-4 w-4" />
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.88 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
              className="rounded-3xl border border-white/20 bg-white/10 backdrop-blur-2xl p-8 text-center shadow-[0_16px_48px_rgba(0,0,0,0.45)]"
            >
              <div className="relative mx-auto mb-6 h-20 w-20">
                <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }} transition={{ duration: 2.2, repeat: Infinity }} className="absolute inset-0 rounded-full bg-pink-200" />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.15 }}
                  className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[#FF2D78] shadow-[0_4px_24px_rgba(255,45,120,0.5)]"
                >
                  <Heart className="h-10 w-10 fill-white text-white" />
                </motion.div>
              </div>

              <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mb-2 text-2xl font-bold text-[#2D1810]">
                You&apos;re all set!
              </motion.h2>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mb-7 text-sm text-[#9B7065]">
                All documents uploaded. We&apos;ll match your selfie with your ID and verify your account now.
              </motion.p>

              {submitError && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-center text-sm text-red-300"
                >
                  <p className="font-semibold">&#x26A0; {submitError}</p>
                <button
                    onClick={() => { setStudentIdUrl(""); setSelfieUrl(""); setSubmitError(""); setStep(1); }}
                    className="mt-2 text-xs text-[#FF2D78] underline underline-offset-2"
                  >
                    Re-upload photos and try again
                  </button>
                </motion.div>
              )}

              {!submitted && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={completeVerification}
                  disabled={completing || !userId || !studentIdUrl || !selfieUrl}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FF2D78] py-4 text-base font-bold text-white shadow-[0_4px_18px_rgba(255,45,120,0.42)] transition-all hover:bg-[#e0195f] disabled:opacity-55"
                >
                  {completing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" /> Verifying...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" /> Enter Campus Crush
                    </>
                  )}
                </motion.button>
              )}

              {submitted && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 py-3 text-sm font-semibold text-emerald-300">
                  <CheckCircle2 className="h-5 w-5" /> Under review. We&apos;ll notify you soon.
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-6 flex items-center justify-center gap-6 text-[11px] text-white/50">
          <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Encrypted</span>
          <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> Private</span>
          <span className="flex items-center gap-1"><Sparkles className="h-3 w-3" /> Trusted</span>
        </motion.div>
      </div>
    </LuxuryBackground>
  );
}
