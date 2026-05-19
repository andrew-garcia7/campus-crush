"use client";

import Link from "next/link";
import { FormEvent, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles,
  ChevronDown, Check, ShieldCheck, AlertCircle, GraduationCap,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { SiApple } from "react-icons/si";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

import { api } from "@/services/api";
import { auth as firebaseAuth } from "@/lib/firebase";
import { useAuthStore } from "@/store/auth-store";
import { useToastStore } from "@/store/toast-store";
import { COLLEGE_DOMAINS } from "@/lib/constants";
import { LuxuryBackground } from "@/components/auth/luxury-background";

function passStrength(p: string): number {
  if (!p) return 0;
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}

const STRENGTH_COLORS = ["bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-emerald-400"];
const STRENGTH_LABELS = ["Too weak", "Weak", "Fair", "Strong"];

export default function SignupPage() {
  const router = useRouter();
  const { setToken, setUser } = useAuthStore();
  const toast = useToastStore((s) => s.push);

  const [fullName, setFullName]   = useState("");
  const [university, setUniversity] = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [collegeOpen, setCollegeOpen] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError]         = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCollegeOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedCollege = COLLEGE_DOMAINS.find(c => c.name === university);
  const expectedDomain  = selectedCollege?.domain;
  const emailDomainOk   = !email || !expectedDomain || email.toLowerCase().endsWith(`@${expectedDomain}`);
  const emailPlaceholder = expectedDomain ? `you@${expectedDomain}` : "your@college.edu";

  const strength = passStrength(password);

  const redirectAfterAuth = (user: any) =>
    router.replace(user?.verificationStatus === "verified" ? "/discover" : "/verification");

  const handleGoogle = async () => {
    if (googleLoading) return;
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result     = await signInWithPopup(firebaseAuth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (!credential?.idToken) throw new Error("No credentials.");
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim())   { setError("Please enter your full name"); return; }
    if (!university)         { setError("Please select your college"); return; }
    if (!email.trim())       { setError("Please enter your college email"); return; }
    if (!emailDomainOk)      { setError(`Email must end with @${expectedDomain}`); return; }
    if (strength < 2)        { setError("Password is too weak â€” add numbers or symbols"); return; }

    try {
      setLoading(true);
      const res = await api.post("/auth/register", { fullName, email, password, university });
      const { token, user } = res.data.data;
      if (token) setToken(token);
      if (user)  setUser(user);
      toast({ title: "Account created! â¤ï¸", message: "Complete your verification to access the app.", variant: "success" });
      router.replace("/verification");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LuxuryBackground>
      <div className="flex min-h-screen flex-col items-center justify-center px-5 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-[22rem]"
        >
          {/* Header */}
          <div className="mb-5 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF2D78] shadow-[0_8px_24px_rgba(255,45,120,0.4)]">
              <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white"><path d="M12 21s-7.2-4.35-9.6-8.65C.7 9.15 2.1 5.9 5.1 4.8c1.9-.7 4 .05 5.2 1.6 1.2-1.55 3.3-2.3 5.2-1.6 3 1.1 4.4 4.35 2.7 7.55C19.2 16.65 12 21 12 21z" /></svg>
            </div>
            <h1 className="text-[2.2rem] font-extrabold leading-tight text-white drop-shadow-lg">Join today</h1>
            <p className="mt-1.5 text-sm text-white/60">Verified students only. Real campus connections.</p>
          </div>

          {/* Card */}
          <div className="rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 p-6 shadow-[0_16px_48px_rgba(0,0,0,0.45)]">
            <div className="space-y-3">
              {/* Google */}
              <motion.button whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }} onClick={handleGoogle} disabled={googleLoading} type="button"
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white py-3.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-gray-300 hover:shadow disabled:opacity-60">
                {googleLoading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-gray-600" /> : <FcGoogle className="text-xl" />}
                {googleLoading ? "Signing inâ€¦" : "Continue with Google"}
              </motion.button>

              {/* Apple */}
              <motion.button whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }} onClick={handleApple} type="button"
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#1a1a1a] py-3.5 text-sm font-semibold text-white transition hover:bg-black">
                <SiApple className="text-xl" /> Continue with Apple
              </motion.button>

              {/* Divider */}
              <div className="flex items-center gap-3 py-0.5">
                <div className="h-px flex-1 bg-white/20" />
                <span className="text-[11px] font-medium tracking-wide text-white/50">or sign up with college email</span>
                <div className="h-px flex-1 bg-white/20" />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-2.5">
                {/* Full Name */}
                <div className="relative">
                  <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#FF2D78]/50" />
                  <input type="text" placeholder="Full name" value={fullName} onChange={e => setFullName(e.target.value)} autoComplete="name"
                  className="w-full rounded-2xl border border-white/20 bg-white/[0.08] py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-[#FF2D78] focus:ring-2 focus:ring-[#FF2D78]/30" />
                </div>

                {/* College selector */}
                <div className="relative" ref={dropdownRef}>
                  <button type="button" onClick={() => setCollegeOpen(!collegeOpen)}
                    className={`flex w-full items-center justify-between rounded-2xl border bg-white/[0.08] backdrop-blur-sm py-3.5 pl-4 pr-4 text-sm transition ${
                      university ? "border-[#FF2D78]/50 text-white" : "border-white/20 text-white/50"
                    }`}>
                    <div className="flex items-center gap-2.5">
                      <GraduationCap className="h-4 w-4 shrink-0 text-[#FF2D78]/50" />
                      <span className="truncate">{university || "Select your college"}</span>
                    </div>
                    <motion.div animate={{ rotate: collegeOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown className="h-4 w-4 shrink-0 text-[#FF2D78]" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {collegeOpen && (
                      <motion.div initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.97 }} transition={{ duration: 0.2 }}
                        className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-56 overflow-y-auto rounded-2xl border border-white/20 bg-[#1a0a1e]/90 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                        {COLLEGE_DOMAINS.map(option => (
                          <button key={option.domain} type="button" onClick={() => { setUniversity(option.name); setCollegeOpen(false); setEmail(""); }}
                            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-white/90 transition hover:bg-white/10">
                            <div>
                              <p className="font-medium">{option.name}</p>
                              <p className="text-[11px] text-white/50">@{option.domain}</p>
                            </div>
                            {university === option.name && <Check className="h-4 w-4 shrink-0 text-[#FF2D78]" />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Email */}
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#FF2D78]/50" />
                  <input type="email" placeholder={emailPlaceholder} value={email} onChange={e => setEmail(e.target.value)} autoComplete="email"
                    className={`w-full rounded-2xl border bg-white/[0.08] py-3.5 pl-11 pr-10 text-sm text-white placeholder:text-white/35 outline-none transition ${
                      email && !emailDomainOk ? "border-red-400" : email && emailDomainOk ? "border-emerald-400" : "border-white/20 focus:border-[#FF2D78] focus:ring-2 focus:ring-[#FF2D78]/30"
                    }`} />
                  {email && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      {emailDomainOk ? <Check className="h-4 w-4 text-emerald-500" /> : <AlertCircle className="h-4 w-4 text-red-400" />}
                    </div>
                  )}
                </div>
                {email && !emailDomainOk && <p className="pl-1 text-[11px] text-red-400">Must end with @{expectedDomain}</p>}

                {/* Password */}
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#FF2D78]/50" />
                  <input type={showPass ? "text" : "password"} placeholder="Password (min. 8 characters)" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password"
                    className="w-full rounded-2xl border border-white/20 bg-white/[0.08] py-3.5 pl-11 pr-11 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-[#FF2D78] focus:ring-2 focus:ring-[#FF2D78]/30" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-[#FF2D78]">
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Strength bar */}
                {password && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-1">
                    <div className="flex gap-1 px-0.5">
                      {[1,2,3,4].map(level => (
                        <div key={level} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${strength >= level ? STRENGTH_COLORS[level-1] : "bg-white/20"}`} />
                      ))}
                    </div>
                    <p className="pl-0.5 text-[11px] text-white/50">{STRENGTH_LABELS[Math.max(0, strength-1)]}</p>
                  </motion.div>
                )}

                {/* Error */}
                {error && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2.5 text-xs text-red-300">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {error}
                  </motion.div>
                )}

                {/* Submit */}
                <motion.button whileHover={{ scale: 1.01, boxShadow: "0 8px 28px rgba(255,45,120,0.5)" }} whileTap={{ scale: 0.97 }} disabled={loading} type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FF2D78] py-4 text-sm font-bold text-white shadow-[0_4px_18px_rgba(255,45,120,0.42)] transition disabled:opacity-60">
                  {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <><span>Create Account</span><ArrowRight className="h-4 w-4" /></>}
                </motion.button>
              </form>

              {/* Footer */}
              <div className="mt-1 text-center text-xs text-white/50">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-[#FF2D78] transition hover:text-rose-400">Log in</Link>
              </div>
            </div>
          </div>

          {/* Trust row */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="mt-5 flex items-center justify-center gap-4 text-[11px] text-white/50">
            <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-emerald-400" />Verified Only</span>
            <span className="text-white/25">•</span>
            <span>AWS ID Check</span>
            <span className="text-white/25">•</span>
            <span>No Fakes</span>
          </motion.div>
        </motion.div>
      </div>
    </LuxuryBackground>
  );
}
