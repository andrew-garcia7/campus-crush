"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Lock, Eye, EyeOff, ArrowRight,
  Sparkles, ChevronDown, ShieldCheck,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { SiApple } from "react-icons/si";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

import { api } from "@/services/api";
import { auth as firebaseAuth } from "@/lib/firebase";
import { useAuthStore } from "@/store/auth-store";
import { useToastStore } from "@/store/toast-store";
import { LuxuryBackground } from "@/components/auth/luxury-background";

export default function LoginPage() {
  const router = useRouter();
  const toast = useToastStore((s) => s.push);
  const { setToken, setUser } = useAuthStore();

  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const redirectAfterAuth = (user: any) => {
    router.replace(user?.verificationStatus === "verified" ? "/discover" : "/verification");
  };

  const handleGoogle = async () => {
    if (googleLoading) return;
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result     = await signInWithPopup(firebaseAuth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (!credential?.idToken) throw new Error("Could not retrieve Google credentials.");
      const res = await api.post("/auth/google-login", { idToken: credential.idToken });
      const { token, user } = res.data.data;
      setToken(token);
      setUser(user);
      redirectAfterAuth(user);
    } catch (err: any) {
      if (
        err?.code === "auth/popup-closed-by-user" ||
        err?.code === "auth/cancelled-popup-request"
      ) return;
      if (err?.code === "auth/unauthorized-domain") {
        toast({
          title: "Domain not authorized",
          message: "This domain is not allowed for Google sign-in. Add it to Firebase Console → Authentication → Authorized Domains.",
          variant: "error",
        });
        return;
      }
      toast({
        title: "Google login failed",
        message: err?.response?.data?.message || err?.message || "Please try again.",
        variant: "error",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleApple = () =>
    toast({ title: "Apple login coming soon", message: "Use email or Google for now.", variant: "info" });

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill all fields"); return; }
    setError("");
    try {
      setLoading(true);
      const res = await api.post("/auth/login", { email, password });
      const { token, user } = res.data.data;
      if (token) setToken(token);
      if (user) setUser(user);
      toast({ title: "Welcome back!", variant: "success" });
      redirectAfterAuth(user);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LuxuryBackground>
      <div className="flex min-h-screen flex-col items-center justify-center px-5 py-14 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-[22rem]"
        >
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF2D78] shadow-[0_8px_24px_rgba(255,45,120,0.4)]">
              <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white"><path d="M12 21s-7.2-4.35-9.6-8.65C.7 9.15 2.1 5.9 5.1 4.8c1.9-.7 4 .05 5.2 1.6 1.2-1.55 3.3-2.3 5.2-1.6 3 1.1 4.4 4.35 2.7 7.55C19.2 16.65 12 21 12 21z" /></svg>
            </div>
            <h1 className="text-[2.2rem] font-extrabold leading-tight text-white drop-shadow-lg">
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm text-white/60">Your campus love story continues.</p>
          </div>

          {/* Card */}
          <div className="rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 p-6 shadow-[0_16px_48px_rgba(0,0,0,0.45)]">
            <div className="space-y-3">
              {/* Google */}
              <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoogle}
                disabled={googleLoading}
                type="button"
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white py-3.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-gray-300 hover:shadow disabled:opacity-60"
              >
                {googleLoading
                  ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-gray-600" />
                  : <FcGoogle className="text-xl" />
                }
                {googleLoading ? "Signing in…" : "Continue with Google"}
              </motion.button>

              {/* Apple */}
              <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleApple}
                type="button"
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#1a1a1a] py-3.5 text-sm font-semibold text-white transition hover:bg-black"
              >
                <SiApple className="text-xl" />
                Continue with Apple
              </motion.button>

              {/* Divider */}
              <div className="flex items-center gap-3 py-1">
                <div className="h-px flex-1 bg-white/20" />
                <span className="text-[11px] font-medium tracking-wide text-white/50">or use college email</span>
                <div className="h-px flex-1 bg-white/20" />
              </div>

              {/* Email toggle */}
              <motion.button
                onClick={() => setShowEmailForm(!showEmailForm)}
                type="button"
                className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/20 bg-white/[0.07] px-4 py-3.5 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/[0.12]"
              >
                <div className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-[#FF2D78]" />
                  College Email Login
                </div>
                <motion.div animate={{ rotate: showEmailForm ? 180 : 0 }} transition={{ duration: 0.25 }}>
                  <ChevronDown className="h-4 w-4 text-[#FF2D78]" />
                </motion.div>
              </motion.button>

              {/* Email form */}
              <AnimatePresence>
                {showEmailForm && (
                  <motion.form
                    key="email-form"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                    onSubmit={handleEmailLogin}
                  >
                    <div className="space-y-2.5 pt-1">
                      {/* Email */}
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#FF2D78]/50" />
                        <input
                          type="email"
                          placeholder="you@college.edu"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          autoComplete="email"
                          className="w-full rounded-2xl border border-white/20 bg-white/[0.08] py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-[#FF2D78] focus:ring-2 focus:ring-[#FF2D78]/30"
                        />
                      </div>

                      {/* Password */}
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#FF2D78]/50" />
                        <input
                          type={showPass ? "text" : "password"}
                          placeholder="Password"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          autoComplete="current-password"
                          className="w-full rounded-2xl border border-white/20 bg-white/[0.08] py-3.5 pl-11 pr-11 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-[#FF2D78] focus:ring-2 focus:ring-[#FF2D78]/30"
                        />
                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-[#FF2D78]">
                          {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>

                      {error && (
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-600">
                          {error}
                        </motion.div>
                      )}

                      {/* Submit */}
                      <motion.button
                        whileHover={{ scale: 1.01, boxShadow: "0 8px 28px rgba(255,45,120,0.5)" }}
                        whileTap={{ scale: 0.97 }}
                        disabled={loading}
                        type="submit"
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FF2D78] py-3.5 text-sm font-bold text-white shadow-[0_4px_18px_rgba(255,45,120,0.42)] transition disabled:opacity-60"
                      >
                        {loading
                          ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          : <><span>Login</span><ArrowRight className="h-4 w-4" /></>
                        }
                      </motion.button>

                      <Link href="/forgot-password" className="block text-center text-xs text-white/50 transition hover:text-[#FF2D78]">
                        Forgot password?
                      </Link>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center text-xs text-white/50">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-semibold text-[#FF2D78] transition hover:text-rose-400">
                Sign up free
              </Link>
            </div>
          </div>

          {/* Trust row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-5 flex items-center justify-center gap-4 text-[11px] text-white/50"
          >
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              Verified Only
            </span>
            <span className="text-white/25">•</span>
            <span>Campus Exclusive</span>
            <span className="text-white/25">•</span>
            <span>Real Students</span>
          </motion.div>
        </motion.div>
      </div>
    </LuxuryBackground>
  );
}
