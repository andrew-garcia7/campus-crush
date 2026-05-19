"use client";

import { motion } from "framer-motion";

const HEARTS = [
  { id: 0, x: 14, delay: 0.4, dur: 13, size: 14, color: "#ff4fd8" },
  { id: 1, x: 31, delay: 2.1, dur: 15, size: 16, color: "#ff7bd5" },
  { id: 2, x: 48, delay: 1.2, dur: 14, size: 13, color: "#c084fc" },
  { id: 3, x: 66, delay: 3.6, dur: 16, size: 18, color: "#fb7185" },
  { id: 4, x: 81, delay: 2.8, dur: 13, size: 15, color: "#b026ff" },
  { id: 5, x: 90, delay: 5.1, dur: 15, size: 12, color: "#ff4fd8" },
];

export function LuxuryBackground({
  children,
  imageUrl = "/assets/auth-romance-bg.jpeg",
  heartMode = "default",
  backgroundMotion = "ambient",
}: {
  children: React.ReactNode;
  imageUrl?: string;
  heartMode?: "default" | "subtle";
  backgroundMotion?: "ambient" | "subtle-zoom";
}) {
  const hearts = heartMode === "subtle" ? HEARTS.filter((heart) => heart.id % 2 === 0) : HEARTS;

  return (
    <>
      {/* ── Fixed background layer (never scrolls) ── */}
      <div className="fixed inset-0 z-0 overflow-hidden bg-black" aria-hidden>

      {/* Animated bg image — slow Ken Burns zoom + subtle pan */}
      <motion.div
        className="absolute inset-[-6%] bg-cover bg-[center_75%] bg-no-repeat"
        style={{ backgroundImage: `url(${imageUrl})` }}
        initial={backgroundMotion === "subtle-zoom" ? { scale: 1.02 } : { scale: 1.04 }}
        animate={
          backgroundMotion === "subtle-zoom"
            ? { scale: [1.02, 1.06, 1.02] }
            : {
                scale: [1.04, 1.08, 1.04],
                x: [0, -6, 4, 0],
                y: [0, -4, 3, 0],
              }
        }
        transition={
          backgroundMotion === "subtle-zoom"
            ? {
                duration: 24,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "mirror",
              }
            : {
                duration: 28,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "mirror",
              }
        }
      />

      {/* Layered gradient overlays */}
      {/* strong top vignette masks the tree tops */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/65 via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/38 to-black/72" />
      {/* center brightening spotlight */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_46%,rgba(255,255,255,0.06),transparent_65%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(147,51,234,0.20),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_35%_at_10%_100%,rgba(236,72,153,0.14),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_90%_80%,rgba(168,85,247,0.12),transparent_50%)]" />

      {/* Floating heart particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {hearts.map((h) => (
          <motion.div
            key={h.id}
            className="absolute select-none"
            style={{ left: `${h.x}%`, bottom: -50 }}
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: -820, opacity: heartMode === "subtle" ? [0, 0.24, 0.16, 0] : [0, 0.45, 0.32, 0] }}
            transition={{
              duration: h.dur,
              delay: h.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <svg
              width={h.size}
              height={h.size}
              viewBox="0 0 24 24"
              fill={h.color}
              style={{
                filter:
                  "drop-shadow(0 0 8px rgba(255,79,216,0.45)) drop-shadow(0 0 14px rgba(176,38,255,0.3))",
              }}
            >
              <path d="M12 21s-7.2-4.35-9.6-8.65C.7 9.15 2.1 5.9 5.1 4.8c1.9-.7 4 .05 5.2 1.6 1.2-1.55 3.3-2.3 5.2-1.6 3 1.1 4.4 4.35 2.7 7.55C19.2 16.65 12 21 12 21z" />
            </svg>
          </motion.div>
        ))}
      </div>

      </div>

      {/* ── Scrollable content layer ── */}
      <div className="relative z-10 min-h-screen">{children}</div>
    </>
  );
}
