"use client";

import { motion } from "framer-motion";
import { LuxuryBackground } from "@/components/auth/luxury-background";

export function AuthShell({
  title,
  subtitle,
  children,
  backgroundImageUrl = "/assets/auth-romance-bg.jpeg",
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  backgroundImageUrl?: string;
}) {
  return (
    <LuxuryBackground imageUrl={backgroundImageUrl}>
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="w-full rounded-[35px] border border-white/20 bg-white/10 p-8 shadow-[0_25px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">

            {/* Brand badge */}
            <div className="mb-6">
              <div className="inline-block rounded-full border border-pink-400/30 px-4 py-1 text-xs tracking-[3px] text-pink-200">
                CAMPUS CRUSH AI
              </div>
              <h1 className="mt-4 text-4xl font-bold text-white leading-tight">{title}</h1>
              <p className="mt-2 text-sm text-gray-300">{subtitle}</p>
            </div>

            {children}
          </div>
        </motion.div>
      </div>
    </LuxuryBackground>
  );
}


