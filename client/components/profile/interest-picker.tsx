"use client";

import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { INTEREST_CATEGORIES } from "@/lib/profile-options";

type InterestPickerProps = {
  value: string[];
  onChange: (value: string[]) => void;
};

export function InterestPicker({ value, onChange }: InterestPickerProps) {
  const [search, setSearch]       = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const pillsRef = useRef<HTMLDivElement>(null);
  const query    = search.trim().toLowerCase();

  // ── Internal selection state ──────────────────────────────────────────────
  // Managing selection internally makes toggle instant and race-condition-free.
  // We synchronise back to the parent via `onChange` and accept parent-driven
  // value changes (e.g. initial API load / save-success) via a signature check.
  const [selected, setSelected] = useState<string[]>(() => value);
  const lastSig = useRef(value.join("\0"));

  // Detect parent pushing a new value (API data loaded, save confirmed, etc.)
  const currentSig = value.join("\0");
  if (currentSig !== lastSig.current) {
    lastSig.current = currentSig;
    setSelected(value);
  }

  const toggle = (interest: string) => {
    setSelected((prev) => {
      const isIn = prev.includes(interest);
      if (!isIn && prev.length >= 10) return prev;   // cap reached
      const next = isIn
        ? prev.filter((i) => i !== interest)
        : [...prev, interest];
      // Notify parent asynchronously so we never block the state update
      setTimeout(() => onChange(next), 0);
      return next;
    });
  };

  // Flat list of chips based on category filter + search
  const visibleChips = useMemo<string[]>(() => {
    if (query) {
      const results: string[] = [];
      for (const cat of INTEREST_CATEGORIES) {
        for (const item of cat.items) {
          if (`${cat.name} ${item}`.toLowerCase().includes(query)) results.push(item);
        }
      }
      return results;
    }
    if (activeCategory === "All") return INTEREST_CATEGORIES.flatMap((c) => c.items);
    return INTEREST_CATEGORIES.find((c) => c.name === activeCategory)?.items ?? [];
  }, [query, activeCategory]);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[#2D1810]">Interests</p>
          <p className="text-xs text-[#9B7065]">Choose up to 10 that feel like you.</p>
        </div>
        <motion.span
          key={selected.length}
          animate={{ scale: [1.18, 1] }}
          transition={{ duration: 0.2 }}
          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
            selected.length >= 10
              ? "border-[#FF2D78]/40 bg-pink-50 text-[#FF2D78]"
              : "border-pink-200 bg-pink-50/60 text-[#9B7065]"
          }`}
        >
          {selected.length}/10
        </motion.span>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-2 rounded-xl border border-pink-200 bg-[#FFF8F0] px-3 py-2 transition focus-within:border-[#FF2D78]/40">
        <Search className="h-3.5 w-3.5 flex-shrink-0 text-[#9B7065]/60" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setActiveCategory("All"); }}
          placeholder="Search interests…"
          className="w-full bg-transparent text-xs text-[#2D1810] outline-none placeholder:text-[#9B7065]/50"
        />
        {search && (
          <button type="button" onClick={() => setSearch("")}>
            <X className="h-3.5 w-3.5 text-[#9B7065]/60 hover:text-[#FF2D78]" />
          </button>
        )}
      </div>

      {/* Category filter pills — horizontal scroll */}
      {!query && (
        <div
          ref={pillsRef}
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
        >
          {["All", ...INTEREST_CATEGORIES.map((c) => c.name)].map((cat) => {
            const isActive = activeCategory === cat;
            const catObj   = INTEREST_CATEGORIES.find((c) => c.name === cat);
            const count    = cat === "All"
              ? selected.length
              : catObj?.items.filter((i) => selected.includes(i)).length ?? 0;
            return (
              <motion.button
                key={cat}
                type="button"
                whileTap={{ scale: 0.93 }}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? "border-[#FF2D78]/30 bg-[#FF2D78] text-white shadow-[0_2px_8px_rgba(255,45,120,0.30)]"
                    : "border-pink-200 bg-pink-50/60 text-[#9B7065] hover:border-pink-300 hover:text-[#2D1810]"
                }`}
              >
                {catObj && <span>{catObj.icon}</span>}
                <span>{cat}</span>
                {count > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-px text-[9px] font-bold ${
                      isActive
                        ? "bg-white/30 text-white"
                        : "bg-pink-100 text-[#9B7065]"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Chips grid */}
      <div className="flex flex-wrap gap-2">
        {visibleChips.length === 0 && (
          <p className="py-3 text-xs text-[#9B7065]/60">No interests found.</p>
        )}
        {visibleChips.map((interest) => {
          const active   = selected.includes(interest);
          const disabled = !active && selected.length >= 10;
          return (
            <motion.button
              key={interest}
              type="button"
              whileHover={!disabled ? { scale: 1.04 } : {}}
              whileTap={!disabled ? { scale: 0.95 } : {}}
              onClick={() => toggle(interest)}
              disabled={disabled}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                active
                  ? "border-[#FF2D78]/40 bg-pink-50 text-[#FF2D78] shadow-[0_0_12px_rgba(255,45,120,0.18)]"
                  : "border-pink-200 bg-pink-50/40 text-[#2D1810] hover:border-pink-300 hover:bg-pink-50"
              } ${disabled ? "pointer-events-none opacity-40" : ""}`}
            >
              {interest}
            </motion.button>
          );
        })}
      </div>

      {/* Selected summary strip */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-t border-pink-100 pt-2.5">
          <span className="self-center text-[10px] font-semibold uppercase tracking-wider text-[#9B7065]/60">
            Selected:
          </span>
          {selected.map((interest) => (
            <motion.button
              key={interest}
              type="button"
              layout
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => toggle(interest)}
              className="flex items-center gap-1 rounded-full border border-[#FF2D78]/30 bg-pink-50 px-2.5 py-1 text-[11px] text-[#FF2D78] transition hover:bg-rose-50 hover:border-rose-400/40 hover:text-rose-500"
            >
              {interest}
              <X className="h-2.5 w-2.5 flex-shrink-0" />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}