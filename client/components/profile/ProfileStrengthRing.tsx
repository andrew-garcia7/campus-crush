"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";

// ─── Scoring ─────────────────────────────────────────────────────────────────

export type StrengthInput = {
  photoCount: number;
  bioLength: number;
  promptCount: number;
  interestCount: number;
  hasUniversity: boolean;
  isVerified: boolean;
};

export function computeProfileScore(input: StrengthInput): number {
  let score = 0;

  // Photos (max 40)
  if (input.photoCount >= 6) score += 40;
  else if (input.photoCount >= 4) score += 35;
  else if (input.photoCount >= 1) score += 20;

  // Bio (max 15)
  if (input.bioLength > 80) score += 15;
  else if (input.bioLength > 0) score += 8;

  // Prompts (max 20)
  if (input.promptCount >= 2) score += 20;
  else if (input.promptCount === 1) score += 10;

  // Interests (max 15)
  if (input.interestCount >= 5) score += 15;
  else if (input.interestCount > 0) score += 8;

  // Campus / verified (max 10)
  if (input.isVerified || input.hasUniversity) score += 10;

  return Math.min(100, score);
}

// ─── Ring geometry ───────────────────────────────────────────────────────────

const SIZE = 120;
const STROKE = 9;
const R = (SIZE - STROKE * 2) / 2; // 51
const CIRC = 2 * Math.PI * R;      // 320.44

function ringGradient(score: number): [string, string] {
  if (score >= 91) return ["#34d399", "#10b981"]; // emerald
  if (score >= 71) return ["#c084fc", "#e879f9"]; // purple → fuchsia
  if (score >= 41) return ["#fb923c", "#f59e0b"]; // orange → amber
  return ["#f43f5e", "#e11d48"];                   // rose
}

function ringLabel(score: number): string {
  if (score >= 91) return "🔥 Elite Profile";
  if (score >= 71) return "Strong";
  if (score >= 41) return "Good";
  return "Weak";
}

function ringLabelColor(score: number): string {
  if (score >= 91) return "text-emerald-600";
  if (score >= 71) return "text-[#FF2D78]";
  if (score >= 41) return "text-amber-600";
  return "text-rose-500";
}

// ─── Suggestions ─────────────────────────────────────────────────────────────

type Suggestion = { key: string; label: string; done: boolean; section: string };

function getSuggestions(input: StrengthInput): Suggestion[] {
  return [
    {
      key: "photos",
      label: input.photoCount >= 4 ? `${input.photoCount} photos added ✓` : `Add ${Math.max(0, 4 - input.photoCount)} more photos`,
      done: input.photoCount >= 4,
      section: "photos",
    },
    {
      key: "bio",
      label: input.bioLength > 80 ? "Bio looks great ✓" : "Write a bio (80+ chars)",
      done: input.bioLength > 80,
      section: "bio",
    },
    {
      key: "prompts",
      label: input.promptCount >= 2 ? "Prompts filled ✓" : "Add 2 personality prompts",
      done: input.promptCount >= 2,
      section: "prompts",
    },
    {
      key: "interests",
      label: input.interestCount >= 5 ? "5+ interests selected ✓" : "Select 5+ interests",
      done: input.interestCount >= 5,
      section: "interests",
    },
    {
      key: "campus",
      label: input.hasUniversity ? "Campus set ✓" : "Add your university",
      done: input.hasUniversity,
      section: "details",
    },
  ];
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ProfileStrengthRing({
  input,
  onScrollTo,
}: {
  input: StrengthInput;
  onScrollTo?: (section: string) => void;
}) {
  const score = useMemo(() => computeProfileScore(input), [input]);
  const [c1, c2] = ringGradient(score);
  const label = ringLabel(score);
  const labelColor = ringLabelColor(score);
  const suggestions = getSuggestions(input);
  const dashOffset = CIRC * (1 - score / 100);
  const pendingSuggestions = suggestions.filter((s) => !s.done);
  const doneSuggestions = suggestions.filter((s) => s.done);

  return (
    <div className="rounded-3xl border border-pink-100 bg-white p-5 shadow-[0_2px_16px_rgba(255,45,120,0.07)]">
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#9B7065]/70">
        Profile Strength
      </p>

      <div className="flex items-start gap-5">
        {/* SVG Ring */}
        <div className="relative flex-shrink-0">
          <svg width={SIZE} height={SIZE} className="-rotate-90" style={{ filter: `drop-shadow(0 0 10px ${c1}55)` }}>
            <defs>
              <linearGradient id="profile-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={c1} />
                <stop offset="100%" stopColor={c2} />
              </linearGradient>
            </defs>
            {/* Track */}
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              fill="none"
              stroke="rgba(255,45,120,0.12)"
              strokeWidth={STROKE}
            />
            {/* Progress arc */}
            <motion.circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              fill="none"
              stroke="url(#profile-ring-grad)"
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRC}
              initial={{ strokeDashoffset: CIRC }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              key={score}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="text-2xl font-bold tabular-nums text-[#2D1810] leading-none"
            >
              {score}
            </motion.span>
            <span className="text-[10px] text-[#9B7065]/60 mt-0.5">/ 100</span>
          </div>
        </div>

        {/* Label + checklist */}
        <div className="min-w-0 flex-1">
          <p className={`text-base font-bold leading-tight ${labelColor}`}>{label}</p>
          <p className="mt-0.5 mb-3 text-xs text-[#9B7065]">
            {score < 40 ? "Complete your profile to get matches" :
             score < 71 ? "Looking good — add a few more details" :
             score < 91 ? "Almost there — you're almost elite!" :
             "Your profile stands out 🌟"}
          </p>

          <div className="space-y-1.5">
            {pendingSuggestions.slice(0, 3).map((s) => (
              <motion.button
                key={s.key}
                type="button"
                whileHover={{ x: 3 }}
                onClick={() => onScrollTo?.(s.section)}
                className="flex w-full items-center gap-2 text-left group"
              >
                <Circle className="h-3.5 w-3.5 flex-shrink-0 text-pink-300" />
                <span className="text-xs text-[#9B7065] group-hover:text-[#FF2D78] transition-colors">
                  {s.label}
                </span>
              </motion.button>
            ))}
            {doneSuggestions.slice(0, 2).map((s) => (
              <div key={s.key} className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-emerald-500" />
                <span className="text-xs text-emerald-600">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
