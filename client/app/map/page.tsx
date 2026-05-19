"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle, BookOpen, Check, Coffee, Dumbbell, Edit2, Loader2,
  MapPin, Navigation, PlusCircle, RefreshCw, Search, Users, X, Zap,
} from "lucide-react";
import { useState } from "react";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/auth-store";
import { useMapData, PlaceCategory, Place, NearbyStudent, CampusInfo, CollegeSuggestion, haversineKm } from "@/hooks/use-map-data";
import { CATEGORY_META } from "@/components/map/LeafletMap";

// Dynamic import â€” Leaflet must never run on SSR
const LeafletMap = dynamic(() => import("@/components/map/LeafletMap"), { ssr: false });

// â”€â”€ Category chips â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const CHIPS: { id: PlaceCategory; label: string; icon: React.ReactNode; color: string }[] = [
  { id: "all",       label: "All",       icon: <MapPin    className="h-3 w-3" />, color: "#c026d3" },
  { id: "cafeteria", label: "Cafeteria", icon: <Coffee    className="h-3 w-3" />, color: "#f97316" },
  { id: "gym",       label: "Gym",       icon: <Dumbbell  className="h-3 w-3" />, color: "#10b981" },
  { id: "library",   label: "Library",   icon: <BookOpen  className="h-3 w-3" />, color: "#3b82f6" },
  { id: "hostel",    label: "Hostel",    icon: <Zap       className="h-3 w-3" />, color: "#a855f7" },
  { id: "sports",    label: "Sports",    icon: <Navigation className="h-3 w-3" />, color: "#eab308" },
];

// â”€â”€ Campus confirm banner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// ── City search bar ───────────────────────────────────────

function CitySearchBar({
  onSearch, loading, onUseLocation, locating,
}: {
  onSearch: (city: string) => void;
  loading: boolean;
  onUseLocation?: () => void;
  locating?: boolean;
}) {
  const [city, setCity] = useState("");
  return (
    <div className="px-5 pb-3">
      <div className="flex gap-2">
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && city.trim() && onSearch(city.trim())}
          placeholder="Search city (e.g. Delhi, Pune, Manipal)…"
          className="flex-1 rounded-xl border border-pink-100 bg-[#FFF8F0] px-3 py-2 text-sm text-[#2D1810] placeholder:text-[#9B7065]/60 focus:border-[#FF2D78] focus:outline-none"
        />
        <button
          onClick={() => city.trim() && onSearch(city.trim())}
          disabled={loading || !!locating || !city.trim()}
          className="flex items-center gap-1.5 rounded-xl bg-[#FF2D78] px-3 py-2 text-sm font-semibold text-white disabled:opacity-40 hover:bg-[#e0195f] transition-colors"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </button>
      </div>
      {onUseLocation && (
        <button
          onClick={onUseLocation}
          disabled={loading || !!locating}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-pink-100 bg-pink-50/60 py-1.5 text-[11px] font-medium text-[#9B7065] hover:border-pink-200 hover:text-[#2D1810] transition-colors disabled:opacity-40"
        >
          {locating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MapPin className="h-3.5 w-3.5" />}
          {locating ? "Detecting location…" : "Use My Location"}
        </button>
      )}
    </div>
  );
}

// ── College list panel ───────────────────────────────────

function CollegeList({
  colleges, loading, error, onSelect, onRetry,
}: {
  colleges: CollegeSuggestion[];
  loading: boolean;
  error: boolean;
  onSelect: (c: CollegeSuggestion) => void;
  onRetry: () => void;
}) {
  if (loading) {
    return (
      <div className="mx-5 mb-3 space-y-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-12 animate-pulse rounded-2xl border border-pink-100 bg-pink-50/40" />
        ))}
      </div>
    );
  }
  if (error) {
    return (
      <div className="mx-5 mb-3 flex items-center justify-between gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
        <span className="flex items-center gap-1.5 text-[11px] text-rose-600">
          <AlertTriangle className="h-3.5 w-3.5" /> Could not fetch colleges (Overpass timeout)
        </span>
        <button onClick={onRetry} className="text-[11px] text-rose-700 underline hover:text-rose-900 transition-colors">Retry</button>
      </div>
    );
  }
  if (!colleges.length) return null;
  return (
    <div className="mx-5 mb-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#9B7065]">
        {colleges.length} college{colleges.length !== 1 ? "s" : ""} found — tap to select
      </p>
      <div className="flex max-h-52 flex-col gap-1.5 overflow-y-auto scrollbar-hide">
        {colleges.map((c) => (
          <motion.button
            key={c.id}
            whileHover={{ scale: 1.01 }}
            onClick={() => onSelect(c)}
          className="flex w-full items-center justify-between gap-3 rounded-2xl border border-pink-100 bg-white px-4 py-2.5 text-left hover:border-pink-200 hover:bg-pink-50/40 transition-all"
          >
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-[#2D1810]">{c.name}</p>
              <p className="truncate text-[10px] text-[#9B7065]">
                {c.distanceKm != null
                  ? (c.distanceKm < 1
                    ? `${Math.round(c.distanceKm * 1000)}m away`
                    : `${c.distanceKm.toFixed(1)} km away`)
                  : c.address || ""}
              </p>
            </div>
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase"
              style={{
                background: c.type === "university" ? "rgb(239,246,255)" : "rgb(240,253,250)",
                color:      c.type === "university" ? "#2563eb"            : "#0f766e",
              }}
            >
              {c.type}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ── Manual campus entry (when no colleges detected) ─────────────────

function ManualCampusEntry({
  lat,
  lng,
  onSave,
  onDismiss,
}: {
  lat: number;
  lng: number;
  onSave: (c: CampusInfo) => void;
  onDismiss: () => void;
}) {
  const [name,   setName]   = useState("");
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) { setError("Please enter a campus name"); return; }
    setSaving(true);
    setError("");
    try {
      const fc  = await api.post("/campus/find-or-create", { name: trimmed, lat, lng, city: "" });
      const cId = fc.data?.data?._id;
      if (cId) await api.post("/campus/join", { campusId: cId, lat, lng });
      onSave({ name: trimmed, city: "", lat, lng, id: cId });
    } catch {
      setError("Could not save campus — please try again");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mx-5 mb-3 rounded-2xl border border-amber-200 bg-amber-50/60 p-4"
    >
      <div className="mb-2 flex items-center gap-2">
        <PlusCircle className="h-4 w-4 text-amber-600" />
        <p className="text-[11px] font-semibold text-amber-700">No campus detected — add yours</p>
        <button
          onClick={onDismiss}
          className="ml-auto text-[#9B7065] hover:text-[#2D1810] transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <input
        value={name}
        onChange={(e) => { setName(e.target.value); setError(""); }}
        onKeyDown={(e) => e.key === "Enter" && handleSave()}
        placeholder="e.g. LPU, IIT Delhi, VIT Vellore…"
        className="mb-2 w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm text-[#2D1810] placeholder:text-[#9B7065]/60 focus:border-amber-400 focus:outline-none"
      />
      {error && (
        <p className="mb-2 flex items-center gap-1.5 text-[11px] text-rose-600">
          <AlertTriangle className="h-3 w-3" /> {error}
        </p>
      )}
      <button
        onClick={handleSave}
        disabled={saving || !name.trim()}
        className="flex w-full items-center justify-center gap-1.5 rounded-full bg-amber-500 px-4 py-1.5 text-[11px] font-semibold text-white disabled:opacity-50"
      >
        {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
        {saving ? "Saving…" : "Add & Join Campus"}
      </button>
    </motion.div>
  );
}

// ── Campus confirm banner ─────────────────────────────────────────────────────

function CampusConfirmBanner({
  campus, onConfirm, onDismiss,
}: { campus: CampusInfo; onConfirm: (c: CampusInfo) => void; onDismiss: () => void }) {
  const [editing, setEditing] = useState(false);
  const [name,    setName]    = useState(campus.name);
  const [saving,  setSaving]  = useState(false);

  const handleConfirm = async () => {
    setSaving(true);
    const finalName = name.trim() || campus.name;
    try {
      const fc  = await api.post("/campus/find-or-create", {
        name: finalName, lat: campus.lat, lng: campus.lng, city: campus.city,
      });
      const cId = fc.data?.data?._id;
      if (cId) await api.post("/campus/join", { campusId: cId, lat: campus.lat, lng: campus.lng });
      onConfirm({ ...campus, name: finalName, id: cId });
    } catch {
      onConfirm({ ...campus, name: finalName });
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mx-5 mb-3 rounded-2xl border border-pink-200 bg-pink-50/60 p-4"
    >
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#9B7065]">
        Campus detected â€” confirm to join
      </p>
      {editing ? (
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-2 w-full rounded-xl border border-pink-100 bg-white px-3 py-1.5 text-sm text-[#2D1810] focus:outline-none focus:border-[#FF2D78]"
        />
      ) : (
          <p className="mb-0.5 text-sm font-semibold text-[#2D1810]">{name}</p>
      )}
      {campus.city && <p className="mb-3 text-[11px] text-[#9B7065]">{campus.city}</p>}
      <div className="flex gap-2">
        <button
          onClick={() => setEditing((v) => !v)}
          className="flex items-center gap-1.5 rounded-full border border-pink-100 bg-pink-50 px-3 py-1.5 text-[11px] text-[#9B7065] hover:border-pink-200 transition-colors"
        >
          <Edit2 className="h-3 w-3" />{editing ? "Done" : "Edit"}
        </button>
        <button
          onClick={handleConfirm}
          disabled={saving}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#FF2D78] px-4 py-1.5 text-[11px] font-semibold text-white disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
          {saving ? "Joiningâ€¦" : "Join Campus"}
        </button>
        <button
          onClick={onDismiss}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-pink-100 bg-pink-50 text-[#9B7065] hover:text-[#2D1810] transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

// â”€â”€ Place tooltip overlay â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function PlaceOverlay({
  place, onClose, centerLat, centerLng,
}: {
  place: Place; onClose: () => void;
  centerLat?: number; centerLng?: number;
}) {
  const meta    = CATEGORY_META[place.category as Exclude<PlaceCategory, "all">];
  const distKm  = centerLat != null && centerLng != null
    ? haversineKm(centerLat, centerLng, place.lat, place.lng)
    : null;
  const distTxt = distKm != null
    ? (distKm < 1 ? `${Math.round(distKm * 1000)}m away` : `${distKm.toFixed(1)} km away`)
    : null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between gap-2 rounded-2xl border border-pink-100 bg-white/95 px-4 py-2.5"
    >
      <div className="flex items-center gap-2">
        <span className="text-base">{meta?.emoji ?? "📍"}</span>
        <div>
          <p className="text-sm font-semibold text-[#2D1810]">{place.name}</p>
          <p className="text-[10px] capitalize text-[#9B7065]">
            {place.category}{distTxt ? ` · ${distTxt}` : ""}
          </p>
        </div>
      </div>
      <button onClick={onClose} className="text-[#9B7065] hover:text-[#2D1810] transition-colors">
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}


export default function MapPage() {
  const user = useAuthStore((s) => s.user);
  const {
    userLat, userLng, locError, locLoading,
    campus, campusLoading, campusNotFound,
    colleges, collegesLoading, collegesError,
    places, placesLoading, placesError,
    students, studentsLoading, studentsError,
    refresh, refreshStudents, setCampusManually, searchCity, fetchCollegesNear, loadAt,
  } = useMapData();

  const [activeCategory,  setActiveCategory]  = useState<PlaceCategory>("all");
  const [selectedPlace,   setSelectedPlace]   = useState<Place | null>(null);
  const [confirmedCampus, setConfirmedCampus] = useState(false);
  const [dismissedBanner, setDismissedBanner] = useState(false);
  const [confirmedName,   setConfirmedName]   = useState<string | null>(null);
  const [mapCenter,       setMapCenter]       = useState<[number, number] | null>(null);
  const [locating,        setLocating]        = useState(false);

  const center: [number, number] =
    mapCenter ?? (userLat != null && userLng != null ? [userLat, userLng] : [20.5937, 78.9629]);

  const handleUseLocation = () => {
    if (!navigator?.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        fetchCollegesNear(pos.coords.latitude, pos.coords.longitude, 5);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  const handleCollegeSelect = async (c: CollegeSuggestion) => {
    try {
      const fc  = await api.post("/campus/find-or-create", { name: c.name, lat: c.lat, lng: c.lng, city: "" });
      const cId = fc.data?.data?._id;
      if (cId) await api.post("/campus/join", { campusId: cId, lat: c.lat, lng: c.lng });
    } catch { /* non-blocking */ }
    setCampusManually(c.name, c.lat, c.lng);
    setMapCenter([c.lat, c.lng]);
    loadAt(c.lat, c.lng);
    setConfirmedCampus(true);
    setConfirmedName(c.name);
  };

  const countFor = (cat: PlaceCategory) =>
    cat === "all" ? places.length : places.filter((p) => p.category === cat).length;

  const alreadyHasCampus = !!(user as any)?.campusId || !!(user as any)?.university || confirmedCampus;

  // Show college list or manual entry (only before confirming campus)
  const showCollegePanel = !confirmedCampus && !alreadyHasCampus;

  // Show manual entry only when no colleges found and not loading
  const showManualEntry =
    showCollegePanel && campusNotFound && !collegesLoading && colleges.length === 0 &&
    !dismissedBanner;

  // Show confirm banner when Nominatim DID detect an institution name (legacy path)
  const showBanner =
    campus !== null && !!campus.name && !campusNotFound &&
    !campusLoading && !confirmedCampus &&
    !dismissedBanner && !alreadyHasCampus;

  const campusLabel =
    confirmedName ?? (user as any)?.university ?? campus?.name ?? "";

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-pink-100 bg-white shadow-[0_4px_24px_rgba(255,45,120,0.08)]"
      >
        {/* Header */}
        <div className="relative px-5 pt-6 pb-4">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-violet-500/15 blur-2xl" />
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-[#2D1810]">Campus Map</h1>
              <p className="text-xs text-[#9B7065]">
                {campusLabel ? <>{campusLabel} · </> : null}
                {studentsLoading ? "loading…" : `${students.length} nearby`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] text-emerald-700">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </div>
              <button
                onClick={refresh}
                disabled={placesLoading || studentsLoading}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-pink-100 bg-pink-50 text-[#9B7065] hover:text-[#2D1810] transition-colors disabled:opacity-40"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${placesLoading || studentsLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {locError && !locLoading && (
            <p className="mt-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-[11px] text-rose-600">
              📍 {locError} – using approximate location
            </p>
          )}
          {locLoading && (
            <div className="mt-2 flex items-center gap-2 text-xs text-[#9B7065]">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Detecting your location…
            </div>
          )}
        </div>

        {/* City search + Use My Location */}
        {showCollegePanel && (
          <CitySearchBar
            onSearch={searchCity}
            loading={collegesLoading}
            onUseLocation={handleUseLocation}
            locating={locating}
          />
        )}

        {/* College list */}
        {showCollegePanel && (
          <CollegeList
            colleges={colleges}
            loading={collegesLoading}
            error={collegesError}
            onSelect={handleCollegeSelect}
            onRetry={() => {
              const c = { lat: userLat ?? 20.5937, lng: userLng ?? 78.9629 };
              fetchCollegesNear(c.lat, c.lng);
            }}
          />
        )}

        {/* ── Campus banners (mutually exclusive) ─────────────────────────── */}
        <AnimatePresence>
          {showManualEntry && (
            <ManualCampusEntry
              lat={userLat ?? 0}
              lng={userLng ?? 0}
              onSave={(c) => {
                setCampusManually(c.name);
                setConfirmedCampus(true);
                setConfirmedName(c.name);
              }}
              onDismiss={() => setDismissedBanner(true)}
            />
          )}
          {showBanner && campus && (
            <CampusConfirmBanner
              campus={campus}
              onConfirm={(c) => { setConfirmedCampus(true); setConfirmedName(c.name); }}
              onDismiss={() => setDismissedBanner(true)}
            />
          )}
        </AnimatePresence>

        {/* Map */}
        <div
          className="relative mx-5 mb-4 overflow-hidden rounded-3xl border border-pink-100"
          style={{ height: 320 }}
        >
          <LeafletMap
            center={center}
            places={places}
            students={students}
            colleges={colleges}
            activeCategory={activeCategory}
            onPlaceClick={(p) => setSelectedPlace(p === selectedPlace ? null : p)}
            onStudentClick={() => {}}
            onCollegeClick={handleCollegeSelect}
          />
          {placesLoading && (
            <div className="pointer-events-none absolute inset-0 flex items-start justify-center pt-3">
              <div className="flex items-center gap-1.5 rounded-full border border-pink-100 bg-white/90 px-3 py-1.5 text-[11px] text-[#9B7065]">
                <Loader2 className="h-3 w-3 animate-spin" />
                Fetching nearby places…
              </div>
            </div>
          )}
          <AnimatePresence>
            {selectedPlace && (
              <PlaceOverlay
                place={selectedPlace}
                onClose={() => setSelectedPlace(null)}
                centerLat={center[0]}
                centerLng={center[1]}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Category chips */}
        <div className="px-5 pb-4">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CHIPS.map((chip) => {
              const count  = countFor(chip.id);
              const active = activeCategory === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => setActiveCategory(active ? "all" : chip.id)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium transition-all ${
                    active
                      ? "border-[#FF2D78]/50 bg-[#FF2D78]/10 text-[#FF2D78] shadow-[0_2px_8px_rgba(255,45,120,0.2)]"
                      : "border-pink-100 bg-pink-50/60 text-[#9B7065] hover:border-pink-200"
                  }`}
                >
                  {chip.icon}
                  {chip.label}
                  {count > 0 && (
                    <span
                      className="rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                      style={{
                        background: active ? `${chip.color}22` : "rgba(255,45,120,0.06)",
                        color:      active ? chip.color         : "#9B7065",
                      }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {!placesLoading && places.length === 0 && (
              <div className="mt-2 flex items-center justify-between gap-2 rounded-xl border border-pink-100 bg-[#FFF8F0] px-3 py-2.5 text-[11px] text-[#9B7065]">
              <span>Limited OSM data in this area. Try zooming in or refreshing.</span>
              <button
                onClick={refresh}
                className="flex items-center gap-1 shrink-0 rounded-full border border-pink-100 bg-pink-50 px-2.5 py-1 text-[10px] hover:border-pink-200 hover:text-[#2D1810] transition-colors"
              >
                <RefreshCw className="h-3 w-3" /> Refresh
              </button>
            </div>
          )}
          {placesError && !placesLoading && (
            <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-rose-600">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="h-3 w-3" /> Places unavailable (Overpass timeout)
              </span>
              <button onClick={refresh} className="underline hover:text-red-200 transition-colors">Retry</button>
            </div>
          )}
        </div>

        {/* Nearby students */}
        <div className="px-5 pb-6">
          <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#9B7065]">
              Nearby Students
            </p>
            <div className="flex items-center gap-2">
              {students.length > 0 && !studentsLoading && (
                <span className="rounded-full border border-pink-200 bg-pink-50 px-2 py-0.5 text-[10px] text-[#FF2D78]">
                  {students.length} within 1km
                </span>
              )}
              {studentsLoading && students.length > 0 && (
                <Loader2 className="h-3 w-3 animate-spin text-[#9B7065]" />
              )}
            </div>
          </div>
          {studentsLoading && students.length === 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-2xl border border-pink-100 bg-pink-50/40 p-2 text-center">
                  <div className="mx-auto mb-1.5 h-10 w-10 animate-pulse rounded-full bg-pink-100" />
                  <div className="mx-auto mb-1 h-2 w-14 animate-pulse rounded-full bg-pink-100" />
                  <div className="mx-auto h-1.5 w-8 animate-pulse rounded-full bg-pink-100" />
                </div>
              ))}
            </div>
          ) : studentsError ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-pink-100 bg-pink-50/40 py-5 text-center">
              <AlertTriangle className="h-6 w-6 text-red-400/60" />
              <div>
                <p className="text-xs font-medium text-rose-600">Could not load nearby students</p>
                <p className="text-[10px] text-[#9B7065]">Check your connection or location permission</p>
              </div>
              <button
                onClick={refreshStudents}
                className="flex items-center gap-1.5 rounded-full border border-pink-200 bg-pink-50 px-4 py-1.5 text-[11px] font-medium text-[#FF2D78] hover:border-pink-300 transition-colors"
              >
                <RefreshCw className="h-3 w-3" /> Retry
              </button>
            </div>
          ) : students.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-pink-100 bg-pink-50/40 py-6 text-center">
                <Users className="h-7 w-7 text-pink-300" />
              <div>
                <p className="text-xs font-medium text-[#2D1810]">No students nearby yet</p>
                <p className="text-[10px] text-[#9B7065] mt-0.5">Students appear when they share location within 1km</p>
              </div>
              <button
                onClick={refreshStudents}
                className="flex items-center gap-1.5 rounded-full border border-pink-100 bg-pink-50 px-4 py-1.5 text-[11px] font-medium text-[#9B7065] hover:border-pink-200 hover:text-[#2D1810] transition-colors"
              >
                <RefreshCw className="h-3 w-3" /> Check again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {students.slice(0, 9).map((s) => (
                <motion.div
                  key={s.id}
                  whileHover={{ scale: 1.04 }}
                  className="rounded-2xl border border-pink-100 bg-white p-2 text-center cursor-pointer hover:border-pink-200"
                >
                  <div
                    className="mx-auto mb-1.5 h-10 w-10 rounded-full border border-pink-200 bg-gradient-to-br from-pink-100 to-rose-100 bg-cover bg-center"
                    style={s.photo ? { backgroundImage: `url(${s.photo})` } : {}}
                  />
                  <p className="truncate text-[11px] font-medium text-[#2D1810]">{s.name.split(" ")[0]}</p>
                  <p className="text-[9px] text-[#9B7065]">{s.age}y · {s.zone}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
