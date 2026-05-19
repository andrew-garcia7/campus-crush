"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Crown, Lock, SlidersHorizontal, X } from "lucide-react";

export interface FilterValues {
  distance: number;          // km
  ageMin: number;
  ageMax: number;
  gender: string;
  campus: string;
  relationshipType: string;
  onlineOnly: boolean;
  ethnicity: string;
  careerAmbition: string;
  // premium
  religion: string;
  politics: string;
  smoking: string;
  drinking: string;
  heightMin: string;
  heightMax: string;
  education: string;
  zodiac: string;
  lifestyle: string;
}

const DEFAULT_FILTERS: FilterValues = {
  distance: 25,
  ageMin: 18,
  ageMax: 28,
  gender: "all",
  campus: "",
  relationshipType: "all",
  onlineOnly: false,
  ethnicity: "",
  careerAmbition: "",
  religion: "",
  politics: "",
  smoking: "",
  drinking: "",
  heightMin: "",
  heightMax: "",
  education: "",
  zodiac: "",
  lifestyle: "",
};

interface Props {
  open: boolean;
  onClose: () => void;
  isPremium?: boolean;
  onApply: (filters: FilterValues) => void;
  initial?: Partial<FilterValues>;
}

const GENDER_OPTIONS = ["all", "women", "men", "non-binary", "everyone"];
const RELATIONSHIP_TYPES = ["all", "serious relationship", "casual dating", "friends first", "still figuring it out"];
const SMOKING_OPTS = ["", "never", "socially", "regularly"];
const DRINKING_OPTS = ["", "never", "socially", "regularly"];
const ZODIAC_OPTS = ["", "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const EDUCATION_OPTS = ["", "Undergraduate", "Postgraduate", "PhD", "Diploma"];
const RELIGION_OPTS = ["", "Hindu", "Muslim", "Christian", "Sikh", "Jain", "Buddhist", "Agnostic", "Atheist", "Other"];
const POLITICS_OPTS = ["", "Progressive", "Moderate", "Conservative", "Apolitical"];
const ETHNICITY_OPTS = ["", "Asian", "South Asian", "East Asian", "Middle Eastern", "African", "Latino", "Caucasian", "Mixed", "Other"];
const CAREER_OPTS = ["", "Engineering", "Medicine", "Law", "Business", "Arts & Design", "Science", "Technology", "Education", "Entrepreneurship", "Other"];
const LIFESTYLE_OPTS = ["", "Active & Sporty", "Homebody", "Adventurous", "Foodie", "Bookworm", "Social Butterfly", "Night Owl", "Early Bird"];

function PremiumBadge() {
  return (
    <span className="flex items-center gap-1 rounded-full border border-yellow-400/20 bg-yellow-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-yellow-200">
      <Crown className="h-2.5 w-2.5" /> PREMIUM
    </span>
  );
}

function FreeBadge() {
  return (
    <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-200">
      FREE
    </span>
  );
}

function SelectRow({
  label,
  value,
  options,
  onChange,
  locked,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  locked?: boolean;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] text-[#9B7065]">{label}</label>
      <div className="relative">
        <select
          disabled={locked}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-pink-100 bg-[#FFF8F0] px-3 py-2 text-xs text-[#2D1810] outline-none focus:border-[#FF2D78] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {o || `Any ${label.toLowerCase()}`}
            </option>
          ))}
        </select>
        {locked && <Lock className="absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-yellow-400/60" />}
      </div>
    </div>
  );
}

export function FilterPanel({ open, onClose, isPremium = false, onApply, initial }: Props) {
  const [filters, setFilters] = useState<FilterValues>({ ...DEFAULT_FILTERS, ...initial });

  const set = (key: keyof FilterValues, value: FilterValues[keyof FilterValues]) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const reset = () => setFilters(DEFAULT_FILTERS);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col overflow-hidden border-l border-pink-100 bg-white shadow-[-20px_0_40px_rgba(255,45,120,0.1)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-pink-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-[#FF2D78]" />
                <h2 className="font-semibold text-[#2D1810]">Filter Preferences</h2>
              </div>
              <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-50 text-[#9B7065] hover:text-[#2D1810]">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-6 p-5">
                {/* FREE FILTERS */}
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#9B7065]">Free Filters</p>
                    <FreeBadge />
                  </div>
                  <div className="space-y-4">
                    {/* Distance */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] text-[#9B7065]">Distance</label>
                        <span className="text-xs font-medium text-[#FF2D78]">{filters.distance} km</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={100}
                        value={filters.distance}
                        onChange={(e) => set("distance", Number(e.target.value))}
                        className="w-full accent-[#FF2D78]"
                      />
                      <div className="flex justify-between text-[10px] text-[#9B7065]">
                        <span>1 km</span>
                        <span>100 km</span>
                      </div>
                    </div>

                    {/* Age range */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] text-[#9B7065]">Age range</label>
                        <span className="text-xs font-medium text-[#FF2D78]">{filters.ageMin} – {filters.ageMax}</span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min={18}
                          max={filters.ageMax - 1}
                          value={filters.ageMin}
                          onChange={(e) => set("ageMin", Number(e.target.value))}
                          className="w-full rounded-xl border border-pink-100 bg-[#FFF8F0] px-3 py-2 text-xs text-[#2D1810] outline-none focus:border-[#FF2D78]"
                          placeholder="Min"
                        />
                        <input
                          type="number"
                          min={filters.ageMin + 1}
                          max={60}
                          value={filters.ageMax}
                          onChange={(e) => set("ageMax", Number(e.target.value))}
                          className="w-full rounded-xl border border-pink-100 bg-[#FFF8F0] px-3 py-2 text-xs text-[#2D1810] outline-none focus:border-[#FF2D78]"
                          placeholder="Max"
                        />
                      </div>
                    </div>

                    {/* Gender */}
                    <SelectRow label="Gender preference" value={filters.gender} options={GENDER_OPTIONS} onChange={(v) => set("gender", v)} />

                    {/* Campus */}
                    <div className="space-y-1">
                      <label className="text-[11px] text-[#9B7065]">Nearby campus</label>
                      <input
                        type="text"
                        value={filters.campus}
                        onChange={(e) => set("campus", e.target.value)}
                        placeholder="e.g. LPU, DU, BITS"
                        className="w-full rounded-xl border border-pink-100 bg-[#FFF8F0] px-3 py-2 text-xs text-[#2D1810] outline-none placeholder:text-[#9B7065]/50 focus:border-[#FF2D78]"
                      />
                    </div>

                    {/* Ethnicity */}
                    <SelectRow label="Ethnicity" value={filters.ethnicity} options={ETHNICITY_OPTS} onChange={(v) => set("ethnicity", v)} />

                    {/* Career Ambition */}
                    <SelectRow label="Career ambition" value={filters.careerAmbition} options={CAREER_OPTS} onChange={(v) => set("careerAmbition", v)} />

                    {/* Relationship type */}
                    <SelectRow label="Relationship type" value={filters.relationshipType} options={RELATIONSHIP_TYPES} onChange={(v) => set("relationshipType", v)} />

                    {/* Online only */}
                    <label className="flex cursor-pointer items-center justify-between rounded-xl border border-purple-300/15 bg-white/[0.04] px-3 py-2.5">
                      <span className="text-xs text-[#9B7065]">Online users only</span>
                      <div
                        onClick={() => set("onlineOnly", !filters.onlineOnly)}
                        className={`relative h-5 w-9 rounded-full transition-colors ${filters.onlineOnly ? "bg-[#FF2D78]" : "bg-pink-100"}`}
                      >
                        <motion.div
                          animate={{ x: filters.onlineOnly ? 16 : 2 }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow"
                        />
                      </div>
                    </label>
                  </div>
                </div>

                {/* PREMIUM FILTERS */}
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#9B7065]">Premium Filters</p>
                    <PremiumBadge />
                  </div>

                  {!isPremium && (
                    <div className="mb-4 flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-3">
                      <Crown className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                      <div>
                        <p className="text-xs font-medium text-amber-800">Unlock premium filters</p>
                        <p className="mt-0.5 text-[11px] text-amber-700/80">Advanced compatibility, lifestyle & preference matching. Upgrade to Premium.</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <SelectRow label="Religion" value={filters.religion} options={RELIGION_OPTS} onChange={(v) => set("religion", v)} locked={!isPremium} />
                    <SelectRow label="Political views" value={filters.politics} options={POLITICS_OPTS} onChange={(v) => set("politics", v)} locked={!isPremium} />
                    <SelectRow label="Smoking" value={filters.smoking} options={SMOKING_OPTS} onChange={(v) => set("smoking", v)} locked={!isPremium} />
                    <SelectRow label="Drinking" value={filters.drinking} options={DRINKING_OPTS} onChange={(v) => set("drinking", v)} locked={!isPremium} />
                    <SelectRow label="Education" value={filters.education} options={EDUCATION_OPTS} onChange={(v) => set("education", v)} locked={!isPremium} />
                    <SelectRow label="Zodiac match" value={filters.zodiac} options={ZODIAC_OPTS} onChange={(v) => set("zodiac", v)} locked={!isPremium} />
                    <SelectRow label="Lifestyle" value={filters.lifestyle} options={LIFESTYLE_OPTS} onChange={(v) => set("lifestyle", v)} locked={!isPremium} />

                    {/* Height range */}
                    <div className={`space-y-1 ${!isPremium ? "opacity-40 pointer-events-none" : ""}`}>
                      <div className="flex items-center gap-2">
                        <label className="text-[11px] text-[#9B7065]">Height range</label>
                        {!isPremium && <Lock className="h-3 w-3 text-yellow-400/60" />}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={filters.heightMin}
                          onChange={(e) => set("heightMin", e.target.value)}
                          placeholder="Min e.g. 5ft 4in"
                          className="w-full rounded-xl border border-pink-100 bg-[#FFF8F0] px-3 py-2 text-xs text-[#2D1810] outline-none placeholder:text-[#9B7065]/50 focus:border-[#FF2D78]"
                        />
                        <input
                          type="text"
                          value={filters.heightMax}
                          onChange={(e) => set("heightMax", e.target.value)}
                          placeholder="Max e.g. 6ft 2in"
                          className="w-full rounded-xl border border-pink-100 bg-[#FFF8F0] px-3 py-2 text-xs text-[#2D1810] outline-none placeholder:text-[#9B7065]/50 focus:border-[#FF2D78]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Premium perks info */}
                {!isPremium && (
                  <div className="rounded-2xl border border-pink-100 bg-pink-50/40 p-4">
                    <p className="mb-2 text-xs font-semibold text-[#FF2D78]">Also unlocked with Premium:</p>
                    <ul className="space-y-1.5">
                      {["See who liked you", "Unlimited rewinds", "Priority visibility", "Advanced compatibility score"].map((f) => (
                        <li key={f} className="flex items-center gap-2 text-[11px] text-[#9B7065]">
                          <Crown className="h-3 w-3 text-amber-500 flex-shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-2 border-t border-pink-100 px-5 py-4">
              <button
                onClick={reset}
                className="flex-1 rounded-full border border-pink-100 bg-pink-50 py-2.5 text-xs font-medium text-[#9B7065] hover:border-pink-200"
              >
                Reset
              </button>
              <button
                onClick={() => { onApply(filters); onClose(); }}
                className="flex-1 rounded-full bg-[#FF2D78] py-2.5 text-xs font-semibold text-white hover:bg-[#e0195f]"
              >
                Apply filters
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
