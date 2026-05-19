"use client";

import { motion } from "framer-motion";

export function TypingIndicator({ users }: { users: string[] }) {
  if (!users.length) return null;

  return (
    <div className="flex items-center gap-2 px-2 pb-1">
      <div className="flex items-center gap-1 rounded-full border border-pink-100 bg-pink-50 px-3 py-1.5 text-xs text-[#9B7065]">
        <span>{users[0]} is typing</span>
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((dot) => (
            <motion.span
              key={dot}
              animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }}
              transition={{ repeat: Infinity, duration: 0.9, delay: dot * 0.12 }}
              className="h-1.5 w-1.5 rounded-full bg-[#FF2D78]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
