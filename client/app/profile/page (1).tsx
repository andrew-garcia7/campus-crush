"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Camera, LogOut, Save, BadgeCheck, User } from "lucide-react";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/auth-store";
import { getUserIdFromToken } from "@/lib/auth";
import { useToastStore } from "@/store/toast-store";

export default function ProfilePage() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const hydrate = useAuthStore((s) => s.hydrate);
  const logout = useAuthStore((s) => s.logout);
  const toast = useToastStore((s) => s.push);
  const userId = getUserIdFromToken(token) || user?._id || user?.id;

  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState("");
  const [saving, setSaving] = useState(false);
  const [photo, setPhoto] = useState<string>("");

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!user) return;
    setBio(user.bio || "");
    setInterests((user.interests || []).join(", "));
    setPhoto(user.photos?.[0] || "");
  }, [user]);

  const handleSave = async () => {
    if (!userId || !token) return;
    setSaving(true);
    try {
      const res = await api.patch(
        `/auth/profile`,
        { bio, interests: interests.split(",").map((s: string) => s.trim()).filter(Boolean) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updated = res.data?.data?.user || res.data?.data;
      if (updated) setUser({ ...user, ...updated });
      toast({ title: "Profile saved", variant: "success" });
    } catch (e: any) {
      toast({ title: "Save failed", message: e?.response?.data?.message || "Try again.", variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const displayName = user?.fullName || "Your Profile";
  const university = user?.university || "";
  const isVerified = user?.verificationStatus === "verified";

  return (
    <div className="mx-auto w-full max-w-[430px]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-[36px] border border-fuchsia-300/20 bg-[#120522]/70 shadow-[0_0_45px_rgba(196,70,255,0.3)] backdrop-blur-xl"
        style={{ minHeight: 760 }}
      >
      {/* Header */}
      <div className="relative overflow-hidden px-5 pt-6 pb-3">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-purple-500/15 blur-2xl" />
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-500 shadow-[0_0_16px_rgba(168,85,247,0.5)]">
            <User className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Profile</h1>
            <p className="text-xs text-purple-300/60">Your campus identity</p>
          </div>
        </div>
      </div>
      <div className="space-y-4 px-5 pb-6">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div
              className="h-28 w-28 rounded-full border-2 border-fuchsia-400/60 bg-gradient-to-br from-purple-600/40 to-pink-600/30 bg-cover bg-center shadow-[0_0_24px_rgba(255,79,216,0.4)]"
              style={photo ? { backgroundImage: `url(${photo})` } : {}}
            />
            <div className="absolute -bottom-1 -right-1 rounded-full bg-[#1a0a33] p-1.5">
              <Camera className="h-4 w-4 text-purple-300" />
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5">
              <h2 className="text-lg font-semibold text-white">{displayName}</h2>
              {isVerified && <BadgeCheck className="h-4 w-4 text-blue-400" fill="#60a5fa" />}
            </div>
            <p className="text-xs text-purple-300">{university}</p>
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-purple-200">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={200}
            rows={3}
            className="w-full resize-none rounded-2xl border border-purple-300/20 bg-white/10 p-3 text-sm text-white outline-none transition focus:border-fuchsia-300/40 focus:shadow-[0_0_20px_rgba(255,79,216,0.15)] placeholder:text-purple-300/50"
            placeholder="Write something about yourself..."
          />
          <p className="text-right text-[10px] text-purple-400">{bio.length}/200</p>
        </div>

        {/* Interests */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-purple-200">Interests (comma separated)</label>
          <input
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            className="w-full rounded-2xl border border-purple-300/20 bg-white/10 p-3 text-sm text-white outline-none transition focus:border-fuchsia-300/40 placeholder:text-purple-300/50"
            placeholder="Music, Coffee, Coding..."
          />
          {interests && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {interests.split(",").map((t) => t.trim()).filter(Boolean).map((tag) => (
                <span key={tag} className="rounded-full border border-fuchsia-400/30 bg-fuchsia-500/15 px-2.5 py-0.5 text-[11px] text-fuchsia-200">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Save */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(255,79,216,0.3)] disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Profile"}
        </motion.button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-rose-400/30 bg-rose-500/10 py-3 text-sm font-medium text-rose-300 transition hover:bg-rose-500/20"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
      </motion.div>
    </div>
  );
}

