"use client";

import { useEffect, useState } from "react";
import type { DiscoverProfile, SwipeAction, SwipeEvent } from "./swipe-types";

export function useSwipeDeck(initialProfiles: DiscoverProfile[]) {
  const [profiles, setProfiles] = useState<DiscoverProfile[]>(initialProfiles);
  const [history, setHistory] = useState<SwipeEvent[]>([]);
  const [exiting, setExiting] = useState<{ id: string; action: SwipeAction } | null>(null);

  // Sync when profiles prop loads from API (including tab switches and empty→filled transitions)
  useEffect(() => {
    setProfiles(initialProfiles);
  }, [initialProfiles]);

  const current = profiles[0] ?? null;
  const stack = profiles.slice(0, 3);

  const performSwipe = (action: SwipeAction) => {
    if (!current || exiting) return;
    const profile = current;
    // Mark card as exiting so the exit animation plays
    setExiting({ id: profile.id, action });
    // Remove from stack after animation completes (700ms)
    setTimeout(() => {
      setHistory((prev) => [{ profileId: profile.id, action, timestamp: Date.now(), profile }, ...prev]);
      setProfiles((prev) => prev.slice(1));
      setExiting(null);
    }, 700);
  };

  const undoSwipe = () => {
    if (exiting) return;
    const last = history[0];
    if (!last) return;
    setProfiles((prev) => [last.profile, ...prev]);
    setHistory((prev) => prev.slice(1));
  };

  return { current, stack, history, exiting, performSwipe, undoSwipe, remaining: profiles.length };
}

