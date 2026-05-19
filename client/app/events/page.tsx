"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, MapPin, Users, Sparkles } from "lucide-react";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/auth-store";
import { useApiSWR } from "@/hooks/use-api-swr";
import { resolveMediaUrl } from "@/lib/media";
import { SectionCloseButton } from "@/components/layout/section-close-button";

type CampusEvent = {
  _id: string;
  title: string;
  description: string;
  category: string;
  venue: string;
  university: string;
  date: string;
  time: string;
  coverImage?: string;
  attendees: any[];
  maxAttendees?: number;
  tags: string[];
};

const CATEGORIES = ["All", "Fest", "Dating", "Concert", "Hackathon", "Workshop", "Meetup", "Sports", "Cultural"] as const;

const SAMPLE_EVENTS: CampusEvent[] = [
  {
    _id: "demo-evt-1",
    title: "Campus Crush Speed Dating Night 💘",
    description: "Meet 10+ verified campus singles in 30 minutes. Ice-breakers, blind rounds, and instant matches — all in a safe, fun environment!",
    category: "dating",
    venue: "Student Center, Block 32",
    university: "LPU",
    date: new Date(Date.now() + 3 * 86400000).toISOString(),
    time: "7:00 PM",
    coverImage: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1400&auto=format&fit=crop",
    attendees: Array(34).fill({}),
    maxAttendees: 50,
    tags: ["speed-dating", "campus", "singles"],
  },
  {
    _id: "demo-evt-2",
    title: "Spring Fest 2026 🎉",
    description: "The biggest cultural extravaganza of the year. Live music, dance battles, art installations, street food, and a whole lot of campus romance.",
    category: "fest",
    venue: "Main Amphitheater",
    university: "LPU",
    date: new Date(Date.now() + 7 * 86400000).toISOString(),
    time: "3:00 PM",
    coverImage: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1400&auto=format&fit=crop",
    attendees: Array(312).fill({}),
    maxAttendees: 500,
    tags: ["fest", "music", "cultural"],
  },
  {
    _id: "demo-evt-3",
    title: "Battle of Bands 🎸",
    description: "6 campus bands compete live. Acoustic to metal, all genres welcome. Biggest crowd of the semester guaranteed.",
    category: "concert",
    venue: "Open-Air Stadium",
    university: "LPU",
    date: new Date(Date.now() + 10 * 86400000).toISOString(),
    time: "5:00 PM",
    coverImage: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1400&auto=format&fit=crop",
    attendees: Array(189).fill({}),
    maxAttendees: 300,
    tags: ["music", "concert", "live"],
  },
  {
    _id: "demo-evt-4",
    title: "HackLove 2026 — Hackathon 💻",
    description: "48-hour tech+design hackathon. Theme: apps that bring campus people closer. ₹50k in prizes. Solo or team.",
    category: "hackathon",
    venue: "Innovation Lab, Block 12",
    university: "LPU",
    date: new Date(Date.now() + 14 * 86400000).toISOString(),
    time: "9:00 AM",
    coverImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1400&auto=format&fit=crop",
    attendees: Array(78).fill({}),
    maxAttendees: 200,
    tags: ["hackathon", "tech", "coding"],
  },
  {
    _id: "demo-evt-5",
    title: "Chai & Conversation — Social Meetup ☕",
    description: "Weekly low-pressure social meetup. Show up, grab chai, make friends, maybe find your campus crush.",
    category: "meetup",
    venue: "Campus Café Lounge",
    university: "LPU",
    date: new Date(Date.now() + 2 * 86400000).toISOString(),
    time: "4:30 PM",
    coverImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1400&auto=format&fit=crop",
    attendees: Array(23).fill({}),
    maxAttendees: 40,
    tags: ["social", "chai", "meetup"],
  },
];

const EVENT_COVER_BY_CATEGORY: Record<string, string> = {
  dating: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1400&auto=format&fit=crop",
  fest: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1400&auto=format&fit=crop",
  concert: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1400&auto=format&fit=crop",
  hackathon: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1400&auto=format&fit=crop",
  workshop: "https://images.unsplash.com/photo-1515169067868-5387ec356754?w=1400&auto=format&fit=crop",
  meetup: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1400&auto=format&fit=crop",
  sports: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1400&auto=format&fit=crop",
  cultural: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1400&auto=format&fit=crop",
};

const CATEGORY_COLORS: Record<string, string> = {
  fest: "bg-pink-100 text-pink-700 border-pink-200",
  dating: "bg-rose-100 text-rose-700 border-rose-200",
  concert: "bg-purple-100 text-purple-700 border-purple-200",
  hackathon: "bg-blue-100 text-blue-700 border-blue-200",
  workshop: "bg-emerald-100 text-emerald-700 border-emerald-200",
  meetup: "bg-orange-100 text-orange-700 border-orange-200",
  sports: "bg-yellow-100 text-yellow-700 border-yellow-200",
  cultural: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
};

function formatDate(d: string) {
  const dt = new Date(d);
  return dt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function EventsPage() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);

  const [category, setCategory] = useState<string>("All");
  const [rsvpLoading, setRsvpLoading] = useState<string>("");
  const [rsvpd, setRsvpd] = useState<Set<string>>(new Set());
  const params: Record<string, string> = { university: user?.university || "LPU" };
  if (category !== "All") params.category = category.toLowerCase();

  const { data, isLoading, mutate } = useApiSWR<CampusEvent[]>(hydrated ? ["/events", params] : null);
  const rawEvents = useMemo(
    () => (data || []).map((event) => ({ ...event, coverImage: resolveMediaUrl(event.coverImage) || EVENT_COVER_BY_CATEGORY[event.category] || EVENT_COVER_BY_CATEGORY.meetup })),
    [data]
  );
  const events = rawEvents.length > 0 ? rawEvents : SAMPLE_EVENTS;

  const handleRsvp = async (eventId: string) => {
    if (!token) return;
    // Demo events have non-ObjectId IDs — toggle locally, no API call
    if (eventId.startsWith("demo-")) {
      setRsvpd((prev) => {
        const next = new Set(prev);
        if (next.has(eventId)) next.delete(eventId);
        else next.add(eventId);
        return next;
      });
      return;
    }
    setRsvpLoading(eventId);
    try {
      await api.post(`/events/${eventId}/rsvp`);
      setRsvpd((prev) => {
        const next = new Set(prev);
        if (next.has(eventId)) next.delete(eventId);
        else next.add(eventId);
        return next;
      });
      mutate();
    } catch {}
    setRsvpLoading("");
  };

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-pink-100 bg-white shadow-[0_4px_24px_rgba(255,45,120,0.08)]"
      >
        {/* Header */}
        <div className="relative px-5 pt-6 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-[#2D1810]">Campus Events</h1>
              <p className="text-xs text-[#9B7065]">Fests, concerts, meetups & more</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-full border border-pink-200 bg-pink-50 px-2.5 py-1 text-[11px] text-[#FF2D78] font-medium">
                <Sparkles className="h-3 w-3" />
                {events.length} upcoming
              </div>
              <SectionCloseButton />
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="px-5 pb-4">
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`relative flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  category === c ? "text-white" : "text-[#9B7065] hover:text-[#2D1810]"
                }`}
              >
                {category === c && (
                  <motion.div
                    layoutId="events-tab"
                    className="absolute inset-0 rounded-full bg-[#FF2D78]"
                  />
                )}
                <span className="relative z-10">{c}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Events list */}
        <div className="space-y-3 px-5 pb-6">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-3xl bg-pink-50 h-40" />
            ))
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <Calendar className="h-12 w-12 text-pink-300" />
              <p className="text-sm text-[#2D1810]">No {category !== "All" ? category.toLowerCase() : ""} events yet</p>
              <p className="text-xs text-[#9B7065]">Check back soon for campus events! 🎉</p>
            </div>
          ) : (
            <AnimatePresence>
              {events.map((ev, i) => {
                const attending = rsvpd.has(ev._id);
                const colorClass = CATEGORY_COLORS[ev.category] || CATEGORY_COLORS.meetup;
                return (
                  <motion.div
                    key={ev._id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-[0_2px_12px_rgba(255,45,120,0.06)] hover:shadow-[0_4px_20px_rgba(255,45,120,0.12)] transition-all"
                  >
                    {/* Cover */}
                    {ev.coverImage && (
                      <div
                        className="h-32 w-full bg-cover bg-center relative"
                        style={{ backgroundImage: `url(${ev.coverImage})` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-[#2D1810]/60 to-transparent" />
                        <span className={`absolute top-2.5 left-2.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold capitalize ${colorClass}`}>
                          {ev.category}
                        </span>
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="text-sm font-bold text-[#2D1810] mb-1">{ev.title}</h3>
                      <p className="text-[11px] text-[#9B7065] line-clamp-2 mb-3">{ev.description}</p>
                      <div className="space-y-1.5 mb-3">
                        <div className="flex items-center gap-1.5 text-[11px] text-[#9B7065]">
                          <Calendar className="h-3 w-3 text-[#FF2D78]" />
                          {formatDate(ev.date)} · {ev.time}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-[#9B7065]">
                          <MapPin className="h-3 w-3 text-[#FF2D78]" />
                          {ev.venue} · {ev.university}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-[#9B7065]">
                          <Users className="h-3 w-3 text-emerald-500" />
                          {ev.attendees.length} going
                          {ev.maxAttendees ? ` · ${ev.maxAttendees - ev.attendees.length} spots left` : ""}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1 flex-wrap flex-1">
                          {ev.tags.slice(0, 3).map((t) => (
                            <span key={t} className="rounded-full bg-pink-50 px-2 py-0.5 text-[9px] text-[#9B7065] border border-pink-100">
                              #{t}
                            </span>
                          ))}
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.94 }}
                          onClick={() => handleRsvp(ev._id)}
                          disabled={rsvpLoading === ev._id}
                          className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition-all ${
                            attending
                              ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                              : "bg-[#FF2D78] text-white shadow-[0_4px_12px_rgba(255,45,120,0.4)]"
                          }`}
                        >
                          {rsvpLoading === ev._id ? "..." : attending ? "✓ Going" : "RSVP"}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </div>
  );
}
