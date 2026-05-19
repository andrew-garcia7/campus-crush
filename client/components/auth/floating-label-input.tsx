"use client";

import { cn } from "@/lib/utils";

export function FloatingLabelInput({
  label,
  value,
  onChange,
  type = "text",
  name,
  autoComplete,
  disabled
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  name?: string;
  autoComplete?: string;
  disabled?: boolean;
}) {
  const hasValue = value.length > 0;

  return (
    <div className="relative">
      <input
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        disabled={disabled}
        className={cn(
          "peer w-full rounded-[22px] border border-[#f7e7b2]/14 bg-white/10 px-4 pb-3 pt-5 text-sm text-white outline-none",
          "shadow-[0_0_0px_rgba(255,79,216,0)] transition",
          "focus:border-[#f7e7b2]/35 focus:shadow-[0_14px_30px_rgba(231,184,164,0.12)]",
          disabled && "opacity-60"
        )}
        placeholder=" "
      />
      <label
        className={cn(
          "pointer-events-none absolute left-4 top-3 origin-left text-xs text-[#ecd9e4]/72 transition",
          "peer-focus:top-2 peer-focus:scale-90 peer-focus:text-[#fff7fb]",
          (hasValue || type === "password") && "top-2 scale-90"
        )}
      >
        {label}
      </label>
    </div>
  );
}

