"use client";

import { useEffect, useState } from "react";
import { motion, PanInfo, useMotionValue, useTransform, animate } from "framer-motion";
import { BadgeCheck, ChevronLeft, ChevronRight, Circle, Info, MapPin, Users, User } from "lucide-react";
import type { DiscoverProfile, SwipeAction } from "./swipe-types";

const SWIPE_THRESHOLD = 100;

interface SwipeCardProps {
  profile: DiscoverProfile;
  zIndex: number;
  offset: number;
  onSwipe: (action: SwipeAction) => void;
  isTop: boolean;
  onInfoClick?: () => void;
  exitAction?: SwipeAction | null;
}

// Exit animation targets per action
const EXIT: Record<SwipeAction, { x?: number; y?: number; rotate?: number; scale?: number; opacity: number }> = {
  like:       { x: 540,  rotate: 22,  opacity: 0 },
  rose:       { x: 460,  rotate: 16,  scale: 1.04, opacity: 0 },
  compliment: { x: 440,  rotate: 12,  opacity: 0 },
  superlike:  { y: -580, rotate: 0,   scale: 0.82, opacity: 0 },
  dislike:    { x: -540, rotate: -22, opacity: 0 },
};

const EXIT_DURATION = 0.55;
const EXIT_EASE: [number, number, number, number] = [0.25, 1, 0.5, 1];

// Deterministic gradient per user — no external requests
const GRADIENTS = [
  "from-[#2a132f] via-[#4a243e] to-[#e7b8a4]",
  "from-[#1f1025] via-[#47234b] to-[#fbcfe8]",
  "from-[#24111b] via-[#553349] to-[#f7e7b2]",
  "from-[#2a132f] via-[#693049] to-[#f4d8e8]",
  "from-[#1f0d18] via-[#4a243e] to-[#e9d5ff]",
  "from-[#231026] via-[#523149] to-[#ead79b]",
];

function getGradient(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xffffff;
  return GRADIENTS[hash % GRADIENTS.length];
}

// ─── Background card (non-interactive) ────────────────────────────────────────
function BackgroundCard({ profile, offset, zIndex }: { profile: DiscoverProfile; offset: number; zIndex: number }) {
  const gallery = profile.images?.length ? profile.images : profile.image ? [profile.image] : [];
  const activeImage = gallery[0] || profile.image;
  const gradient = getGradient(profile.id);

  return (
    <motion.div
      style={{ zIndex }}
      animate={{ scale: 1 - offset * 0.045, y: offset * 16 }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      className="absolute inset-0 overflow-hidden rounded-[36px] border border-[#f7e7b2]/10 shadow-[0_22px_48px_rgba(11,4,13,0.30)]"
    >
      {activeImage ? (
        <img src={activeImage} alt={profile.name} className="absolute inset-0 h-full w-full object-cover object-center" draggable={false} />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#2D1810]/85 via-[#2D1810]/20 to-transparent" />
      {/* depth blur */}
      <div
        className="absolute inset-0 rounded-[36px]"
        style={{ backdropFilter: offset > 1 ? "blur(2.5px)" : "blur(0.8px)" }}
      />
    </motion.div>
  );
}

// ─── Top (draggable) card ──────────────────────────────────────────────────────
export function SwipeCard({ profile, zIndex, offset, onSwipe, isTop, onInfoClick, exitAction }: SwipeCardProps) {
  const [imageIndex, setImageIndex] = useState(0);

  // Motion values for drag
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-18, 0, 18]);
  const likeOpacity   = useTransform(x, [20, 100], [0, 1]);
  const nopeOpacity   = useTransform(x, [-100, -20], [1, 0]);
  const superOpacity  = useTransform(y, [-140, -60], [1, 0]);
  const rightGlow     = useTransform(x, [0, 120], [0, 1]);

  // Trigger programmatic exit when exitAction arrives
  useEffect(() => {
    if (!exitAction || !isTop) return;
    const t = EXIT[exitAction];
    const opts = { duration: EXIT_DURATION, ease: EXIT_EASE };
    animate(x, t.x ?? 0, opts);
    animate(y, t.y ?? 0, opts);
  }, [exitAction, isTop, x, y]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (exitAction) return; // already animating
    if (info.offset.x > SWIPE_THRESHOLD) onSwipe("like");
    else if (info.offset.x < -SWIPE_THRESHOLD) onSwipe("dislike");
    else if (info.offset.y < -SWIPE_THRESHOLD) onSwipe("superlike");
  };

  if (!isTop) {
    return <BackgroundCard profile={profile} offset={offset} zIndex={zIndex} />;
  }

  const gallery = profile.images?.length ? profile.images : profile.image ? [profile.image] : [];
  const activeImage = gallery[imageIndex] || profile.image;
  const hasImage = Boolean(activeImage);
  const gradient = getGradient(profile.id);

  return (
    <motion.div
      drag={!exitAction}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.88}
      onDragEnd={handleDragEnd}
      style={{ zIndex, x, y, rotate }}
      animate={exitAction ? { opacity: 0, scale: EXIT[exitAction].scale ?? 1, transition: { duration: EXIT_DURATION } } : { opacity: 1, scale: 1 }}
      whileDrag={{ cursor: "grabbing" }}
      className="absolute inset-0 cursor-grab overflow-hidden rounded-[36px] border border-[#f7e7b2]/12 shadow-[0_22px_48px_rgba(11,4,13,0.34)] active:cursor-grabbing"
    >
      {/* Photo or gradient fallback */}
      {hasImage ? (
        <img
          src={activeImage}
          alt={profile.name}
          className="absolute inset-0 h-full w-full object-cover object-center"
          draggable={false}
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}>
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <User className="h-32 w-32 text-white" />
          </div>
        </div>
      )}

      {/* Right-swipe glow */}
      <motion.div
        style={{ opacity: rightGlow }}
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(247,231,178,0.16),transparent_55%)]"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#2D1810]/88 via-[#2D1810]/22 to-transparent" />

      {/* Photo gallery nav */}
      {gallery.length > 1 && (
        <>
          <div className="absolute left-0 right-0 top-3 z-20 flex justify-center gap-1 px-5">
            {gallery.map((_, index) => (
              <Circle
                key={`${profile.id}-${index}`}
                className={`h-2.5 w-2.5 ${index === imageIndex ? "fill-[#fff8fb] text-[#fff8fb]" : "fill-white/25 text-white/25"}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setImageIndex((c) => (c === 0 ? gallery.length - 1 : c - 1)); }}
            className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-[#2D1810]/30 p-1.5 text-white/90 backdrop-blur-sm"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setImageIndex((c) => (c + 1) % gallery.length); }}
            className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-[#2D1810]/30 p-1.5 text-white/90 backdrop-blur-sm"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {/* LIKE / NOPE / SUPER stamps */}
      <motion.div style={{ opacity: likeOpacity }} className="absolute left-5 top-8 z-20 rotate-[-20deg] rounded-xl border-2 border-[#f7e7b2] bg-[#fff9f1]/8 px-4 py-2 text-2xl font-black tracking-wide text-[#f7e7b2]">
        LIKE
      </motion.div>
      <motion.div style={{ opacity: nopeOpacity }} className="absolute right-5 top-8 z-20 rotate-[20deg] rounded-xl border-2 border-[#f0a7ba] bg-[#fff9f1]/8 px-4 py-2 text-2xl font-black tracking-wide text-[#f0a7ba]">
        NOPE
      </motion.div>
      <motion.div style={{ opacity: superOpacity }} className="absolute inset-x-0 top-16 z-20 flex justify-center">
        <span className="rounded-xl border-2 border-cyan-400 bg-cyan-500/10 px-5 py-2 text-2xl font-black tracking-wide text-cyan-300">SUPER</span>
      </motion.div>

      {/* Profile info */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <div className="flex items-end justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-2xl font-semibold text-white">
                {profile.name}, {profile.age}
              </h3>
              {profile.verified && <BadgeCheck className="h-5 w-5 text-blue-400" fill="#60a5fa" />}
            </div>
            <div className="mt-1 flex items-center gap-3 text-xs text-white/75">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {profile.distance ?? "On campus"}
              </span>
              {profile.online && (
                <span className="rounded-full bg-emerald-400/18 px-2 py-0.5 text-[10px] font-medium text-emerald-100">Online</span>
              )}
              {(profile.mutualCount ?? 0) > 0 && (
                <span className="flex items-center gap-1 text-[#f3c7d8]">
                  <Users className="h-3 w-3" />
                  {profile.mutualCount} mutual
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-white/62">
              {profile.university}{profile.department ? ` · ${profile.department}` : ""}
            </p>
            {typeof profile.matchProbability === "number" && (
              <p className="mt-1 text-xs font-semibold text-[#f7e7b2]">{profile.matchProbability}% match probability</p>
            )}
            {profile.compatibilityScore && (
              <p className="mt-1 text-[11px] text-[#f4e4ec]/80">Compatibility {profile.compatibilityScore}</p>
            )}
            {profile.bio && <p className="mt-1 line-clamp-2 text-sm text-white/84">{profile.bio}</p>}
          </div>
        </div>

        {/* Info button */}
        {onInfoClick && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onInfoClick(); }}
            className="absolute bottom-5 right-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-[#2D1810]/35 text-white backdrop-blur-sm"
          >
            <Info className="h-4 w-4" />
          </button>
        )}

        {/* Interest tags */}
        {profile.interests && profile.interests.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {profile.interests.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[#f7e7b2]/18 bg-[#fff9f1]/8 px-2.5 py-0.5 text-[11px] text-[#fff5fa] backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

