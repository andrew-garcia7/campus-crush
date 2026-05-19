"use client";

import { motion } from "framer-motion";

export function ConfettiParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {[...Array(42)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-2 w-2 rounded-sm"
          style={{ left: `${(i * 23) % 100}%`, background: i % 2 ? "#ff4fd8" : "#b026ff" }}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 700, opacity: [0, 1, 1, 0], rotate: 360 }}
          transition={{ duration: 2 + (i % 5) * 0.2, repeat: Infinity, delay: (i % 8) * 0.1 }}
        />
      ))}
    </div>
  );
}
