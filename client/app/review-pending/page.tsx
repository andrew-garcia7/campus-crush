"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Clock, ShieldCheck, Heart, Sparkles, Mail, CheckCircle2, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useToastStore } from "@/store/toast-store";
import { api } from "@/services/api";

const STEPS = [
  { icon: CheckCircle2, label: "Email verified",   done: true  },
  { icon: ShieldCheck,  label: "Student ID uploaded", done: true  },
  { icon: CheckCircle2, label: "Selfie captured",  done: true  },
  { icon: Clock,        label: "Admin review",     done: false },
];

export default function ReviewPendingPage() {
  const router   = useRouter();
  const hydrated = useAuthStore((s) => s.hydrated);
  const token    = useAuthStore((s) => s.token);
  const user     = useAuthStore((s) => s.user);
  const setUser  = useAuthStore((s) => s.setUser);
  const pushToast = useToastStore((s) => s.push);
  const [checking, setChecking] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!hydrated) return;
    if (!token) { router.replace("/login"); return; }
    if (user?.verificationStatus === "verified") router.replace("/discover");
  }, [hydrated, token, user, router]);

  const handleCheckStatus = async () => {
    if (checking) return;
    setChecking(true);
    try {
      const res = await api.get("/auth/profile");
      const fetchedUser = res.data?.data?.user;
      if (fetchedUser) {
        setUser({ ...user, ...fetchedUser });
        if (fetchedUser.verificationStatus === "verified") {
          pushToast({ title: "You are verified!", message: "Welcome to Campus Crush.", variant: "success" });
          router.replace("/discover");
          return;
        } else if (fetchedUser.verificationStatus === "rejected") {
          pushToast({ title: "Verification rejected", message: "Please re-submit.", variant: "error" });
          router.replace("/verification");
          return;
        }
      }
      pushToast({ title: "Still under review", message: "We will notify you by email.", variant: "info" });
    } catch {
      pushToast({ title: "Status check failed", message: "Try again.", variant: "error" });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#07011a]">

      {/* Background glows */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/70 via-[#07011a] to-fuchsia-950/50" />
        <div className="absolute left-1/3 top-1/4 h-[500px] w-[500px] rounded-full bg-purple-700/10 blur-[140px]" />
        <div className="absolute right-1/4 bottom-1/3 h-[400px] w-[400px] rounded-full bg-amber-700/8 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-sm px-4 pb-20 pt-12">

        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex items-center justify-center gap-2">
          <Heart className="h-5 w-5 fill-fuchsia-500 text-fuchsia-500" />
          <span className="text-base font-bold tracking-tight text-white">
            Campus Crush <span className="text-fuchsia-400">AI</span>
          </span>
        </motion.div>

        {/* Hero icon */}
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 14 }}
          className="relative mx-auto mb-8 h-24 w-24">
          {/* Pulse ring */}
          <motion.div
            animate={{ scale: [1, 1.45, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2.4, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-amber-500/25" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 shadow-[0_0_50px_rgba(245,158,11,0.5)]">
            <Clock className="h-12 w-12 text-white" />
          </div>
        </motion.div>

        {/* Heading */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="mb-3 text-center">
          <h1 className="text-3xl font-bold text-white">Under Review</h1>
          <p className="mt-2 text-sm leading-relaxed text-purple-300/60">
            Your verification has been submitted and is now being reviewed by our team. This usually takes a few minutes.
          </p>
        </motion.div>

        {/* Progress checklist */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="mb-8 rounded-[28px] border border-white/[0.07] bg-white/[0.04] p-6 backdrop-blur-2xl">
          <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-purple-400/50">
            Verification Progress
          </p>
          <div className="flex flex-col gap-4">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border
                    ${s.done
                      ? "border-emerald-400/40 bg-emerald-500/15"
                      : "border-amber-400/40 bg-amber-500/15"}`}>
                    <Icon className={`h-4 w-4 ${s.done ? "text-emerald-400" : "text-amber-400"}`} />
                  </div>
                  <span className={`text-sm font-medium ${s.done ? "text-white" : "text-amber-300"}`}>
                    {s.label}
                  </span>
                  {!s.done && (
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="ml-auto text-[10px] font-semibold text-amber-400/70">
                      In progress
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* What happens next */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="mb-8 rounded-[28px] border border-fuchsia-300/10 bg-fuchsia-500/5 p-6">
          <div className="mb-3 flex items-center gap-2">
            <Mail className="h-4 w-4 text-fuchsia-400" />
            <p className="text-xs font-semibold uppercase tracking-widest text-fuchsia-400/60">
              What happens next
            </p>
          </div>
          <ul className="flex flex-col gap-2.5 text-sm text-purple-300/70">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-fuchsia-400/60" />
              Our team reviews your student ID and selfie for authenticity.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-fuchsia-400/60" />
              You will receive an email notification once approved.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-fuchsia-400/60" />
              Approved users unlock full access to matches, chat, and discover.
            </li>
          </ul>
        </motion.div>

        {/* CTA — check back */}
        <motion.button
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleCheckStatus}
          disabled={checking}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-600/80 to-purple-600/80 py-4 text-sm font-bold text-white shadow-[0_0_28px_rgba(196,70,255,0.3)] transition-all hover:shadow-[0_0_40px_rgba(196,70,255,0.5)] disabled:opacity-60 disabled:cursor-not-allowed">
          {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {checking ? "Checking…" : "Check approval status"}
        </motion.button>

        {/* Trust row */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="flex items-center justify-center gap-6 text-[11px] text-purple-400/35">
          <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Encrypted</span>
          <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> Private</span>
          <span className="flex items-center gap-1"><Sparkles className="h-3 w-3" /> Trusted</span>
        </motion.div>

      </div>
    </div>
  );
}
