"use client";

import { SunMedium } from "lucide-react";

export function ThemeIconToggle({ compact = false }: { compact?: boolean }) {
  const sizeClass = compact ? "h-10 w-10 rounded-xl" : "h-11 w-[64px] rounded-full";
  return (
    <div
      className={`relative flex items-center justify-center border ${sizeClass}`}
      style={{
        borderColor: "var(--surface-border)",
        background: "linear-gradient(135deg, rgba(255, 240, 193, 0.98), rgba(255, 221, 235, 0.96))",
        boxShadow: "var(--shadow-soft)",
      }}
    >
      <SunMedium className="h-4 w-4" style={{ color: "#F59E0B" }} />
    </div>
  );
}