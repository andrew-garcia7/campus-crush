"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BadgeCheck, Eye, Loader2, LogOut, MapPin, Pencil, Save, User } from "lucide-react";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/auth-store";
import { useToastStore } from "@/store/toast-store";
import { getProfileImage, resolveMediaUrl } from "@/lib/media";
import {
  AGE_OPTIONS,
  DEPARTMENT_OPTIONS,
  GENDER_OPTIONS,
  GRADUATION_YEAR_OPTIONS,
  HEIGHT_OPTIONS,
  INSTAGRAM_URL_SUGGESTIONS,
  RELATIONSHIP_GOAL_OPTIONS,
  SPOTIFY_URL_SUGGESTIONS
} from "@/lib/profile-options";
import dynamic from "next/dynamic";
import { SearchableSelect } from "@/components/profile/searchable-select";
import { InterestPicker } from "@/components/profile/interest-picker";
import { SectionCloseButton } from "@/components/layout/section-close-button";
import { BioEditor } from "@/components/profile/BioEditor";
import { PromptsEditor } from "@/components/profile/PromptsEditor";
import type { PromptCard } from "@/components/profile/PromptsEditor";
import { PhotoGrid } from "@/components/profile/PhotoGrid";
import type { PhotoSlot } from "@/components/profile/PhotoGrid";
import { ProfileStrengthRing } from "@/components/profile/ProfileStrengthRing";
import { ProfilePreviewModal } from "@/components/profile/ProfilePreviewModal";

const CampusPicker = dynamic(() => import("@/components/map/CampusPicker"), { ssr: false });

const TABS = [
  { key: "photos",       label: "Photos & Bio" },
  { key: "personality",  label: "Personality"  },
  { key: "details",      label: "Details"      },
] as const;

type TabKey = typeof TABS[number]["key"];

const EMPTY_FORM = {
  fullName: "",
  age: "",
  gender: "",
  city: "",
  bio: "",
  university: "",
  department: "",
  graduationYear: "",
  relationshipGoals: RELATIONSHIP_GOAL_OPTIONS[0].value,
  height: "",
  spotifyUrl: "",
  instagramUrl: ""
};

export default function ProfilePage() {
  const token     = useAuthStore((state) => state.token);
  const user      = useAuthStore((state) => state.user);
  const hydrated  = useAuthStore((state) => state.hydrated);
  const setUser   = useAuthStore((state) => state.setUser);
  const logout    = useAuthStore((state) => state.logout);
  const pushToast = useToastStore((state) => state.push);
  const queryClient = useQueryClient();
  const router = useRouter();

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await api.get("/auth/profile");
      return response.data?.data;
    },
    enabled: Boolean(token && hydrated),
    staleTime: 30_000
  });

  const profileData = profileQuery.data as any;
  const profileUser = profileData?.user || user;

  const [form, setForm]                       = useState(EMPTY_FORM);
  const [activeTab, setActiveTab]             = useState<TabKey>("photos");
  const [campusPickerOpen, setCampusPickerOpen] = useState(false);
  const [showPreview, setShowPreview]         = useState(false);
  const [editingName, setEditingName]         = useState(false);
  const hasInitialized = useRef(false);
  const [photos, setPhotos]                   = useState<string[]>(["", "", "", "", "", ""]);
  const [photoCaptions, setPhotoCaptions]     = useState<string[]>(["", "", "", "", "", ""]);
  const [prompts, setPrompts]                 = useState<PromptCard[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [saving, setSaving]                   = useState(false);
  const [uploadingIndex, setUploadingIndex]   = useState<number | null>(null);

  // Section refs for scroll-to from strength ring
  const photosRef    = useRef<HTMLDivElement>(null);
  const bioRef       = useRef<HTMLDivElement>(null);
  const promptsRef   = useRef<HTMLDivElement>(null);
  const interestsRef = useRef<HTMLDivElement>(null);
  const detailsRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profileUser) return;
    // Only initialize once from API — prevents background refetch from wiping user edits
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    if (profileData?.user && user) {
      setUser({ ...user, ...profileData.user });
    }

    setForm({
      fullName: profileUser.fullName || "",
      age: profileUser.age ? String(profileUser.age) : "",
      gender: profileUser.gender || "",
      city: profileUser.city || "",
      bio: profileUser.bio || "",
      university: profileUser.university || "",
      department: profileUser.department || "",
      graduationYear: profileUser.graduationYear ? String(profileUser.graduationYear) : "",
      relationshipGoals: profileUser.relationshipGoals || RELATIONSHIP_GOAL_OPTIONS[0].value,
      height: profileUser.height || "",
      spotifyUrl: profileUser.spotifyUrl || "",
      instagramUrl: profileUser.instagramUrl || ""
    });

    setSelectedInterests(Array.isArray(profileUser.interests) ? profileUser.interests.slice(0, 10) : []);

    const nextPhotos = Array.isArray(profileUser.photos) ? profileUser.photos.slice(0, 6) : [];
    const normalized = nextPhotos.map((photo: string, i: number) =>
      getProfileImage(photo, `${profileUser.fullName || "Campus Crush"}-${i}`)
    );
    setPhotos([...normalized, ...Array(6 - normalized.length).fill("")].slice(0, 6));

    if (Array.isArray(profileUser.photoCaptions)) {
      const caps = profileUser.photoCaptions as string[];
      setPhotoCaptions([...caps, ...Array(6 - caps.length).fill("")].slice(0, 6));
    }

    if (Array.isArray(profileUser.prompts)) {
      setPrompts((profileUser.prompts as PromptCard[]).slice(0, 3));
    }
  }, [profileData?.user]);  // eslint-disable-line react-hooks/exhaustive-deps

  // Derive slots for PhotoGrid
  const photoSlots: PhotoSlot[] = useMemo(
    () => photos.map((url, i) => ({ url, caption: photoCaptions[i] ?? "" })),
    [photos, photoCaptions]
  );

  // Derive strengthInput for the ring
  const strengthInput = useMemo(() => ({
    photoCount:    photos.filter(Boolean).length,
    bioLength:     form.bio.trim().length,
    promptCount:   prompts.filter((p) => p.answer.trim()).length,
    interestCount: selectedInterests.length,
    hasUniversity: Boolean(form.university),
    isVerified:    profileUser?.verificationStatus === "verified",
  }), [photos, form.bio, form.university, prompts, selectedInterests, profileUser]);

  const displayName  = form.fullName || profileUser?.fullName || profileUser?.email?.split("@")[0] || "Your Profile";
  const isVerified   = profileUser?.verificationStatus === "verified";
  const primaryPhoto = photos.find(Boolean) || getProfileImage("", displayName);

  const updateField = (key: keyof typeof EMPTY_FORM, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleScrollTo = (section: string) => {
    const map: Record<string, React.RefObject<HTMLDivElement>> = {
      photos:    photosRef,
      bio:       bioRef,
      prompts:   promptsRef,
      interests: interestsRef,
      details:   detailsRef,
    };
    const tabMap: Record<string, TabKey> = {
      photos:    "photos",
      bio:       "photos",
      prompts:   "personality",
      interests: "personality",
      details:   "details",
    };
    const tab = tabMap[section];
    if (tab) setActiveTab(tab);
    setTimeout(() => {
      map[section]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const saveProfileMutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {
        age:              form.age ? Number(form.age) : undefined,
        bio:              form.bio,
        university:       form.university,
        department:       form.department,
        graduationYear:   form.graduationYear ? Number(form.graduationYear) : undefined,
        relationshipGoals: form.relationshipGoals,
        height:           form.height,
        spotifyUrl:       form.spotifyUrl,
        instagramUrl:     form.instagramUrl,
        interests:        selectedInterests,
        prompts,
        photos:           photos.filter(Boolean).map((photo) => resolveMediaUrl(photo) || photo),
        photoCaptions,
      };
      if (form.fullName.trim()) payload.fullName = form.fullName.trim();
      if (form.gender) payload.gender = form.gender;
      if (form.city.trim()) payload.city = form.city.trim();
      const response = await api.patch("/auth/profile", payload);
      return response.data?.data?.user || response.data?.data;
    },
    onSuccess: (updatedUser) => {
      setUser({ ...user, ...updatedUser });
      // Manually sync server response into local state so background refetch doesn't clobber edits
      setForm((prev) => ({
        ...prev,
        fullName:          updatedUser.fullName          ?? prev.fullName,
        bio:               updatedUser.bio               ?? prev.bio,
        university:        updatedUser.university        ?? prev.university,
        department:        updatedUser.department        ?? prev.department,
        graduationYear:    updatedUser.graduationYear    ? String(updatedUser.graduationYear) : prev.graduationYear,
        relationshipGoals: updatedUser.relationshipGoals ?? prev.relationshipGoals,
        height:            updatedUser.height            ?? prev.height,
        spotifyUrl:        updatedUser.spotifyUrl        ?? prev.spotifyUrl,
        instagramUrl:      updatedUser.instagramUrl      ?? prev.instagramUrl,
        gender:            updatedUser.gender            ?? prev.gender,
        city:              updatedUser.city              ?? prev.city,
      }));
      if (Array.isArray(updatedUser.interests)) setSelectedInterests(updatedUser.interests);
      if (Array.isArray(updatedUser.prompts)) setPrompts(updatedUser.prompts);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      pushToast({ title: "Profile saved ✓", variant: "success" });
    },
    onError: (error: any) => {
      pushToast({
        title: "Save failed",
        message: error?.response?.data?.message || "Please try again.",
        variant: "error"
      });
    },
    onSettled: () => { setSaving(false); }
  });

  const handleRemovePhoto = async (index: number) => {
    if (!token) {
      pushToast({ title: "Sign in to continue", message: "Login again before updating photos.", variant: "error" });
      router.replace("/login");
      return;
    }
    const photoUrl = photos[index];
    if (!photoUrl) return;

    setPhotos((prev) => { const n = [...prev]; n[index] = ""; return n; });
    setPhotoCaptions((prev) => { const n = [...prev]; n[index] = ""; return n; });
    try {
      await api.delete("/uploads/photo", { data: { photoUrl } });
      if (index === 0 && user) {
        setUser({ ...user, photos: (user.photos || []).filter((p: string) => p !== photoUrl) });
      }
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    } catch (error: any) {
      setPhotos((prev) => { const n = [...prev]; n[index] = photoUrl; return n; });
      pushToast({ title: "Delete failed", message: error?.response?.data?.message || "Please try again.", variant: "error" });
    }
  };

  const handleUpload = async (index: number, file: File) => {
    if (!token) {
      pushToast({ title: "Sign in to continue", message: "Login again before uploading photos.", variant: "error" });
      router.replace("/login");
      return;
    }
    const previousPhoto = photos[index];
    const previewUrl    = URL.createObjectURL(file);
    setPhotos((prev) => { const n = [...prev]; n[index] = previewUrl; return n; });
    setUploadingIndex(index);

    try {
      const formData = new FormData();
      const endpoint = index === 0 ? "/uploads/profile-photo" : "/uploads/gallery-photo";
      formData.append(index === 0 ? "profilePhoto" : "galleryPhoto", file);
      if (index > 0) formData.append("slot", String(index));

      const response = await api.post(endpoint, formData);
      const uploadedUrl = resolveMediaUrl(response.data?.data?.publicUrl);

      setPhotos((prev) => { const n = [...prev]; n[index] = uploadedUrl; return n; });

      if (index === 0 && uploadedUrl && user) {
        const updatedPhotos = [...(user.photos || [])];
        updatedPhotos[0] = uploadedUrl;
        setUser({ ...user, photos: updatedPhotos });
      }

      queryClient.invalidateQueries({ queryKey: ["profile"] });
      pushToast({ title: index === 0 ? "Profile photo updated" : "Gallery photo uploaded", variant: "success" });
    } catch (error: any) {
      setPhotos((prev) => { const n = [...prev]; n[index] = previousPhoto; return n; });
      pushToast({ title: "Upload failed", message: error?.response?.data?.message || "Please try again.", variant: "error" });
    } finally {
      URL.revokeObjectURL(previewUrl);
      setUploadingIndex(null);
    }
  };

  const handleReorder = (from: number, to: number) => {
    setPhotos((prev) => {
      const n = [...prev];
      [n[from], n[to]] = [n[to], n[from]];
      return n;
    });
    setPhotoCaptions((prev) => {
      const n = [...prev];
      [n[from], n[to]] = [n[to], n[from]];
      return n;
    });
  };

  const handleSave = async () => {
    if (!token) {
      pushToast({ title: "Sign in to continue", message: "Login again before saving.", variant: "error" });
      router.replace("/login");
      return;
    }
    setSaving(true);
    saveProfileMutation.mutate();
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-pink-100 bg-white shadow-[0_4px_24px_rgba(255,45,120,0.08)]"
      >
        {/* Header */}
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FF2D78] shadow-[0_4px_12px_rgba(255,45,120,0.4)]">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#2D1810]">Profile</h1>
                <p className="text-xs text-[#9B7065]">Make it unforgettable.</p>
              </div>
            </div>
            <SectionCloseButton />
          </div>
        </div>

        <div className="space-y-5 px-5 pb-6">
          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <img
              src={primaryPhoto}
              alt={displayName}
              className="h-16 w-16 flex-shrink-0 rounded-full border-2 border-pink-300 object-cover"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                {editingName ? (
                  <input
                    autoFocus
                    value={form.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    onBlur={() => setEditingName(false)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") setEditingName(false); }}
                    placeholder={profileUser?.email || "Your name"}
                    maxLength={80}
                    className="w-full bg-transparent text-lg font-semibold text-[#2D1810] outline-none placeholder:text-[#9B7065]/50 border-b border-pink-200 focus:border-[#FF2D78] transition-colors pb-0.5"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditingName(true)}
                    className="group flex items-center gap-1.5 text-left"
                  >
                    <h2 className="text-lg font-semibold text-[#2D1810] group-hover:text-[#FF2D78] transition-colors">
                      {displayName}
                    </h2>
                    <Pencil className="h-3.5 w-3.5 text-[#9B7065] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}
                {isVerified && <BadgeCheck className="h-4 w-4 flex-shrink-0 text-sky-400" fill="#38bdf8" />}
              </div>
              <p className="text-xs text-[#9B7065] mt-0.5">{form.university || "Add your university"}</p>
            </div>
          </div>

          {/* Strength ring */}
          <ProfileStrengthRing input={strengthInput} onScrollTo={handleScrollTo} />

          {/* Tab pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {TABS.map((tab) => (
              <motion.button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                whileTap={{ scale: 0.95 }}
                className={`relative flex-shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-all ${
                  activeTab === tab.key
                    ? "border-[#FF2D78]/30 bg-[#FF2D78] text-white shadow-[0_2px_8px_rgba(255,45,120,0.4)]"
                    : "border-pink-100 bg-pink-50/60 text-[#9B7065] hover:text-[#2D1810]"
                }`}
              >
                {tab.label}
              </motion.button>
            ))}
          </div>

          {/* ── Tab: Photos & Bio ────────────────────────────────────── */}
          {activeTab === "photos" && (
            <div className="space-y-6">
              <div ref={photosRef}>
                <PhotoGrid
                  slots={photoSlots}
                  uploadingIndex={uploadingIndex}
                  onUpload={handleUpload}
                  onRemove={handleRemovePhoto}
                  onCaptionChange={(index, caption) =>
                    setPhotoCaptions((prev) => { const n = [...prev]; n[index] = caption; return n; })
                  }
                  onReorder={handleReorder}
                />
              </div>

              <div ref={bioRef} className="rounded-3xl border border-pink-100 bg-pink-50/40 p-4">
                <BioEditor
                  value={form.bio}
                  onChange={(v) => updateField("bio", v)}
                />
              </div>
            </div>
          )}

          {/* ── Tab: Personality ─────────────────────────────────────── */}
          {activeTab === "personality" && (
            <div className="space-y-6">
              <div ref={promptsRef} className="rounded-3xl border border-pink-100 bg-pink-50/40 p-4">
                <PromptsEditor value={prompts} onChange={setPrompts} />
              </div>

              <div ref={interestsRef} className="rounded-3xl border border-pink-100 bg-pink-50/40 p-4">
                <InterestPicker value={selectedInterests} onChange={setSelectedInterests} />
              </div>
            </div>
          )}

          {/* ── Tab: Details ─────────────────────────────────────────── */}
          {activeTab === "details" && (
            <div ref={detailsRef} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <SearchableSelect label="Age" value={form.age} options={AGE_OPTIONS} placeholder="Pick age" onChange={(v) => updateField("age", v)} />
                <SearchableSelect label="Gender" value={form.gender} options={GENDER_OPTIONS} placeholder="Pick gender" onChange={(v) => updateField("gender", v)} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <SearchableSelect label="Height" value={form.height} options={HEIGHT_OPTIONS} placeholder="Pick height" onChange={(v) => updateField("height", v)} />
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#9B7065]">City</label>
                  <input
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    placeholder="e.g. Jalandhar"
                    maxLength={80}
                    className="w-full rounded-2xl border border-pink-100 bg-[#FFF8F0] px-3 py-2.5 text-sm text-[#2D1810] placeholder:text-[#9B7065]/50 outline-none transition focus:border-[#FF2D78] focus:ring-2 focus:ring-[#FF2D78]/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Campus / university */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#9B7065]">University / Campus</label>
                  <button
                    type="button"
                    onClick={() => setCampusPickerOpen(true)}
                    className="flex w-full items-center gap-2 rounded-2xl border border-pink-100 bg-[#FFF8F0] px-3 py-2.5 text-left text-sm transition-colors hover:border-[#FF2D78]/40"
                  >
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-[#FF2D78]" />
                    <span className={form.university ? "text-[#2D1810]" : "text-[#9B7065]/60"}>
                      {form.university || "Pick on map…"}
                    </span>
                  </button>
                </div>
                <SearchableSelect label="Department" value={form.department} options={DEPARTMENT_OPTIONS} placeholder="Pick department" searchPlaceholder="Search course or department..." allowCustomValue customValueLabel="Use department" onChange={(v) => updateField("department", v)} />
              </div>

              {campusPickerOpen && (
                <CampusPicker
                  onConfirm={(campus) => { updateField("university", campus.name); setCampusPickerOpen(false); }}
                  onClose={() => setCampusPickerOpen(false)}
                />
              )}

              <div className="grid grid-cols-2 gap-3">
                <SearchableSelect label="Graduation year" value={form.graduationYear} options={GRADUATION_YEAR_OPTIONS} placeholder="Pick graduation year" searchPlaceholder="Search graduation year..." allowCustomValue customValueLabel="Use year" onChange={(v) => updateField("graduationYear", v)} />
                <SearchableSelect label="Relationship goals" value={form.relationshipGoals} options={RELATIONSHIP_GOAL_OPTIONS} placeholder="Pick goals" onChange={(v) => updateField("relationshipGoals", v)} />
              </div>

              <SearchableSelect
                label="Spotify link"
                value={form.spotifyUrl}
                options={SPOTIFY_URL_SUGGESTIONS}
                placeholder="https://open.spotify.com/..."
                searchPlaceholder="Paste or search a Spotify link..."
                allowCustomValue
                customValueLabel="Use Spotify link"
                onChange={(v) => updateField("spotifyUrl", v)}
              />

              <SearchableSelect
                label="Instagram link"
                value={form.instagramUrl}
                options={INSTAGRAM_URL_SUGGESTIONS}
                placeholder="https://instagram.com/..."
                searchPlaceholder="Paste or search an Instagram link..."
                allowCustomValue
                customValueLabel="Use Instagram link"
                onChange={(v) => updateField("instagramUrl", v)}
              />
            </div>
          )}

          {/* Preview + Save + Logout */}
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-pink-200 bg-pink-50 py-3 text-sm font-semibold text-[#FF2D78] transition hover:bg-pink-100"
          >
            <Eye className="h-4 w-4" />
            Preview My Profile
          </button>

          <button
            onClick={handleSave}
            disabled={saving || saveProfileMutation.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#FF2D78] py-3.5 text-sm font-bold text-white shadow-[0_4px_18px_rgba(255,45,120,0.42)] transition disabled:opacity-60"
          >
            {saving || saveProfileMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving || saveProfileMutation.isPending ? "Saving…" : "Save Profile"}
          </button>

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-50 py-3 text-sm font-medium text-rose-600 transition hover:bg-rose-100"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </motion.div>

      {/* Profile preview modal */}
      <ProfilePreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        user={{
          fullName:          form.fullName || profileUser?.fullName,
          email:             profileUser?.email,
          age:               form.age ? Number(form.age) : profileUser?.age,
          gender:            form.gender || profileUser?.gender,
          university:        form.university || profileUser?.university,
          department:        form.department || profileUser?.department,
          city:              form.city || profileUser?.city,
          bio:               form.bio || profileUser?.bio,
          interests:         selectedInterests.length ? selectedInterests : profileUser?.interests,
          prompts,
          photos:            photos.filter(Boolean),
          photoCaptions,
          verificationStatus: profileUser?.verificationStatus,
          height:            form.height || profileUser?.height,
          relationshipGoals: form.relationshipGoals || profileUser?.relationshipGoals,
          graduationYear:    form.graduationYear || profileUser?.graduationYear,
          spotifyUrl:        form.spotifyUrl || profileUser?.spotifyUrl,
          instagramUrl:      form.instagramUrl || profileUser?.instagramUrl,
        }}
        strengthInput={strengthInput}
      />
    </div>
  );
}