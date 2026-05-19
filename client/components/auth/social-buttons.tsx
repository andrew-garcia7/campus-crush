"use client";

import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { SiApple } from "react-icons/si";
import { motion } from "framer-motion";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useRouter } from "next/navigation";

import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/store/auth-store";
import { useToastStore } from "@/store/toast-store";
import { api } from "@/services/api";

export function SocialButtons() {
  const router   = useRouter();
  const toast    = useToastStore((s) => s.push);
  const setToken = useAuthStore((s) => s.setToken);
  const setUser  = useAuthStore((s) => s.setUser);

  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    if (googleLoading) return;
    setGoogleLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      const result     = await signInWithPopup(auth, provider);
      // credentialFromResult gives the Google OAuth2 ID token (not the Firebase ID token)
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const googleIdToken = credential?.idToken;

      if (!googleIdToken) {
        toast({ title: "Google login failed", message: "Could not retrieve Google credentials. Please try again.", variant: "error" });
        return;
      }

      const response = await api.post("/auth/google-login", { idToken: googleIdToken });
      const { token, user } = response.data.data;

      setToken(token);
      setUser(user);

      if (user.verificationStatus === "verified") {
        router.replace("/discover");
      } else {
        router.replace("/verification");
      }
    } catch (err: any) {
      // User dismissed the popup — not an error
      if (
        err?.code === "auth/popup-closed-by-user" ||
        err?.code === "auth/cancelled-popup-request"
      ) {
        return;
      }

      toast({
        title: "Google login failed",
        message: err?.response?.data?.message || err?.message || "Please try again.",
        variant: "error"
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAppleComingSoon = () => {
    toast({
      title: "Apple login coming soon",
      message: "Use email & password or Google for now.",
      variant: "info"
    });
  };

  const Btn = ({
    icon,
    label,
    onClick,
    loading
  }: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    loading?: boolean;
  }) => (
    <motion.button
      whileHover={{ scale: loading ? 1 : 1.01 }}
      whileTap={{ scale: loading ? 1 : 0.98 }}
      onClick={onClick}
      type="button"
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-purple-200/20 bg-white/5 py-3 text-sm text-purple-50 transition hover:border-fuchsia-200/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="text-lg">{icon}</span>
      {loading ? "Signing in…" : label}
    </motion.button>
  );

  return (
    <div className="grid gap-2">
      {/* Google */}
      <Btn
        icon={<FcGoogle />}
        label="Continue with Google"
        onClick={handleGoogleLogin}
        loading={googleLoading}
      />

      {/* Apple — coming soon */}
      <Btn
        icon={<SiApple className="text-white" />}
        label="Continue with Apple"
        onClick={handleAppleComingSoon}
      />
    </div>
  );
}