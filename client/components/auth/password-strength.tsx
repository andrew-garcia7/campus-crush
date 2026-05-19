"use client";

import { cn } from "@/lib/utils";

function scorePassword(pw: string) {
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (/[A-Z]/.test(pw)) score += 1;
  if (/[0-9]/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  return score; // 0..4
}

export function PasswordStrength({ password }: { password: string }) {
  const score = scorePassword(password);
  const label =
    score <= 1 ? "Weak" : score === 2 ? "Okay" : score === 3 ? "Strong" : "Elite";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-purple-100/70">Password strength</span>
        <span className={cn("font-semibold", score <= 1 ? "text-rose-300" : score === 2 ? "text-amber-200" : "text-emerald-200")}>
          {label}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 rounded-full bg-white/10",
              i < score && (score <= 1 ? "bg-rose-400/70" : score === 2 ? "bg-amber-300/70" : "bg-emerald-300/70")
            )}
          />
        ))}
      </div>
    </div>
  );
}

