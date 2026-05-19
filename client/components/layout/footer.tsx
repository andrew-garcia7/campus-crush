"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";

const FOOTER_LINKS = [
  { label: "About",    href: "#" },
  { label: "Blog",     href: "#" },
  { label: "Careers",  href: "#" },
  { label: "Privacy",  href: "#" },
  { label: "Terms",    href: "#" },
  { label: "Support",  href: "#" },
  { label: "Contact",  href: "#" },
];

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    ),
    gradient: "from-[#833AB4] via-[#FD1D1D] to-[#FCAF45]",
  },
  {
    label: "X / Twitter",
    href: "https://twitter.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    gradient: "from-sky-400 to-blue-600",
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
    gradient: "from-blue-500 to-blue-700",
  },
  {
    label: "Facebook",
    href: "https://facebook.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    gradient: "from-blue-600 to-indigo-700",
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M23.498 6.186a2.997 2.997 0 00-2.11-2.12C19.506 3.5 12 3.5 12 3.5s-7.506 0-9.389.566A2.997 2.997 0 00.502 6.186C0 8.085 0 12 0 12s0 3.915.502 5.814a2.997 2.997 0 002.109 2.12C4.494 20.5 12 20.5 12 20.5s7.506 0 9.389-.566a2.997 2.997 0 002.109-2.12C24 15.915 24 12 24 12s0-3.915-.502-5.814zM9.75 15.568V8.432L15.818 12 9.75 15.568z"/>
      </svg>
    ),
    gradient: "from-red-500 to-rose-600",
  },
  {
    label: "Discord",
    href: "https://discord.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M20.317 4.369A19.791 19.791 0 0015.126 3c-.225.404-.486.95-.666 1.374a18.27 18.27 0 00-5.04 0A13.407 13.407 0 008.753 3 19.736 19.736 0 003.56 4.37C.273 9.176-.616 13.86-.172 18.478A19.9 19.9 0 005.993 21c.496-.684.936-1.41 1.313-2.168a12.969 12.969 0 01-2.066-.99c.173-.127.342-.26.506-.399 3.984 1.87 8.307 1.87 12.245 0 .166.14.335.272.507.399-.66.386-1.35.718-2.067.99.377.758.817 1.484 1.313 2.168a19.89 19.89 0 006.168-2.522c.52-5.354-.889-10.001-3.595-14.109zM8.02 15.331c-1.2 0-2.184-1.11-2.184-2.469 0-1.36.965-2.469 2.184-2.469 1.219 0 2.203 1.11 2.184 2.469 0 1.36-.965 2.469-2.184 2.469zm7.959 0c-1.2 0-2.184-1.11-2.184-2.469 0-1.36.965-2.469 2.184-2.469 1.219 0 2.203 1.11 2.184 2.469 0 1.36-.965 2.469-2.184 2.469z"/>
      </svg>
    ),
    gradient: "from-indigo-500 to-violet-600",
  },
];

export function Footer() {
  return (
    <footer className="mt-8 mb-2 hidden rounded-[26px] border border-pink-100 bg-white px-5 py-4 text-center md:block">
      {/* Social icons */}
      <div className="mb-3 flex flex-wrap justify-center gap-2">
        {SOCIAL_LINKS.map((s) => (
          <motion.a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            title={s.label}
            whileHover={{ scale: 1.14, y: -2 }}
            whileTap={{ scale: 0.93 }}
            className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${s.gradient} text-white shadow-sm transition-opacity hover:opacity-90`}
          >
            {s.icon}
          </motion.a>
        ))}
      </div>

      {/* Links */}
      <div className="mb-3 flex flex-wrap justify-center gap-x-4 gap-y-1">
        {FOOTER_LINKS.map((l) => (
          <a
            key={l.label}
            href={l.href}
            className="text-[10px] font-medium uppercase tracking-[0.26em] text-[#9B7065]/60 transition-colors hover:text-[#FF2D78]"
          >
            {l.label}
          </a>
        ))}
      </div>

      {/* Copyright */}
      <p className="flex items-center justify-center gap-1 text-[10px] text-[#9B7065]/50">
        Made with <Heart className="h-2.5 w-2.5 fill-pink-500 text-pink-500" /> by Campus Crush © {new Date().getFullYear()}
      </p>
    </footer>
  );
}
