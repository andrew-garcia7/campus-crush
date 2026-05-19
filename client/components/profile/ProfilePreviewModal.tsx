"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, BadgeCheck, Crown, MapPin, GraduationCap,
  Music, Instagram, CalendarDays,
} from "lucide-react";
import { getProfileImage } from "@/lib/media";
import { computeProfileScore, type StrengthInput } from "./ProfileStrengthRing";

type PromptCard = { question: string; answer: string };

type ProfilePreviewModalProps = {
  open: boolean;
  onClose: () => void;
  user: {
    fullName?: string;
    email?: string;
    age?: number;
    gender?: string;
    university?: string;
    department?: string;
    city?: string;
    bio?: string;
    interests?: string[];
    prompts?: PromptCard[];
    photos?: string[];
    photoCaptions?: string[];
    verificationStatus?: string;
    height?: string;
    relationshipGoals?: string;
    graduationYear?: string | number;
    spotifyUrl?: string;
    instagramUrl?: string;
  } | null;
  strengthInput: StrengthInput;
  isPremium?: boolean;
};

const RING = 88;
const STROKE = 7;
const R = (RING - STROKE * 2) / 2;
const CIRC = 2 * Math.PI * R;

function MiniRing({ score }: { score: number }) {
  const dash  = (score / 100) * CIRC;
  const color = score >= 71 ? "#d946ef" : score >= 41 ? "#f59e0b" : "#f43f5e";
  return (
    <svg width={RING} height={RING} className="-rotate-90">
      <circle cx={RING / 2} cy={RING / 2} r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={STROKE} />
      <motion.circle
        cx={RING / 2} cy={RING / 2} r={R} fill="none"
        stroke={color} strokeWidth={STROKE} strokeLinecap="round"
        strokeDasharray={CIRC}
        initial={{ strokeDashoffset: CIRC }}
        animate={{ strokeDashoffset: CIRC - dash }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
      />
    </svg>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-purple-400/50">
      {children}
    </p>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-purple-300/15 p-4 text-center">
      <p className="text-xs text-purple-400/35">{children}</p>
    </div>
  );
}

const GOAL_ICONS: Record<string, string> = {
  "Serious relationship": "💍",
  "Casual dating": "☕",
  "Friends first": "🤝",
  "Still figuring it out": "🌀",
};

export function ProfilePreviewModal({ open, onClose, user, strengthInput, isPremium }: ProfilePreviewModalProps) {
  const score       = computeProfileScore(strengthInput);
  const displayName = user?.fullName || user?.email?.split("@")[0] || "Your Profile";
  const allPhotos   = (user?.photos ?? []).filter(Boolean);
  const heroPhoto   = allPhotos[0]
    ? getProfileImage(allPhotos[0], displayName)
    : getProfileImage("", displayName);
  const extraPhotos = allPhotos.slice(1);
  const isVerified  = user?.verificationStatus === "verified";

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: "rgba(7,1,26,0.88)", backdropFilter: "blur(18px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 32 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="relative w-full max-w-sm overflow-hidden rounded-[36px] border border-fuchsia-300/20 bg-[#0f0620] shadow-[0_0_80px_rgba(196,70,255,0.35)]"
            style={{ maxHeight: "90vh", overflowY: "auto" }}
          >
            {/* ── Close ────────────────────────────────────────────── */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 backdrop-blur-sm transition hover:bg-white/20 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            {/* ── Hero photo ───────────────────────────────────────── */}
            <div className="relative h-80 w-full overflow-hidden">
              <img src={heroPhoto} alt={displayName} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f0620] via-[#0f0620]/20 to-transparent" />
              <div className="absolute left-4 top-4 flex gap-2">
                {isVerified && (
                  <div className="flex items-center gap-1 rounded-full border border-sky-400/40 bg-sky-500/20 px-2.5 py-1 backdrop-blur-sm">
                    <BadgeCheck className="h-3.5 w-3.5 text-sky-400" fill="#38bdf8" />
                    <span className="text-[11px] font-semibold text-sky-200">Verified</span>
                  </div>
                )}
                {isPremium && (
                  <div className="flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-500/20 px-2.5 py-1 backdrop-blur-sm">
                    <Crown className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-[11px] font-semibold text-amber-200">Premium</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Content ──────────────────────────────────────────── */}
            <div className="space-y-5 p-5 pb-8">

              {/* Name + meta */}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-bold text-white">{displayName}</h2>
                  {user?.age && (
                    <span className="text-2xl font-light text-purple-300/70">{user.age}</span>
                  )}
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-purple-300/60">
                  {user?.gender && <span className="capitalize">{user.gender}</span>}
                  {user?.university && (
                    <span className="flex items-center gap-1">
                      <GraduationCap className="h-3.5 w-3.5" />
                      {user.university}
                    </span>
                  )}
                  {user?.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {user.city}
                    </span>
                  )}
                </div>
                {/* Detail pills */}
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {user?.height && (
                    <span className="rounded-full border border-purple-300/15 bg-white/[0.04] px-2.5 py-1 text-xs text-purple-200/70">
                      📏 {user.height}
                    </span>
                  )}
                  {user?.relationshipGoals && (
                    <span className="rounded-full border border-purple-300/15 bg-white/[0.04] px-2.5 py-1 text-xs text-purple-200/70">
                      {GOAL_ICONS[user.relationshipGoals] || "✨"} {user.relationshipGoals}
                    </span>
                  )}
                  {user?.department && (
                    <span className="rounded-full border border-purple-300/15 bg-white/[0.04] px-2.5 py-1 text-xs text-purple-200/70">
                      🎓 {user.department}
                    </span>
                  )}
                  {user?.graduationYear && (
                    <span className="flex items-center gap-1 rounded-full border border-purple-300/15 bg-white/[0.04] px-2.5 py-1 text-xs text-purple-200/70">
                      <CalendarDays className="h-3 w-3" />
                      Class of {user.graduationYear}
                    </span>
                  )}
                </div>
              </div>

              {/* ── Profile strength ─────────────────────────────── */}
              <div className="flex items-center gap-4 rounded-2xl border border-purple-300/15 bg-white/[0.04] p-4">
                <div className="relative flex-shrink-0">
                  <MiniRing score={score} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{score}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Profile strength</p>
                  <p className="text-xs text-purple-300/50">
                    {score >= 91
                      ? "🔥 Elite — you'll get so many matches"
                      : score >= 71 ? "Strong profile 💜"
                      : score >= 41 ? "Keep going — add more details"
                      : "Just getting started"}
                  </p>
                </div>
              </div>

              {/* ── Bio ──────────────────────────────────────────── */}
              {user?.bio ? (
                <div className="rounded-2xl border border-purple-300/10 bg-white/[0.03] p-4">
                  <SectionLabel>About</SectionLabel>
                  <p className="text-sm leading-relaxed text-white/80">{user.bio}</p>
                </div>
              ) : (
                <EmptyHint>No bio yet — add one to stand out!</EmptyHint>
              )}

              {/* ── Additional photos (2–6) in a 3-col grid ──────── */}
              {extraPhotos.length > 0 && (
                <div>
                  <SectionLabel>Photos</SectionLabel>
                  <div className="grid grid-cols-3 gap-2">
                    {extraPhotos.map((photo, i) => {
                      const caption = user?.photoCaptions?.[i + 1];
                      return (
                        <div key={i} className="overflow-hidden rounded-2xl">
                          <img
                            src={getProfileImage(photo, `${displayName}-${i + 2}`)}
                            alt=""
                            className="aspect-square w-full object-cover"
                          />
                          {caption && (
                            <p className="mt-1 truncate px-1 text-center text-[10px] text-purple-300/50">
                              {caption}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Prompts ──────────────────────────────────────── */}
              {Array.isArray(user?.prompts) && user.prompts.filter((p) => p.answer).length > 0 ? (
                <div className="space-y-3">
                  <SectionLabel>Prompts</SectionLabel>
                  {user.prompts
                    .filter((p) => p.answer)
                    .map((p, i) => (
                      <div
                        key={i}
                        className="rounded-2xl border border-fuchsia-300/15 bg-gradient-to-br from-[#1d0b33]/80 to-[#27094a]/80 p-4"
                      >
                        <p className="mb-1.5 text-[11px] font-semibold text-fuchsia-300/60">{p.question}</p>
                        <p className="text-sm font-medium text-white">{p.answer}</p>
                      </div>
                    ))}
                </div>
              ) : (
                <EmptyHint>No prompts yet — share what makes you unique!</EmptyHint>
              )}

              {/* ── Interests ────────────────────────────────────── */}
              {Array.isArray(user?.interests) && user.interests.length > 0 ? (
                <div>
                  <SectionLabel>Interests</SectionLabel>
                  <div className="flex flex-wrap gap-2">
                    {user.interests.map((interest) => (
                      <span
                        key={interest}
                        className="rounded-full border border-fuchsia-400/25 bg-fuchsia-500/10 px-3 py-1.5 text-xs font-medium text-fuchsia-100"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyHint>No interests added — pick up to 10!</EmptyHint>
              )}

              {/* ── Social links ─────────────────────────────────── */}
              {(user?.spotifyUrl || user?.instagramUrl) && (
                <div>
                  <SectionLabel>Links</SectionLabel>
                  <div className="flex flex-wrap gap-2">
                    {user.spotifyUrl && (
                      <a
                        href={user.spotifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-full border border-green-400/30 bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-300 transition hover:bg-green-500/20"
                      >
                        <Music className="h-3 w-3" />
                        Spotify
                      </a>
                    )}
                    {user.instagramUrl && (
                      <a
                        href={user.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-full border border-pink-400/30 bg-pink-500/10 px-3 py-1.5 text-xs font-medium text-pink-300 transition hover:bg-pink-500/20"
                      >
                        <Instagram className="h-3 w-3" />
                        Instagram
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Footer */}
              <p className="text-center text-[11px] text-purple-400/30">
                This is how your profile appears to others
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

