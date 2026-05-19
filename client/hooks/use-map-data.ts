"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/services/api";

// ─── Types ───────────────────────────────────────────────────

export type PlaceCategory = "cafeteria" | "gym" | "library" | "hostel" | "sports" | "all";

export interface Place {
  id: string; name: string; category: PlaceCategory;
  lat: number; lng: number; tags: Record<string, string>;
}

export interface NearbyStudent {
  id: string; name: string; photo: string;
  age: number; zone: string; lat: number; lng: number;
}

export interface CampusInfo {
  id?: string; name: string; city: string; lat: number; lng: number;
}

export interface CollegeSuggestion {
  id: string; name: string; lat: number; lng: number;
  type: "college" | "university"; address: string;
  distanceKm?: number;
}

export interface MapDataState {
  userLat: number | null; userLng: number | null;
  locError: string | null; locLoading: boolean;
  campus: CampusInfo | null; campusLoading: boolean; campusNotFound: boolean;
  colleges: CollegeSuggestion[]; collegesLoading: boolean; collegesError: boolean;
  places: Place[]; placesLoading: boolean; placesError: boolean;
  students: NearbyStudent[]; studentsLoading: boolean; studentsError: boolean;
  refresh: () => void;
  refreshStudents: () => void;
  setCampusManually: (name: string, lat?: number, lng?: number) => void;
  searchCity: (city: string) => Promise<void>;
  fetchCollegesNear: (lat: number, lng: number, radiusKm?: number) => Promise<void>;
  loadAt: (lat: number, lng: number) => Promise<void>;
}

// ─── Constants ───────────────────────────────────────────────

const OVERPASS_URL      = "https://overpass-api.de/api/interpreter";
const NOMINATIM_BASE    = "https://nominatim.openstreetmap.org";
const STUDENT_RADIUS_M  = 1000;
const COLLEGE_RADIUS_KM = 5;
const POLL_INTERVAL_MS  = 10_000;

// ─── Distance ────────────────────────────────────────────────────────────────

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R    = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a    = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function fmtDist(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)} km`;
}

function makeBbox(lat: number, lng: number, km: number): string {
  const deg = km / 111;
  return `${lat - deg},${lng - deg},${lat + deg},${lng + deg}`;
}

// ─── Overpass: colleges / universities ───────────────────────

function buildCollegeQuery(lat: number, lng: number, radiusKm: number): string {
  const r     = Math.round(radiusKm * 1000); // metres
  const types = ["college", "university"];
  const geoms = ["node", "way", "relation"];
  const parts = types.flatMap(t =>
    geoms.map(g => `${g}["amenity"="${t}"]["name"](around:${r},${lat},${lng});`)
  );
  return ["[out:json][timeout:30];", "(", ...parts, ");", "out center;"].join("\n");
}

async function fetchCollegesFromOverpass(
  lat: number, lng: number, radiusKm: number
): Promise<CollegeSuggestion[]> {
  const body = buildCollegeQuery(lat, lng, radiusKm);
  const res  = await fetch(OVERPASS_URL, {
    method : "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body   : `data=${encodeURIComponent(body)}`,
  });
  if (!res.ok) throw new Error("Overpass error");
  const json = await res.json();
  const seen = new Set<string>();
  const out : CollegeSuggestion[] = [];
  for (const el of (json.elements ?? [])) {
    const name: string = el.tags?.name || el.tags?.["name:en"] || "";
    if (!name) continue;
    if (seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    const elLat = el.lat ?? el.center?.lat;
    const elLng = el.lon ?? el.center?.lon;
    if (!elLat || !elLng) continue;
    out.push({
      id     : String(el.id),
      name,
      lat    : elLat,
      lng    : elLng,
      type   : (el.tags?.amenity ?? "college") as "college" | "university",
      address: el.tags?.["addr:street"] || el.tags?.["addr:full"] || "",
      distanceKm: haversineKm(lat, lng, elLat, elLng),
    });
  }
  out.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
  return out;
}

// ─── Overpass: campus places ─────────────────────────────────

const CATEGORY_MAP: Record<string, PlaceCategory> = {
  cafe: "cafeteria", canteen: "cafeteria", food_court: "cafeteria",
  fast_food: "cafeteria", restaurant: "cafeteria",
  fitness_centre: "gym", gym: "gym",
  library: "library",
  hostel: "hostel", dormitory: "hostel", student_accommodation: "hostel",
  pitch: "sports", sports_centre: "sports", swimming_pool: "sports", stadium: "sports",
};

async function fetchOverpassPlaces(lat: number, lng: number): Promise<Place[]> {
  const R = 1500; // metres — wide enough to cover a full campus
  console.log("[Campus Map] Fetching places for:", lat, lng, `radius=${R}m`);
  try {
    const around = (tag: string) =>
      `node${tag}["name"](around:${R},${lat},${lng});\n` +
      `way${tag}["name"](around:${R},${lat},${lng});\n` +
      `relation${tag}["name"](around:${R},${lat},${lng});`;

    const parts = [
      around(`["amenity"="cafe"]`),
      around(`["amenity"="canteen"]`),
      around(`["amenity"="food_court"]`),
      around(`["amenity"="fast_food"]`),
      around(`["amenity"="restaurant"]`),
      around(`["leisure"="fitness_centre"]`),
      around(`["amenity"="gym"]`),
      around(`["amenity"="library"]`),
      around(`["tourism"="hostel"]`),
      around(`["building"="dormitory"]`),
      around(`["amenity"="student_accommodation"]`),
      around(`["leisure"="pitch"]`),
      around(`["leisure"="sports_centre"]`),
      around(`["leisure"="swimming_pool"]`),
      around(`["leisure"="stadium"]`),
    ];

    const body = [
      "[out:json][timeout:25];",
      "(",
      ...parts,
      ");",
      "out center;",
    ].join("\n");

    const res = await fetch(OVERPASS_URL, {
      method : "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body   : `data=${encodeURIComponent(body)}`,
    });
    if (!res.ok) { console.warn("[Campus Map] Overpass HTTP error", res.status); return []; }
    const json = await res.json();
    console.log("[Campus Map] Overpass raw elements:", json.elements?.length ?? 0, json.elements?.slice(0, 3));

    const seen = new Set<string>();
    const out : Place[] = [];
    for (const el of (json.elements ?? [])) {
      const elLat = el.lat ?? el.center?.lat;
      const elLng = el.lon ?? el.center?.lon;
      if (!elLat || !elLng) continue;
      const t   = el.tags ?? {};
      const cat: PlaceCategory =
        CATEGORY_MAP[t.amenity] ?? CATEGORY_MAP[t.leisure] ??
        CATEGORY_MAP[t.tourism] ?? CATEGORY_MAP[t.building] ?? "cafeteria";
      const rawName: string = t.name || t["name:en"] || "";
      if (!rawName) continue;
      const key = `${rawName.toLowerCase()}:${cat}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ id: String(el.id), name: rawName, category: cat,
        lat: elLat, lng: elLng, tags: t });
    }
    console.log("[Campus Map] Parsed places:", out.length);
    return out;
  } catch (e) {
    console.error("[Campus Map] fetchOverpassPlaces error:", e);
    return [];
  }
}

// ─── Nominatim: city geocoding ───────────────────────────────

export async function geocodeCity(
  city: string
): Promise<{ lat: number; lng: number; displayName: string } | null> {
  try {
    const p = new URLSearchParams({
      q: city, format: "json", addressdetails: "1", limit: "1", countrycodes: "in",
    });
    const res = await fetch(`${NOMINATIM_BASE}/search?${p}`, {
      headers: { "Accept-Language": "en" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.length) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), displayName: data[0].display_name };
  } catch { return null; }
}

// ─── Hook ────────────────────────────────────────────────────

export function useMapData(): MapDataState {
  const [userLat,  setUserLat]  = useState<number | null>(null);
  const [userLng,  setUserLng]  = useState<number | null>(null);
  const [locError, setLocError] = useState<string | null>(null);
  const [locLoading, setLocLoading] = useState(true);

  const [campus,         setCampus]        = useState<CampusInfo | null>(null);
  const [campusLoading,  setCampusLoading] = useState(false);
  const [campusNotFound, setCampusNotFound] = useState(false);

  const [colleges,        setColleges]        = useState<CollegeSuggestion[]>([]);
  const [collegesLoading, setCollegesLoading] = useState(false);
  const [collegesError,   setCollegesError]   = useState(false);

  const [places,        setPlaces]        = useState<Place[]>([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [placesError,   setPlacesError]   = useState(false);

  const [students,        setStudents]        = useState<NearbyStudent[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError,   setStudentsError]   = useState(false);

  const initDone  = useRef(false);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const coordsRef = useRef<{ lat: number; lng: number } | null>(null);

  // ── fetch students ──────────────────────────────────────────
  const fetchStudents = useCallback(async (lat: number, lng: number) => {
    setStudentsLoading(true); setStudentsError(false);
    try {
      const res = await api.get("/map/nearby", { params: { lat, lng, radius: STUDENT_RADIUS_M } });
      const raw: any[] = res.data?.data ?? [];
      setStudents(
        raw
          .filter(u => u.lat != null && u.lng != null)
          .map(u => ({
            id   : String(u._id),
            name : u.fullName ?? "Student",
            photo: u.photos?.[0] ?? "",
            age  : u.age ?? 20,
            zone : u.location?.zone ?? "Campus",
            lat  : Number(u.lat),
            lng  : Number(u.lng),
          })),
      );
    } catch { setStudentsError(true); setStudents([]); }
    finally  { setStudentsLoading(false); }
  }, []);

  // ── fetch colleges near a coordinate ───────────────────────
  const fetchCollegesNear = useCallback(async (
    lat: number, lng: number, radiusKm = COLLEGE_RADIUS_KM
  ) => {
    setCollegesLoading(true); setCollegesError(false);
    try {
      const results = await fetchCollegesFromOverpass(lat, lng, radiusKm);
      setColleges(results);
      setCampusNotFound(results.length === 0);
    } catch {
      setCollegesError(true); setColleges([]); setCampusNotFound(true);
    } finally { setCollegesLoading(false); }
  }, []);

  // ── load all data at a coordinate ──────────────────────────
  const loadAt = useCallback(async (lat: number, lng: number) => {
    coordsRef.current = { lat, lng };
    setCampusLoading(true);
    setPlacesLoading(true); setPlacesError(false);
    const [overpassPlaces] = await Promise.all([
      fetchOverpassPlaces(lat, lng),
      fetchCollegesNear(lat, lng, COLLEGE_RADIUS_KM),
    ]);
    setCampusLoading(false);
    setPlacesLoading(false);
    setPlaces(overpassPlaces ?? []);
    await fetchStudents(lat, lng);
    if (pollTimer.current) clearInterval(pollTimer.current);
    pollTimer.current = setInterval(() => {
      const c = coordsRef.current;
      if (c) fetchStudents(c.lat, c.lng);
    }, POLL_INTERVAL_MS);
  }, [fetchCollegesNear, fetchStudents]);

  // ── cleanup polling on unmount ──────────────────────────────
  useEffect(() => {
    return () => { if (pollTimer.current) clearInterval(pollTimer.current); };
  }, []);

  // ── init: get GPS then load ─────────────────────────────────
  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;
    if (!navigator?.geolocation) {
      setLocError("Geolocation not supported"); setLocLoading(false);
      loadAt(28.6139, 77.2090); return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLat(latitude); setUserLng(longitude); setLocLoading(false);
        loadAt(latitude, longitude);
      },
      (err) => {
        setLocError(err.message || "Location access denied");
        setLocLoading(false);
        setUserLat(28.6139); setUserLng(77.2090);
        loadAt(28.6139, 77.2090);
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 30_000 },
    );
  }, [loadAt]);

  // ── searchCity: geocode then fetch colleges 10 km ──────────
  const searchCity = useCallback(async (city: string) => {
    const result = await geocodeCity(city);
    if (!result) { setCollegesError(true); return; }
    coordsRef.current = { lat: result.lat, lng: result.lng };
    await fetchCollegesNear(result.lat, result.lng, 10);
  }, [fetchCollegesNear]);

  const refresh = useCallback(() => {
    const c = coordsRef.current;
    if (c) loadAt(c.lat, c.lng);
  }, [loadAt]);

  const refreshStudents = useCallback(() => {
    const c = coordsRef.current;
    if (c) fetchStudents(c.lat, c.lng);
  }, [fetchStudents]);

  const setCampusManually = useCallback(
    (name: string, lat?: number, lng?: number) => {
      const c = coordsRef.current;
      setCampus({ name: name.trim(), city: "", lat: lat ?? c?.lat ?? 0, lng: lng ?? c?.lng ?? 0 });
      setCampusNotFound(false);
    },
    [],
  );

  return {
    userLat, userLng, locError, locLoading,
    campus, campusLoading, campusNotFound,
    colleges, collegesLoading, collegesError,
    places, placesLoading, placesError,
    students, studentsLoading, studentsError,
    refresh, refreshStudents, setCampusManually,
    searchCity, fetchCollegesNear, loadAt,
  };
}