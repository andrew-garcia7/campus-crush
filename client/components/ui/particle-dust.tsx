"use client";

import { motion } from "framer-motion";

export function ParticleDust() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {[...Array(40)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-fuchsia-200/60"
          style={{ left: `${(i * 13) % 100}%`, top: `${(i * 17) % 100}%` }}
          animate={{ y: [0, -10, 0], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 3 + (i % 3), repeat: Infinity }}
        />
      ))}
    </div>
  );
}
