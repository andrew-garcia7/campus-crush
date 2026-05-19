"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import type { Map as LMap } from "leaflet";
import type { Place, NearbyStudent, PlaceCategory, CollegeSuggestion } from "@/hooks/use-map-data";

// ── Category styling ──────────────────────────────────────────

export const CATEGORY_META: Record<
  Exclude<PlaceCategory, "all">,
  { color: string; emoji: string; label: string }
> = {
  cafeteria: { color: "#f97316", emoji: "☕", label: "Cafeteria" },
  gym:       { color: "#10b981", emoji: "🏋️", label: "Gym"       },
  library:   { color: "#3b82f6", emoji: "📚", label: "Library"   },
  hostel:    { color: "#a855f7", emoji: "🏠", label: "Hostel"    },
  sports:    { color: "#eab308", emoji: "⚽", label: "Sports"    },
};

// Legacy export kept for backward-compat with map page fallback
export const CAMPUS_COORDS: Record<string, [number, number]> = {
  "LPU":                [31.2553, 75.7036],
  "Amity University":   [28.5442, 77.3327],
  "VIT Vellore":        [12.9692, 79.1559],
  "SRM Chennai":        [12.8231, 80.0437],
  "Manipal University": [13.3525, 74.7947],
};

// ── Props ─────────────────────────────────────────────────────

interface Props {
  center:           [number, number];
  places:           Place[];
  students:         NearbyStudent[];
  activeCategory:   PlaceCategory;
  colleges?:        CollegeSuggestion[];
  onPlaceClick?:    (place: Place) => void;
  onStudentClick?:  (student: NearbyStudent) => void;
  onCollegeClick?:  (college: CollegeSuggestion) => void;
}

// ── Component ─────────────────────────────────────────────────

export default function LeafletMapComponent({
  center, places, students, activeCategory, colleges = [],
  onPlaceClick, onStudentClick, onCollegeClick,
}: Props) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const mapRef        = useRef<LMap | null>(null);
  const layersRef     = useRef<Record<string, any>>({});
  const studentLayerRef  = useRef<any>(null);
  const collegeLayerRef   = useRef<any>(null);
  const youMarkerRef      = useRef<any>(null);

  // ── Init map (once) ─────────────────────────────────────────
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
        center,
        zoom:            16,
        zoomControl:     false,
        scrollWheelZoom: true,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // "You" pulsing marker
      const youIcon = L.divIcon({
        className: "",
        html: `
          <div style="position:relative;width:36px;height:36px;">
            <div style="
              position:absolute;inset:0;border-radius:50%;
              background:rgba(192,38,211,0.25);
              animation:ping 1.5s cubic-bezier(0,0,.2,1) infinite;
            "></div>
            <div style="
              position:absolute;inset:4px;border-radius:50%;
              background:linear-gradient(135deg,#8b5cf6,#ec4899);
              border:2px solid #c026d3;
              box-shadow:0 0 14px rgba(192,38,211,0.9);
              display:flex;align-items:center;justify-content:center;
              font-size:13px;
            ">📍</div>
          </div>
          <style>@keyframes ping{75%,100%{transform:scale(2.2);opacity:0}}</style>`,
        iconSize:   [36, 36],
        iconAnchor: [18, 18],
      });
      youMarkerRef.current = L.marker(center, { icon: youIcon, zIndexOffset: 1000 })
        .addTo(map)
        .bindPopup("<b>You are here</b>");

      // One LayerGroup per category
      const cats = Object.keys(CATEGORY_META) as Exclude<PlaceCategory, "all">[];
      cats.forEach((cat) => {
        const lg = L.layerGroup().addTo(map);
        layersRef.current[cat] = lg;
      });

      // Student layer
      studentLayerRef.current = L.layerGroup().addTo(map);

      // College layer
      collegeLayerRef.current = L.layerGroup().addTo(map);
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      layersRef.current = {};
      studentLayerRef.current = null;
      collegeLayerRef.current = null;
      youMarkerRef.current = null;
    };
  }, []);

  // ── Re-center when center prop changes ──────────────────────
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setView(center, 16);
    youMarkerRef.current?.setLatLng(center);
  }, [center[0], center[1]]);

  // ── Rebuild place markers when places change ────────────────
  useEffect(() => {
    if (!mapRef.current) return;
    import("leaflet").then((L) => {
      // Clear all category layers
      Object.values(layersRef.current).forEach((lg: any) => lg.clearLayers());

      places.forEach((place) => {
        const meta = CATEGORY_META[place.category as Exclude<PlaceCategory, "all">];
        if (!meta) return;
        const icon = L.divIcon({
          className: "",
          html: `<div style="
            display:flex;align-items:center;gap:4px;
            background:${meta.color}dd;color:#fff;
            border-radius:999px;padding:3px 8px;
            font-size:11px;font-weight:700;
            box-shadow:0 0 10px ${meta.color}88;
            border:1px solid rgba(255,255,255,0.25);
            white-space:nowrap;max-width:160px;overflow:hidden;text-overflow:ellipsis;
          ">${meta.emoji} ${place.name}</div>`,
          iconAnchor: [50, 14],
        });
        const distM    = Math.round(L.latLng(place.lat, place.lng).distanceTo(L.latLng(center)));
        const distTxt  = distM < 1000 ? `${distM}m away` : `${(distM / 1000).toFixed(1)}km away`;
        const marker = L.marker([place.lat, place.lng], { icon })
          .bindTooltip(
            `<b>${place.name}</b><br/>${place.category}<br/>${distTxt}`,
            { direction: "top", className: "leaflet-campus-tooltip" },
          )
          .on("click", () => onPlaceClick?.(place));
        layersRef.current[place.category]?.addLayer(marker);
      });
    });
  }, [places, center[0], center[1]]);

  // ── Show/hide category layers when active category changes ──
  useEffect(() => {
    if (!mapRef.current) return;
    import("leaflet").then(() => {
      Object.entries(layersRef.current).forEach(([cat, lg]: [string, any]) => {
        if (activeCategory === "all" || activeCategory === cat) {
          if (!mapRef.current!.hasLayer(lg)) mapRef.current!.addLayer(lg);
        } else {
          if (mapRef.current!.hasLayer(lg)) mapRef.current!.removeLayer(lg);
        }
      });
    });
  }, [activeCategory, places]);

  // ── Rebuild student markers when students change ─────────────
  useEffect(() => {
    if (!mapRef.current || !studentLayerRef.current) return;
    import("leaflet").then((L) => {
      studentLayerRef.current.clearLayers();
      students.forEach((u) => {
        const icon = L.divIcon({
          className: "",
          html: `<div style="
            width:28px;height:28px;border-radius:50%;
            border:2px solid rgba(232,121,249,0.8);
            box-shadow:0 0 8px rgba(232,121,249,0.5);
            overflow:hidden;
            background:linear-gradient(135deg,#4c1d95,#831843);
          ">${u.photo
            ? `<img src="${u.photo}" style="width:100%;height:100%;object-fit:cover;"/>`
            : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:11px;color:white">👤</div>`
          }</div>`,
          iconSize:   [28, 28],
          iconAnchor: [14, 14],
        });
        L.marker([u.lat, u.lng], { icon })
          .addTo(studentLayerRef.current)
          .bindTooltip(u.name.split(" ")[0], { permanent: false, direction: "top" })
          .on("click", () => onStudentClick?.(u));
      });
    });
  }, [students]);

  // ── Rebuild college markers when colleges change ────────────
  useEffect(() => {
    if (!mapRef.current || !collegeLayerRef.current) return;
    import("leaflet").then((L) => {
      collegeLayerRef.current.clearLayers();
      colleges.forEach((college) => {
        const icon = L.divIcon({
          className: "",
          html: `<div style="
            display:flex;align-items:center;gap:4px;
            background:#4f46e5dd;color:#fff;
            border-radius:999px;padding:3px 8px;
            font-size:11px;font-weight:700;
            box-shadow:0 0 10px #4f46e588;
            border:1px solid rgba(255,255,255,0.25);
            white-space:nowrap;max-width:180px;overflow:hidden;text-overflow:ellipsis;
          ">🎓 ${college.name}</div>`,
          iconAnchor: [50, 14],
        });
        const distKm   = college.distanceKm;
        const distLine = distKm != null
          ? (distKm < 1 ? `${Math.round(distKm * 1000)}m away` : `${distKm.toFixed(1)}km away`)
          : "";
        L.marker([college.lat, college.lng], { icon })
          .addTo(collegeLayerRef.current)
          .bindTooltip(
            `<b>${college.name}</b><br/>${college.type}${distLine ? `<br/>${distLine}` : ""}`,
            { direction: "top", className: "leaflet-campus-tooltip" },
          )
          .on("click", () => onCollegeClick?.(college));
      });
    });
  }, [colleges]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", borderRadius: "inherit" }}
    />
  );
}

