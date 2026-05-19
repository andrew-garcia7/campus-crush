"use client";

import { cn } from "@/lib/utils";

export function StepProgress({
  steps,
  current
}: {
  steps: string[];
  current: number; // 0-based
}) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-4 gap-2">
        {steps.map((_, idx) => (
          <div
            key={idx}
            className={cn(
              "h-1.5 rounded-full bg-white/10",
              idx <= current && "bg-gradient-to-r from-purple-400/70 to-pink-400/70"
            )}
          />
        ))}
      </div>
      <div className="flex justify-between text-[11px] text-purple-100/70">
        {steps.map((s, idx) => (
          <span key={s} className={cn(idx === current && "text-pink-100")}>
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

