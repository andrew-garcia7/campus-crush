"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { CampusCrushLogo } from "@/components/ui/campus-crush-logo";

export default function SplashScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<"logo" | "tagline" | "done">("logo");
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    // Phase 1 → show logo
    timerRef.current = setTimeout(() => setPhase("tagline"), 2200);
    return () => clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    if (phase === "tagline") {
      // Phase 2 → show tagline, then navigate
      timerRef.current = setTimeout(() => {
        setPhase("done");
        setTimeout(() => router.push("/"), 600);
      }, 2800);
    }
    return () => clearTimeout(timerRef.current);
  }, [phase, router]);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden">
      {/* ── Dark luxury background ────────────────────────────────────── */}
      <div className="absolute inset-0 bg-[#0e061a]" />
      {/* Radial champagne glow at center */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 48%, rgba(200,120,180,0.18) 0%, rgba(140,80,200,0.10) 45%, transparent 80%)",
        }}
      />
      {/* Soft particle field */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 22 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: i % 3 === 0 ? "#f9bfda" : i % 3 === 1 ? "#d8b4f8" : "#f4e0c4",
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.5, 0.1],
            }}
            transition={{
              duration: 3 + Math.random() * 3,
              delay: Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* ── Main content ─────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {phase !== "done" && (
          <motion.div
            key="splash"
            className="relative flex flex-col items-center gap-0"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.08, y: -20 }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Animated logo – large */}
            <CampusCrushLogo
              size={260}
              showText={false}
              animated
              dark
            />

            {/* Typography block */}
            <motion.div
              className="flex flex-col items-center -mt-3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <span
                style={{
                  fontFamily: "'Great Vibes','Dancing Script','Pinyon Script',cursive",
                  fontSize: 64,
                  lineHeight: 1.1,
                  background: "linear-gradient(135deg,#c9747e 0%,#f4a3c4 45%,#b884c0 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  letterSpacing: "0.02em",
                  textShadow: "none",
                }}
              >
                Campus
              </span>
              <span
                style={{
                  fontFamily: "'Inter','Poppins',sans-serif",
                  fontSize: 22,
                  fontWeight: 300,
                  letterSpacing: "0.38em",
                  textTransform: "uppercase",
                  color: "#c8a4d8",
                  marginTop: -6,
                }}
              >
                Crush
              </span>
            </motion.div>

            {/* Tagline – revealed in phase 2 */}
            <AnimatePresence>
              {phase === "tagline" && (
                <motion.p
                  key="tagline"
                  className="mt-6 text-center"
                  style={{
                    fontFamily: "'Great Vibes','Dancing Script',cursive",
                    fontSize: 22,
                    color: "#d8a4c0",
                    letterSpacing: "0.05em",
                    opacity: 0,
                  }}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                >
                  Where campus hearts connect
                </motion.p>
              )}
            </AnimatePresence>

            {/* Thin gold/champagne divider */}
            <motion.div
              className="mt-5 rounded-full"
              style={{ height: 1, background: "linear-gradient(90deg, transparent, #c9a4c0, transparent)" }}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 140, opacity: 0.5 }}
              transition={{ delay: 0.9, duration: 1.1, ease: "easeOut" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
