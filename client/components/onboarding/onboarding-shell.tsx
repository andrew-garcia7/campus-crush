"use client";

import { motion } from "framer-motion";
import { ParticleDust } from "@/components/ui/particle-dust";
import { FloatingHearts } from "@/components/ui/floating-hearts";

export function OnboardingShell({
  title,
  subtitle,
  children,
  backgroundImageUrl
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  backgroundImageUrl: string;
}) {
  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10">
        <motion.div
          className="absolute inset-[-6%] bg-cover bg-center opacity-80"
          style={{ backgroundImage: `url(${backgroundImageUrl})` }}
          initial={{ scale: 1.04, x: 0, y: 0 }}
          animate={{ scale: [1.04, 1.1, 1.04], x: [0, -10, 8, 0], y: [0, -8, 6, 0] }}
          transition={{ duration: 18, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#120713]/24 via-[#180a1b]/52 to-[#120713]/78" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(233,213,255,0.2),transparent_35%),radial-gradient(circle_at_90%_15%,rgba(251,207,232,0.18),transparent_30%)]" />
        <ParticleDust />
        <FloatingHearts />
      </div>

      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="w-full max-w-[460px] rounded-[34px] border border-[#f7e7b2]/14 bg-[linear-gradient(180deg,rgba(45,22,50,0.7),rgba(28,12,33,0.82))] p-5 shadow-[0_22px_64px_rgba(11,4,13,0.24)] backdrop-blur-2xl"
        >
          <div className="mb-4">
            <p className="inline-flex items-center rounded-full border border-[#f7e7b2]/20 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#f4e4ec]">
              Campus Crush <span className="ml-2 text-[#f7e7b2]">AI</span>
            </p>
            <h1 className="editorial-title mt-3 text-[3rem]">{title}</h1>
            <p className="mt-2 text-sm text-[#f4e4ec]/80">{subtitle}</p>
          </div>
          {children}
        </motion.div>
      </div>
    </div>
  );
}

