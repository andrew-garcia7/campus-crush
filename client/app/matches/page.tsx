"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Heart, Info, MessageCircle, Search, Sparkles, Users, Star } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { getUserIdFromToken } from "@/lib/auth";
import { useApiSWR } from "@/hooks/use-api-swr";
import { getProfileImage } from "@/lib/media";
import { RelativeTime } from "@/components/ui/RelativeTime";
import { buildPhotoGallery, DEMO_STUDENT_SEEDS, getDemoStudentSeed, uniqueStrings } from "@/lib/demo-content";
import type { DetailProfile } from "@/components/discover/ProfileDetailModal";

const ProfileDetailModal = dynamic(
  () => import("@/components/discover/ProfileDetailModal").then((module) => module.ProfileDetailModal),
  { ssr: false }
);

type MatchItem = {
  matchId: string;
  name: string;
  photo: string;
  university: string;
  department?: string;
  age?: number;
  online?: boolean;
  matchedAt?: string;
  mutualInterests?: string[];
  bio?: string;
  interests?: string[];
  hobbies?: string[];
  prompts?: Array<{ question: string; answer: string }>;
  relationshipGoals?: string;
  height?: string;
  verified?: boolean;
  photos?: string[];
  matchProbability?: number;
  compatibilityScore?: string;
};

const TABS = ["All", "New", "Online", "Nearby"] as const;

const SAMPLE_MATCH_LIST: MatchItem[] = DEMO_STUDENT_SEEDS.slice(0, 5).map((entry, index) => ({
  matchId: `sm-${index + 1}`,
  name: entry.name,
  photo: entry.images[0],
  university: entry.university,
  department: entry.department,
  age: entry.age,
  online: entry.online,
  matchedAt: new Date(Date.now() - (index + 1) * 3600000).toISOString(),
  mutualInterests: entry.interests.slice(0, 3),
  bio: entry.bio,
  interests: entry.interests,
  hobbies: entry.hobbies,
  prompts: entry.prompts,
  relationshipGoals: entry.relationshipGoals,
  height: entry.height,
  verified: entry.verified,
  photos: entry.images,
  matchProbability: entry.matchProbability,
  compatibilityScore: entry.compatibilityScore,
}));

export default function MatchesPage() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const userId = getUserIdFromToken(token) || user?._id || user?.id;

  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const [search, setSearch] = useState("");
  const [activeProfile, setActiveProfile] = useState<DetailProfile | null>(null);
  const { data, isLoading } = useApiSWR<any[]>(token && hydrated ? "/chat/matches" : null);

  const apiMatches = useMemo<MatchItem[]>(() => {
    return (data || []).map((match: any, index: number) => {
      const other = match.users?.find((entry: any) => String(entry._id || entry) !== userId);
      const seed = getDemoStudentSeed(other?.fullName, index);
      const gallery = buildPhotoGallery(
        Array.isArray(other?.photos) ? other.photos.map((p: string) => getProfileImage(p, other?.fullName || String(match._id))) : [],
        seed.images
      );
      return {
        matchId: String(match._id),
        name: other?.fullName || seed.name,
        photo: gallery[0] || getProfileImage(other?.photos?.[0], other?.fullName || String(match._id)),
        university: other?.university || seed.university,
        department: other?.department || seed.department,
        age: other?.age || seed.age,
        online: Boolean(match.online),
        matchedAt: match.matchedAt || match.createdAt,
        mutualInterests: (match.mutualInterests?.length ? match.mutualInterests : seed.interests.slice(0, 3)) || [],
        bio: other?.bio || seed.bio,
        interests: uniqueStrings([...(other?.interests || []), ...seed.interests]).slice(0, 8),
        hobbies: seed.hobbies,
        prompts: Array.isArray(other?.prompts) && other.prompts.length ? other.prompts.slice(0, 3) : seed.prompts,
        relationshipGoals: other?.relationshipGoals || seed.relationshipGoals,
        height: other?.height || seed.height,
        verified: other?.verificationStatus === "verified" || seed.verified,
        photos: gallery,
        matchProbability: seed.matchProbability,
        compatibilityScore: seed.compatibilityScore,
      };
    });
  }, [data, userId]);

  const matches = apiMatches.length > 0 ? apiMatches : SAMPLE_MATCH_LIST;

  const toDetailProfile = (m: MatchItem): DetailProfile => ({
    id: m.matchId,
    name: m.name,
    age: m.age ?? 20,
    bio: m.bio || "",
    images: m.photos?.length ? m.photos : [m.photo],
    university: m.university,
    department: m.department,
    interests: m.interests || [],
    hobbies: m.hobbies || [],
    prompts: m.prompts,
    relationshipGoals: m.relationshipGoals,
    height: m.height,
    verified: m.verified || false,
    online: m.online,
    mutualCount: (m.mutualInterests || []).length,
    matchProbability: m.matchProbability,
    compatibilityScore: m.compatibilityScore,
  });

  const filtered = matches.filter((m) => {
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (tab === "Online") return m.online;
    return true;
  });

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>, match: MatchItem) => {
    const image = event.currentTarget;
    const fallbackSources = uniqueStrings([...(match.photos || []), getProfileImage("", match.name)]);
    const currentIndex = Number(image.dataset.fallbackIndex || "0");
    const nextSource = fallbackSources[currentIndex + 1];

    if (nextSource) {
      image.dataset.fallbackIndex = String(currentIndex + 1);
      image.src = nextSource;
      return;
    }

    image.onerror = null;
    image.src = getProfileImage("", match.name);
  };

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-pink-100 bg-white shadow-[0_4px_24px_rgba(255,45,120,0.08)]"
      >
        {/* Header */}
        <div className="relative px-5 pt-6 pb-4">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-xl font-bold text-[#2D1810]">Matches</h1>
            <div className="flex items-center gap-1.5 rounded-full border border-pink-200 bg-pink-50 px-2.5 py-1 text-[11px] text-[#FF2D78] font-medium">
              <Sparkles className="h-3 w-3" />
              {matches.length} matches
            </div>
          </div>
          <p className="text-xs text-[#9B7065]">Your campus connections</p>
        </div>

        {/* Search */}
        <div className="px-5 pb-3">
          <div className="flex items-center gap-2 rounded-2xl border border-pink-100 bg-[#FFF8F0] px-3 py-2.5">
            <Search className="h-3.5 w-3.5 text-[#9B7065]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search matches..."
              className="flex-1 bg-transparent text-sm text-[#2D1810] outline-none placeholder:text-[#9B7065]/50"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="px-5 pb-3">
          <div className="flex gap-1.5">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`relative rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  tab === t ? "text-white" : "text-[#9B7065] hover:text-[#2D1810]"
                }`}
              >
                {tab === t && (
                  <motion.div
                    layoutId="match-tab"
                    className="absolute inset-0 rounded-full bg-[#FF2D78]"
                  />
                )}
                <span className="relative z-10">{t}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Match Grid */}
        <div className="px-5 pb-6">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-3xl bg-pink-50 h-44" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-50">
                <Heart className="h-7 w-7 text-pink-300" />
              </div>
              <p className="text-sm font-medium text-[#2D1810]">No matches yet</p>
              <p className="text-xs text-[#9B7065]">Start swiping to find your campus crush</p>
              <Link href="/discover">
                <button className="mt-2 rounded-full bg-[#FF2D78] px-5 py-2 text-xs font-semibold text-white shadow-[0_4px_12px_rgba(255,45,120,0.4)]">
                  Discover People
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <AnimatePresence>
                {filtered.map((m, i) => (
                    <motion.div
                    key={m.matchId}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div
                      className="group relative overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-[0_2px_12px_rgba(255,45,120,0.06)] hover:shadow-[0_4px_20px_rgba(255,45,120,0.14)] transition-all cursor-pointer"
                      onClick={() => setActiveProfile(toDetailProfile(m))}
                    >
                      {/* Photo */}
                        <div className="relative h-36 w-full overflow-hidden bg-gradient-to-br from-pink-100 to-rose-100">
                        <img
                          src={m.photo}
                          alt={m.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          decoding="async"
                          data-fallback-index="0"
                          onError={(event) => handleImageError(event, m)}
                        />
                          {m.online && (
                            <div className="absolute top-2.5 right-2.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
                          )}
                          <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-[#2D1810]/70 via-transparent to-transparent" />
                        {/* Info button */}
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setActiveProfile(toDetailProfile(m));
                          }}
                          className="absolute top-2 left-2 flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Info className="h-3.5 w-3.5" />
                        </button>
                        {m.matchProbability ? (
                            <div className="absolute right-2 top-2 rounded-full border border-pink-200 bg-white/90 px-2 py-1 text-[10px] font-semibold text-[#FF2D78]">
                            {m.matchProbability}% match
                          </div>
                        ) : null}
                      </div>
                      {/* Info */}
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-sm font-semibold text-white truncate">{m.name}, {m.age}</p>
                        <p className="text-[10px] text-pink-100/80 truncate">{m.university}{m.department ? ` · ${m.department}` : ""}</p>
                        {m.prompts?.[0]?.answer ? (
                          <p className="mt-1 line-clamp-1 text-[10px] text-white/80">{m.prompts[0].answer}</p>
                        ) : null}
                        <div className="mt-1.5 flex items-center justify-between">
                          <div className="flex flex-col text-[10px] leading-tight text-pink-100/80">
                            {m.compatibilityScore ? <span>Compat. {m.compatibilityScore}</span> : null}
                            <div className="flex items-center gap-1">
                            <Star className="h-2.5 w-2.5" />
                            {(m.mutualInterests || []).length} mutual
                            </div>
                          </div>
                          <Link href={`/chat?match=${m.matchId}`}>
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/25 hover:bg-white/40 transition-colors cursor-pointer">
                              <MessageCircle className="h-3 w-3 text-white" />
                            </div>
                          </Link>
                        </div>
                        <RelativeTime value={m.matchedAt} prefix="Matched" className="mt-1 text-[10px] text-pink-100/70" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Stats row */}
        {matches.length > 0 && (
          <div className="mx-5 mb-5 rounded-2xl border border-pink-100 bg-pink-50/50 p-3">
            <div className="flex justify-around text-center">
              {[
                { icon: Heart, value: matches.length, label: "Matches", color: "text-[#FF2D78]" },
                { icon: Users, value: matches.filter((m) => m.online).length, label: "Online", color: "text-emerald-600" },
                { icon: MessageCircle, value: matches.length, label: "Chats", color: "text-purple-600" },
              ].map(({ icon: Icon, value, label, color }) => (
                <div key={label} className="flex flex-col items-center gap-0.5">
                  <Icon className={`h-4 w-4 ${color}`} />
                  <p className={`text-base font-bold ${color}`}>{value}</p>
                  <p className="text-[10px] text-[#9B7065]">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {activeProfile && (
        <ProfileDetailModal
          profile={activeProfile}
          onClose={() => setActiveProfile(null)}
          onMessage={() => {
            window.location.href = `/chat?match=${activeProfile.id}`;
          }}
        />
      )}
    </div>
  );
}
