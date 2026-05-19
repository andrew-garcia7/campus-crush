"use client";

import { useEffect, useMemo, useRef } from "react";

export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled
}: {
  value: string;
  onChange: (v: string) => void;
  length?: number;
  disabled?: boolean;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = useMemo(() => {
    const arr = new Array(length).fill("");
    value.split("").slice(0, length).forEach((d, i) => (arr[i] = d));
    return arr;
  }, [value, length]);

  useEffect(() => {
    if (value.length === 0) refs.current[0]?.focus();
  }, [value]);

  const pasteDigits = (text: string) => {
    const cleaned = text.replace(/\D/g, "").slice(0, length);
    if (!cleaned) return;
    onChange(cleaned);
    const nextIndex = Math.min(cleaned.length, length - 1);
    refs.current[nextIndex]?.focus();
  };

  return (
    <div
      className="flex justify-between gap-2"
      onPaste={(e) => {
        e.preventDefault();
        pasteDigits(e.clipboardData.getData("text"));
      }}
    >
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          disabled={disabled}
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => {
            const nextRaw = e.target.value;
            if (nextRaw.length > 1) {
              pasteDigits(nextRaw);
              return;
            }
            const next = nextRaw.replace(/\D/g, "");
            const current = digits.join("").split("");
            current[i] = next;
            const merged = current.join("").slice(0, length);
            onChange(merged);
            if (next && i < length - 1) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
          }}
          className="h-12 w-12 rounded-2xl border border-purple-200/20 bg-white/10 text-center text-lg text-white outline-none transition focus:border-fuchsia-200/40 focus:shadow-[0_0_26px_rgba(255,79,216,0.24)] disabled:opacity-60"
        />
      ))}
    </div>
  );
}

