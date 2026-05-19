"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function MobileScreen({
  title,
  subtitle,
  children,
  className
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="mx-auto flex w-full justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "editorial-card relative w-full max-w-[430px] rounded-[38px] p-4",
          className
        )}
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#fbcfe8]/16 blur-3xl" />
        <div className="pointer-events-none absolute -left-8 bottom-0 h-36 w-36 rounded-full bg-[#e9d5ff]/18 blur-3xl" />
        <div className="relative z-10 mb-4">
          <h1 className="editorial-title text-[2.2rem] leading-none">{title}</h1>
          {subtitle ? <p className="mt-2 text-xs tracking-[0.24em] text-[#f3dce8]/78 uppercase">{subtitle}</p> : null}
        </div>
        <div className="relative z-10">{children}</div>
      </motion.div>
    </div>
  );
}
