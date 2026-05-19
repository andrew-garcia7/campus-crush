"use client";

import dynamic from "next/dynamic";
import {
  useMemo,
  useState,
  useEffect
} from "react";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";

import type {
  DiscoverProfile
} from "@/components/discover/swipe-types";

import {
  FloatingHearts
} from "@/components/ui/floating-hearts";

import {
  ThemeIconToggle
} from "@/components/ui/theme-icon-toggle";

import {
  useAuthStore
} from "@/store/auth-store";

import {
  api
} from "@/services/api";

import {
  FilterPanel,
  type FilterValues
} from "@/components/discover/FilterPanel";

import {
  ProfileDetailModal,
  type DetailProfile
} from "@/components/discover/ProfileDetailModal";

import {
  buildPhotoGallery,
  DEMO_STUDENT_SEEDS,
  getDemoStudentSeed,
  uniqueStrings
} from "@/lib/demo-content";

const SwipeDeck = dynamic(
  () =>
    import(
      "@/components/discover/SwipeDeck"
    ).then(
      (module) =>
        module.SwipeDeck
    ),
  {
    ssr: false
  }
);

const FILTER_TABS = [
  "All",
  "New",
  "Nearby",
  "Verified",
  "Events",
  "Trending"
] as const;

const SAMPLE_PROFILES: DiscoverProfile[] =
  DEMO_STUDENT_SEEDS.map(
    (entry) => ({
      id: entry.id,
      name: entry.name,
      age: entry.age,
      bio: entry.bio,
      image:
        entry.images[0],
      images:
        entry.images,
      university:
        entry.university,
      department:
        entry.department,
      interests:
        entry.interests,
      verified:
        entry.verified,
      distance:
        entry.distance,
      mutualCount:
        entry.mutualCount,
      online:
        entry.online,
      matchProbability:
        entry.matchProbability,
      compatibilityScore:
        entry.compatibilityScore
    })
  );

export default function DiscoverPage() {
  const router =
    useRouter();

  const token =
    useAuthStore(
      (s) => s.token
    );

  const user =
    useAuthStore(
      (s) => s.user
    );

  const hydrated =
    useAuthStore(
      (s) => s.hydrated
    );

  const [
    activeTab,
    setActiveTab
  ] = useState<
    (typeof FILTER_TABS)[number]
  >("All");

  const [
    filterOpen,
    setFilterOpen
  ] = useState(false);

  const [
    filters,
    setFilters
  ] =
    useState<
      FilterValues | undefined
    >();

  const [
    detailProfile,
    setDetailProfile
  ] =
    useState<DetailProfile | null>(
      null
    );

  const isPremium =
    (user as any)
      ?.isPremium || false;

  const university =
    user?.university ||
    "LPU";

  // ---------------- AUTH GUARD ----------------
  // NOTE: `user` is intentionally excluded from deps.
  // Profile sync calls setUser() on every mount which would re-trigger
  // this effect and cause redirect oscillation. We only need to re-run
  // when hydration state, token validity, or verificationStatus changes.
  useEffect(() => {
    if (!hydrated) return;

    if (!token) {
      router.replace("/login");
      return;
    }

    const currentUser = useAuthStore.getState().user;

    if (!currentUser) {
      router.replace("/login");
      return;
    }

    if (currentUser.verificationStatus !== "verified") {
      router.replace("/verification");
      return;
    }
  }, [
    hydrated,
    token,
    user?.verificationStatus,
    router
  ]);

  // ---------------- QUERY ----------------
  const discoverQuery =
    useQuery({
      queryKey: [
        "discover",
        university,
        activeTab
      ],

      queryFn:
        async () => {
          const response =
            await api.get(
              "/discover",
              {
                params: {
                  university,
                  filter:
                    activeTab
                }
              }
            );

          return (
            response.data
              ?.data || []
          );
        },

      enabled:
        hydrated &&
        !!token &&
        !!user &&
        user?.verificationStatus ===
          "verified",

      staleTime: 120_000
    });

  const data =
    discoverQuery.data as any[];

  const currentUserId = user?._id || (user as any)?.id || "";

  const apiProfiles = useMemo<DiscoverProfile[]>(() => {
    if (!data?.length) return [];

    const seenIds = new Set<string>();

    return data
      .map((profile: any, index: number) => {
        const seed = getDemoStudentSeed(profile.fullName, index);
        const gallery = buildPhotoGallery(profile.photos || [], seed.images);

        return {
          id: String(profile._id),
          name: profile.fullName || seed.name,
          age: profile.age || seed.age,
          bio: profile.bio || seed.bio,
          image: gallery[0],
          images: gallery,
          university: profile.university || seed.university,
          department: profile.department || seed.department,
          interests: uniqueStrings([...(profile.interests || []), ...seed.interests]),
          verified: profile.verificationStatus === "verified",
          distance: profile.distance || seed.distance,
          mutualCount: seed.mutualCount,
          online: seed.online,
          matchProbability: seed.matchProbability,
          compatibilityScore: seed.compatibilityScore,
        };
      })
      // Remove current user (safety net in case backend exclusion fails)
      .filter((p) => {
        if (p.id === currentUserId) return false;
        if (seenIds.has(p.id)) return false;
        seenIds.add(p.id);
        return true;
      });
  }, [data, currentUserId]);

  // Pad with demo profiles when real profiles are scarce so the deck never
  // shows a single repeated face.
  const profiles = useMemo<DiscoverProfile[]>(() => {
    const MIN_CARDS = 4;
    if (apiProfiles.length >= MIN_CARDS) return apiProfiles;

    const existingIds = new Set(apiProfiles.map((p) => p.id));
    const padding = SAMPLE_PROFILES.filter((p) => !existingIds.has(p.id));
    return [...apiProfiles, ...padding];
  }, [apiProfiles]);

  const toDetailProfile = (
    p: DiscoverProfile
  ): DetailProfile => ({
    id: p.id,
    name: p.name,
    age: p.age,
    bio: p.bio,
    images:
      p.images?.length
        ? p.images
        : [p.image],
    university:
      p.university,
    department:
      p.department,
    interests:
      p.interests,
    verified:
      p.verified,
    distance:
      p.distance,
    mutualCount:
      p.mutualCount,
    online:
      p.online,
    matchProbability:
      p.matchProbability,
    compatibilityScore:
      p.compatibilityScore
  });

  // ---------------- SAFE RENDER GUARDS ----------------
  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#9B7065]">
        Loading...
      </div>
    );
  }

  if (!token) {
    return null;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#9B7065]">
        Syncing profile...
      </div>
    );
  }

  if (
    user?.verificationStatus !==
    "verified"
  ) {
    return null;
  }

  // ---------------- MAIN UI ----------------
  return (
    <div className="w-full">
      <motion.div
        initial={{
          opacity: 0,
          y: 20
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        className="rounded-3xl border border-pink-100 bg-white shadow-[0_4px_24px_rgba(255,45,120,0.08)]"
      >
        {/* Header */}
        <div className="px-5 pt-6 pb-3 flex justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#2D1810]">
              Discover
            </h1>
            <p className="text-xs text-[#9B7065]">
              Swipe verified
              campus students
            </p>
          </div>

          <div className="flex gap-2">
            <ThemeIconToggle />

            <button
              onClick={() =>
                setFilterOpen(
                  true
                )
              }
              className="flex h-8 w-8 items-center justify-center rounded-full border border-pink-200 bg-pink-50 hover:bg-pink-100 transition"
            >
              <SlidersHorizontal className="h-4 w-4 text-[#FF2D78]" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-5 pb-3 flex gap-2 flex-wrap">
          {FILTER_TABS.map(
            (tab) => (
              <button
                key={tab}
                onClick={() =>
                  setActiveTab(
                    tab
                  )
                }
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                  activeTab ===
                  tab
                    ? "bg-[#FF2D78] text-white shadow-[0_2px_8px_rgba(255,45,120,0.4)]"
                    : "text-[#9B7065] hover:text-[#2D1810] bg-pink-50"
                }`}
              >
                {tab}
              </button>
            )
          )}
        </div>

        {/* Swipe deck */}
        <div className="px-5 pb-6 relative">
          <FloatingHearts />

          {discoverQuery.isLoading ? (
              <div className="text-center text-[#9B7065] py-20">
              Loading
              profiles...
            </div>
          ) : (
            <SwipeDeck
              profiles={
                profiles
              }
              onCardClick={(
                p
              ) =>
                setDetailProfile(
                  toDetailProfile(
                    p
                  )
                )
              }
            />
          )}
        </div>
      </motion.div>

      <FilterPanel
        open={filterOpen}
        onClose={() =>
          setFilterOpen(
            false
          )
        }
        isPremium={
          isPremium
        }
        onApply={(f) =>
          setFilters(
            f
          )
        }
        initial={filters}
      />

      {detailProfile && (
        <ProfileDetailModal
          profile={
            detailProfile
          }
          onClose={() =>
            setDetailProfile(
              null
            )
          }
          onLike={() =>
            setDetailProfile(
              null
            )
          }
          isPremium={
            isPremium
          }
        />
      )}
    </div>
  );
}