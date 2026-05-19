"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Edit2, Loader2, MapPin, Search, X } from "lucide-react";
import { api } from "@/services/api";

export interface CampusResult {
  id?:  string;
  name: string;
  city: string;
  lat:  number;
  lng:  number;
}

interface Props {
  onConfirm: (campus: CampusResult) => void;
  onClose:   () => void;
}

async function reverseGeocode(lat: number, lng: number): Promise<{ name: string; city: string }> {
  try {
    const url =
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
    const res  = await fetch(url, { headers: { "Accept-Language": "en" } });
    const data = await res.json();

    const addr = data.address || {};
    // Try to pick the most relevant campus/institution name
    const name =
      addr.amenity      ||
      addr.building     ||
      addr.university   ||
      addr.college      ||
      addr.school       ||
      addr.office       ||
      addr.road         ||
      data.display_name?.split(",")[0] ||
      "My Campus";

    const city =
      addr.city        ||
      addr.town        ||
      addr.village     ||
      addr.county      ||
      addr.state_district ||
      addr.state       ||
      "";

    return { name, city };
  } catch {
    return { name: "My Campus", city: "" };
  }
}

async function forwardGeocode(query: string): Promise<[number, number] | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=in`;
    const res  = await fetch(url, { headers: { "Accept-Language": "en" } });
    const data = await res.json();
    if (data[0]) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  } catch {}
  return null;
}

interface CitySuggestion {
  displayName: string;
  shortName:   string;
  lat:         number;
  lon:         number;
  count?:      number;
}

async function fetchCollegeCount(lat: number, lon: number): Promise<number> {
  try {
    const body = [
      "[out:json][timeout:10];",
      "(",
      `nwr["amenity"="university"](around:20000,${lat},${lon});`,
      `nwr["amenity"="college"](around:20000,${lat},${lon});`,
      ");",
      "out count;",
    ].join("\n");
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:    `data=${encodeURIComponent(body)}`,
    });
    const data = await res.json();
    const el = data.elements?.find((e: any) => e.type === "count");
    return parseInt(el?.tags?.total ?? "0", 10);
  } catch {
    return 0;
  }
}

interface CollegeItem {
  name: string;
  type: "university" | "college";
  lat:  number;
  lon:  number;
  website?: string;
}

async function fetchCollegesInCity(lat: number, lon: number): Promise<CollegeItem[]> {
  try {
    const body = [
      "[out:json][timeout:25];",
      "(",
      `node["amenity"="university"](around:20000,${lat},${lon});`,
      `way["amenity"="university"](around:20000,${lat},${lon});`,
      `relation["amenity"="university"](around:20000,${lat},${lon});`,
      `node["amenity"="college"](around:20000,${lat},${lon});`,
      `way["amenity"="college"](around:20000,${lat},${lon});`,
      `relation["amenity"="college"](around:20000,${lat},${lon});`,
      ");",
      "out center;",
    ].join("\n");
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:    `data=${encodeURIComponent(body)}`,
    });
    const data = await res.json();
    const out: CollegeItem[] = [];
    for (const el of (data.elements ?? [])) {
      const name = el.tags?.["name"] || el.tags?.["name:en"];
      if (!name) continue;
      const elLat = el.lat ?? el.center?.lat;
      const elLon = el.lon ?? el.center?.lon;
      if (!elLat || !elLon) continue;
      out.push({
        name,
        type: el.tags?.amenity === "university" ? "university" : "college",
        lat:  elLat,
        lon:  elLon,
        website: el.tags?.website,
      });
    }
    return out.sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

export default function CampusPicker({ onConfirm, onClose }: Props) {
  const mapRef       = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markerRef    = useRef<any>(null);

  const [lat,        setLat]        = useState<number | null>(null);
  const [lng,        setLng]        = useState<number | null>(null);
  const [detected,   setDetected]   = useState<{ name: string; city: string } | null>(null);
  const [editing,    setEditing]    = useState(false);
  const [editName,   setEditName]   = useState("");
  const [geocoding,  setGeocoding]  = useState(false);
  const [searchQ,    setSearchQ]    = useState("");
  const [searching,  setSearching]  = useState(false);
  const [locating,   setLocating]   = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [suggestions,        setSuggestions]        = useState<CitySuggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [showSuggestions,    setShowSuggestions]    = useState(false);
  const [cityColleges,       setCityColleges]       = useState<CollegeItem[]>([]);
  const [cityCollegesLoading,setCityCollegesLoading]= useState(false);
  const [selectedCity,       setSelectedCity]       = useState<string>("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── init Leaflet ───────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    import("leaflet").then((L) => {
      if (!containerRef.current || mapRef.current) return;

      // @ts-ignore
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current!, {
        center:           [20.5937, 78.9629], // India centre
        zoom:             5,
        zoomControl:      true,
        scrollWheelZoom:  true,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      // Force full tile render after modal entrance animation settles
      setTimeout(() => map.invalidateSize(), 400);

      // Try to get user's current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            map.setView([latitude, longitude], 17);
          },
          () => { /* denied — stay at India centre */ }
        );
      }

      const pinIcon = L.divIcon({
        className: "",
        html: `<div style="
          width:36px; height:36px; border-radius:50% 50% 50% 0;
          background:linear-gradient(135deg,#8b5cf6,#ec4899);
          transform:rotate(-45deg);
          border:2px solid #c026d3;
          box-shadow:0 0 14px rgba(192,38,211,0.8);
        "></div>`,
        iconSize:   [36, 36],
        iconAnchor: [18, 36],
      });

      map.on("click", async (e: any) => {
        const { lat: cLat, lng: cLng } = e.latlng;

        // Move / add marker
        if (markerRef.current) {
          markerRef.current.setLatLng([cLat, cLng]);
        } else {
          markerRef.current = L.marker([cLat, cLng], { icon: pinIcon }).addTo(map);
        }

        setLat(cLat);
        setLng(cLng);
        setDetected(null);
        setEditing(false);
        setGeocoding(true);

        const info = await reverseGeocode(cLat, cLng);
        setDetected(info);
        setEditName(info.name);
        setGeocoding(false);
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // ── search box ────────────────────────────────────────────────
  const handleSearch = async () => {
    if (!searchQ.trim() || !mapRef.current) return;
    setSearching(true);
    const coords = await forwardGeocode(searchQ);
    setSearching(false);
    if (coords) mapRef.current.setView(coords, 17);
  };

  // ── city autocomplete ─────────────────────────────────────────
  const fetchCitySuggestions = async (q: string) => {
    setSuggestionsLoading(true);
    setShowSuggestions(true);
    setSuggestions([]);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&countrycodes=in&addressdetails=1`;
      const res  = await fetch(url, { headers: { "Accept-Language": "en" } });
      const data = await res.json();
      const raw: CitySuggestion[] = (data as any[]).map((item) => {
        const addr = item.address || {};
        const shortName =
          addr.city || addr.town || addr.village || addr.county ||
          item.display_name.split(",")[0];
        return { displayName: item.display_name, shortName, lat: parseFloat(item.lat), lon: parseFloat(item.lon) };
      });
      setSuggestions(raw);
      setSuggestionsLoading(false);
      // load college counts in parallel
      const withCounts = await Promise.all(
        raw.map(async (s) => ({ ...s, count: await fetchCollegeCount(s.lat, s.lon) }))
      );
      setSuggestions(withCounts);
    } catch {
      setSuggestionsLoading(false);
    }
  };

  const handleSuggestionSelect = async (s: CitySuggestion) => {
    setSearchQ(s.shortName);
    setSelectedCity(s.shortName);
    setSuggestions([]);
    setShowSuggestions(false);
    if (mapRef.current) mapRef.current.setView([s.lat, s.lon], 14);
    setCityColleges([]);
    setCityCollegesLoading(true);
    const list = await fetchCollegesInCity(s.lat, s.lon);
    setCityColleges(list);
    setCityCollegesLoading(false);
  };

  const handleCollegeItemSelect = async (c: CollegeItem) => {
    if (!mapRef.current) return;
    setCityColleges([]);
    setSelectedCity("");
    mapRef.current.setView([c.lat, c.lon], 17);

    // drop the pin programmatically
    import("leaflet").then((L) => {
      const pinIcon = L.divIcon({
        className: "",
        html: `<div style="width:36px;height:36px;border-radius:50% 50% 50% 0;background:linear-gradient(135deg,#8b5cf6,#ec4899);transform:rotate(-45deg);border:2px solid #c026d3;box-shadow:0 0 14px rgba(192,38,211,0.8);"></div>`,
        iconSize:   [36, 36],
        iconAnchor: [18, 36],
      });
      if (markerRef.current) {
        markerRef.current.setLatLng([c.lat, c.lon]);
      } else {
        markerRef.current = L.marker([c.lat, c.lon], { icon: pinIcon }).addTo(mapRef.current);
      }
    });

    setLat(c.lat);
    setLng(c.lon);
    setDetected({ name: c.name, city: selectedCity });
    setEditName(c.name);
    setEditing(false);
  };

  // ── use my location ───────────────────────────────────────────
  const handleUseLocation = () => {
    if (!navigator?.geolocation || !mapRef.current) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mapRef.current?.setView([pos.coords.latitude, pos.coords.longitude], 17);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  // ── confirm ───────────────────────────────────────────────────
  const handleConfirm = async () => {
    if (!lat || !lng || !detected) return;
    setConfirming(true);
    const finalName = editing ? editName.trim() || detected.name : detected.name;
    try {
      // find-or-create campus on backend
      const res = await api.post("/campus/find-or-create", {
        name: finalName,
        lat,
        lng,
        city: detected.city
      });
      const campus: CampusResult = {
        id:   res.data.data._id,
        name: finalName,
        city: detected.city,
        lat,
        lng
      };
      onConfirm(campus);
    } catch {
      // still pass back even if API fails — will be saved with profile
      onConfirm({ name: finalName, city: detected.city, lat, lng });
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        className="relative z-10 flex w-full max-w-xl flex-col rounded-t-[32px] sm:rounded-[32px] border border-fuchsia-300/20 bg-[#0e0519] shadow-[0_0_60px_rgba(196,70,255,0.35)]"
        style={{ maxHeight: "92dvh" }}
      >
        {/* Header — fixed, never scrolls */}
        <div className="flex shrink-0 items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-fuchsia-400" />
            <h2 className="text-base font-bold text-white">Select Your Campus</h2>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-purple-400/60 hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">

        {/* Search bar */}
        <div className="shrink-0 px-5 pb-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-purple-400/50" />
              <input
                value={searchQ}
                onChange={(e) => {
                  const v = e.target.value;
                  setSearchQ(v);
                  if (debounceRef.current) clearTimeout(debounceRef.current);
                  if (v.trim().length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
                  debounceRef.current = setTimeout(() => fetchCitySuggestions(v.trim()), 400);
                }}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 180)}
                onKeyDown={(e) => { if (e.key === "Enter") { setShowSuggestions(false); handleSearch(); } }}
                placeholder="Search campus or city…"
                className="w-full rounded-2xl border border-purple-400/20 bg-white/[0.05] py-2 pl-9 pr-3 text-sm text-white placeholder:text-purple-400/40 focus:border-fuchsia-400/50 focus:outline-none"
              />
              {/* City suggestions dropdown */}
              {showSuggestions && (suggestions.length > 0 || suggestionsLoading) && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 overflow-hidden rounded-2xl border border-purple-400/25 bg-[#130620] shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
                  {suggestionsLoading && suggestions.length === 0 && (
                    <div className="flex items-center gap-2 px-4 py-3 text-xs text-purple-300/50">
                      <Loader2 className="h-3 w-3 animate-spin" /> Searching…
                    </div>
                  )}
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onMouseDown={() => handleSuggestionSelect(s)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-white/[0.05] transition-colors border-b border-purple-400/10 last:border-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">{s.shortName}</p>
                        <p className="truncate text-[10px] text-purple-400/50">{s.displayName}</p>
                      </div>
                      {s.count !== undefined ? (
                        <span className="shrink-0 rounded-full bg-fuchsia-500/20 px-2 py-0.5 text-[10px] font-semibold text-fuchsia-300">
                          {s.count} {s.count === 1 ? "campus" : "campuses"}
                        </span>
                      ) : (
                        <Loader2 className="h-3 w-3 shrink-0 animate-spin text-purple-400/40" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={handleSearch}
              disabled={searching}
              className="flex h-9 w-9 items-center justify-center rounded-2xl bg-fuchsia-600/80 text-white disabled:opacity-50"
            >
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </button>
          </div>
          <button
            onClick={handleUseLocation}
            disabled={locating || searching}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-purple-400/20 bg-white/[0.04] py-1.5 text-[11px] font-medium text-purple-300/70 hover:border-fuchsia-400/40 hover:text-white transition-colors disabled:opacity-40"
          >
            {locating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <span>📍</span>}
            {locating ? "Detecting location…" : "Use My Location"}
          </button>
          <p className="mt-1.5 text-[10px] text-purple-400/45">
            Search to pan the map, then <strong className="text-purple-300/70">click your campus</strong> to drop a pin
          </p>
        </div>

        {/* Map — fixed height, never shrinks */}
        <div className="mx-5 mb-3 shrink-0 overflow-hidden rounded-2xl border border-purple-400/20" style={{ height: 260 }}>
          <div ref={containerRef} className="h-full w-full" />
        </div>

        {/* College list for selected city — below map */}
        {(cityCollegesLoading || cityColleges.length > 0) && (
          <div className="mx-5 mb-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-fuchsia-400/60">
              {cityCollegesLoading ? "Loading campuses…" : `${cityColleges.length} campuses in ${selectedCity}`}
            </p>
            {cityCollegesLoading ? (
              <div className="flex items-center gap-2 rounded-2xl border border-purple-400/15 bg-white/[0.03] px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-fuchsia-400" />
                <span className="text-sm text-purple-300/50">Fetching campus list…</span>
              </div>
            ) : (
              <div className="rounded-2xl border border-purple-400/15 bg-[#0a0315]">
                {cityColleges.map((c, i) => {
                  const colors = [
                    "from-violet-600 to-fuchsia-600",
                    "from-fuchsia-600 to-pink-600",
                    "from-indigo-600 to-violet-600",
                    "from-purple-600 to-blue-600",
                    "from-pink-600 to-rose-600",
                  ];
                  const grad = colors[i % colors.length];
                  const initials = c.name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();
                  return (
                    <button
                      key={i}
                      onClick={() => handleCollegeItemSelect(c)}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-white/[0.05] transition-colors border-b border-purple-400/10 last:border-0"
                    >
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${grad} text-[11px] font-bold text-white shadow-lg`}>
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">{c.name}</p>
                        <p className="text-[10px] capitalize text-purple-400/50">{c.type}</p>
                      </div>
                      <Check className="h-3.5 w-3.5 shrink-0 text-purple-400/30" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Detected campus panel */}
        <div className="px-5 pb-5">
          <AnimatePresence mode="wait">
            {geocoding && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 rounded-2xl border border-purple-400/15 bg-white/[0.04] px-4 py-3 text-sm text-purple-300/70"
              >
                <Loader2 className="h-4 w-4 animate-spin text-fuchsia-400" />
                Detecting campus…
              </motion.div>
            )}

            {!geocoding && detected && (
              <motion.div
                key="detected"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-fuchsia-400/25 bg-fuchsia-500/10 p-4"
              >
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-fuchsia-400/60">
                  Detected Campus
                </p>

                {editing ? (
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="mb-2 w-full rounded-xl border border-fuchsia-400/30 bg-white/[0.06] px-3 py-1.5 text-sm text-white focus:outline-none focus:border-fuchsia-400/70"
                  />
                ) : (
                  <p className="mb-1 text-sm font-semibold text-white">
                    {editing ? editName : detected.name}
                  </p>
                )}

                {detected.city && (
                  <p className="mb-3 text-[11px] text-purple-300/60">{detected.city}</p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setEditing((e) => !e)}
                    className="flex items-center gap-1.5 rounded-full border border-purple-400/25 bg-white/[0.05] px-3 py-1.5 text-[11px] font-medium text-purple-300 hover:border-purple-400/50 transition-colors"
                  >
                    <Edit2 className="h-3 w-3" />
                    {editing ? "Done editing" : "Edit name"}
                  </button>

                  <button
                    onClick={handleConfirm}
                    disabled={confirming}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-600 px-4 py-1.5 text-[11px] font-semibold text-white shadow-[0_0_14px_rgba(192,38,211,0.4)] disabled:opacity-60"
                  >
                    {confirming
                      ? <><Loader2 className="h-3 w-3 animate-spin" /> Joining…</>
                      : <><Check className="h-3 w-3" /> Confirm & Join Campus</>
                    }
                  </button>
                </div>
              </motion.div>
            )}

            {!geocoding && !detected && (
              <motion.div
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 rounded-2xl border border-purple-400/15 bg-white/[0.03] px-4 py-3 text-xs text-purple-300/50"
              >
                <MapPin className="h-4 w-4 text-purple-400/40" />
                Click anywhere on the map to drop a pin on your campus
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        </div>  {/* end scrollable body */}
      </motion.div>
    </div>
  );
}
