"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { AuthShell } from "@/components/auth/auth-shell";
import { FloatingLabelInput } from "@/components/auth/floating-label-input";
import { useToastStore } from "@/store/toast-store";

export default function ForgotPasswordPage() {
  const toast = useToastStore((s) => s.push);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextEmail = email.trim().toLowerCase();
    if (!nextEmail) {
      toast({ title: "Enter your email", message: "Add your college email to continue.", variant: "error" });
      return;
    }

    setLoading(true);
    try {
      toast({ title: "Reset link coming soon", message: `We will enable password reset for ${nextEmail}.`, variant: "info" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We will help you get back into your campus story."
      backgroundImageUrl="/assets/auth-romance-bg.jpeg"
    >
      <div className="space-y-4">
        <form className="space-y-3" onSubmit={onSubmit}>
          <FloatingLabelInput label="College email" value={email} onChange={setEmail} autoComplete="email" />

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="w-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 py-3 text-sm font-semibold text-white shadow-[0_0_30px_rgba(255,79,216,0.22)] disabled:opacity-60"
          >
            {loading ? "Preparing..." : "Send reset help"}
          </motion.button>
        </form>

        <Link href="/login" className="block text-center text-xs text-purple-200">
          Back to login
        </Link>
      </div>
    </AuthShell>
  );
}