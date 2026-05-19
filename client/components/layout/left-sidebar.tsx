"use client";

import type { Route } from "next";
import Link from "next/link";
import {
  usePathname,
  useRouter
} from "next/navigation";

import { motion } from "framer-motion";

import {
  Clock,
  Compass,
  Heart,
  MessageCircle,
  MapPin,
  Brain,
  Ghost,
  Calendar,
  Crown,
  UserCircle,
  LogOut
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

import { CampusCrushLogo } from "@/components/ui/campus-crush-logo";
import { useAuthStore } from "@/store/auth-store";
import { getProfileImage } from "@/lib/media";

const NAV_ITEMS: Array<{
  href: Route;
  icon: LucideIcon;
  label: string;
  sub: string;
}> = [
  {
    href: "/discover",
    icon: Compass,
    label: "Discover",
    sub: "Find people"
  },
  {
    href: "/matches",
    icon: Heart,
    label: "Matches",
    sub: "Your matches"
  },
  {
    href: "/chat",
    icon: MessageCircle,
    label: "Chats",
    sub: "Conversations"
  },
  {
    href: "/map",
    icon: MapPin,
    label: "Campus Map",
    sub: "Who's nearby"
  },
  {
    href: "/coach",
    icon: Brain,
    label: "AI Coach",
    sub: "Get advice"
  },
  {
    href: "/confessions",
    icon: Ghost,
    label: "Anonymous Wall",
    sub: "Share feelings"
  },
  {
    href: "/events",
    icon: Calendar,
    label: "Events",
    sub: "Meet together"
  },
  {
    href: "/premium",
    icon: Crown,
    label: "Premium",
    sub: "Upgrade plan"
  },
  {
    href: "/history",
    icon: Clock,
    label: "History",
    sub: "Bookings & bills"
  },
  {
    href: "/profile",
    icon: UserCircle,
    label: "Profile",
    sub: "Your profile"
  }
];

export function LeftSidebar({
  compact = false
}: {
  compact?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const token = useAuthStore(
    (s) => s.token
  );

  const user = useAuthStore(
    (s) => s.user
  );

  const hydrated = useAuthStore(
    (s) => s.hydrated
  );

  const logout = useAuthStore(
    (s) => s.logout
  );

  const profileName =
    user?.fullName ||
    "Your profile";

  const profileUniversity =
    user?.university ||
    "Campus Crush";

  const profileImage =
    getProfileImage(
      user?.photos?.[0],
      profileName
    );

  const handleLogout = () => {
    logout();

    setTimeout(() => {
      router.replace("/login");
    }, 100);
  };

  // ---------------- COMPACT ----------------
  if (compact) {
    return (
      <aside className="sticky top-0 flex h-screen flex-col items-center gap-1 py-4 bg-black">
        <Link
          href="/discover"
          className="mb-4 flex h-11 w-11 items-center justify-center"
        >
          <CampusCrushLogo
            size={44}
            showText={false}
            animated
            dark
          />
        </Link>

        <nav className="flex flex-col items-center gap-1 flex-1">
          {NAV_ITEMS.map(
            ({
              href,
              icon: Icon,
              label
            }) => {
              const active =
                pathname === href ||
                pathname?.startsWith(
                  href
                );

              return (
                <Link
                  key={href}
                  href={href}
                  title={label}
                >
                  <motion.div
                    whileHover={{
                      scale: 1.08
                    }}
                    whileTap={{
                      scale: 0.95
                    }}
                    className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                      active
                        ? "bg-[#FF2D78] text-white"
                        : "text-white/60 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </motion.div>
                </Link>
              );
            }
          )}
        </nav>

        {token && (
          <button
            onClick={
              handleLogout
            }
            className="rounded-lg p-2 hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </aside>
    );
  }

  // ---------------- FULL ----------------
  return (
    <aside className="sticky top-0 flex h-screen flex-col px-3 py-5 overflow-y-auto bg-black">

      {/* Logo */}
      <Link
        href="/discover"
        className="mb-6 flex items-center gap-3 px-2"
      >
        <CampusCrushLogo
          size={48}
          showText={false}
          animated
          dark
        />

        <div>
          <p className="text-[15px] font-bold text-white">
            Campus Crush
          </p>
          <p className="text-[11px] text-white/50">
            Real campus connections
          </p>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex flex-col gap-2 flex-1">
        {NAV_ITEMS.map(
          ({
            href,
            icon: Icon,
            label,
            sub
          }) => {
            const active =
              pathname === href ||
              pathname?.startsWith(
                href
              );

            return (
              <Link
                key={href}
                href={href}
              >
                <motion.div
                  whileHover={{
                    x: 3
                  }}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 transition-colors ${
                    active
                      ? "bg-[#FF2D78] text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />

                  <div>
                    <p className="text-[13px] font-semibold">
                      {label}
                    </p>
                    <p className={`text-[11px] ${active ? "text-white/70" : "text-white/40"}`}>
                      {sub}
                    </p>
                  </div>
                </motion.div>
              </Link>
            );
          }
        )}
      </nav>

      {/* User */}
      <div className="mt-4 border-t border-white/10 pt-4">
        {!hydrated ? (
          <div>
            Loading...
          </div>
        ) : token ? (
          <div className="flex items-center gap-3">
            <Link href="/profile">
              <img
                src={
                  profileImage
                }
                alt={
                  profileName
                }
                className="h-10 w-10 rounded-full object-cover"
              />
            </Link>

            <div className="flex-1">
              <p className="text-[13px] font-semibold text-white">
                {profileName}
              </p>
              <p className="text-[11px] text-white/50">
                {profileUniversity}
              </p>
            </div>

            <button
              onClick={
                handleLogout
              }
              className="rounded-lg p-2 hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Link href="/login">
            Login
          </Link>
        )}


      </div>
    </aside>
  );
}