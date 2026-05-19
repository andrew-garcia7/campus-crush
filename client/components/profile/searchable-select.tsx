"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";
import type { SearchOption } from "@/lib/profile-options";

type SearchableSelectProps = {
  label: string;
  value: string;
  options: SearchOption[];
  placeholder: string;
  onChange: (value: string) => void;
  allowCustomValue?: boolean;
  searchPlaceholder?: string;
  customValueLabel?: string;
};

export function SearchableSelect({
  label,
  value,
  options,
  placeholder,
  onChange,
  allowCustomValue = false,
  searchPlaceholder,
  customValueLabel
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return options;
    return options.filter((option) => `${option.label} ${option.searchText || ""}`.toLowerCase().includes(query));
  }, [options, search]);

  const activeLabel = options.find((option) => option.value === value)?.label || value;
  const trimmedSearch = search.trim();
  const showCustomAction = allowCustomValue && Boolean(trimmedSearch);

  return (
    <div className="space-y-1">
      <span className="text-xs font-medium text-[#9B7065]">{label}</span>
      <button
        type="button"
        onClick={() => {
          setOpen((current) => {
            const nextOpen = !current;
            if (nextOpen) {
              setSearch(value);
            } else {
              setSearch("");
            }
            return nextOpen;
          });
        }}
        className="flex w-full items-center justify-between rounded-2xl border border-pink-200 bg-[#FFF8F0] px-3 py-2.5 text-left text-sm text-[#2D1810] transition focus:border-[#FF2D78] focus:outline-none"
      >
        <span className={activeLabel ? "text-[#2D1810]" : "text-[#9B7065]/60"}>{activeLabel || placeholder}</span>
        <ChevronDown className={`h-4 w-4 text-[#9B7065] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="rounded-2xl border border-pink-100 bg-white p-2 shadow-[0_8px_24px_rgba(255,45,120,0.10)]">
            <div className="mb-2 flex items-center gap-2 rounded-xl border border-pink-100 bg-[#FFF8F0] px-3 py-2">
              <Search className="h-4 w-4 text-[#9B7065]" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={searchPlaceholder || `Search ${label.toLowerCase()}...`} className="w-full bg-transparent text-sm text-[#2D1810] outline-none placeholder:text-[#9B7065]/50" />
            </div>
            <div className="space-y-0.5">
              {showCustomAction ? (
                <button
                  type="button"
                  onClick={() => {
                    onChange(trimmedSearch);
                    setOpen(false);
                    setSearch("");
                  }}
                  className="block w-full rounded-xl border border-pink-100 bg-pink-50 px-3 py-2 text-left text-sm text-[#FF2D78] transition hover:bg-pink-100"
                >
                  {customValueLabel || "Use custom value"}: {trimmedSearch}
                </button>
              ) : null}
              {filtered.map((option) => (
                <button key={option.value} type="button" onClick={() => { onChange(option.value); setOpen(false); setSearch(""); }} className={`block w-full rounded-xl px-3 py-2 text-left text-sm transition ${option.value === value ? "bg-pink-50 text-[#FF2D78] font-medium" : "text-[#2D1810] hover:bg-pink-50/60"}`}>
                  {option.label}
                </button>
              ))}
              {!filtered.length ? <p className="px-3 py-2 text-sm text-[#9B7065]">No matches</p> : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}