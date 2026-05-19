"use client";

import { motion } from "framer-motion";

export function HeartExplosion() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {[...Array(16)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl"
          initial={{ opacity: 1, scale: 0.7, x: 0, y: 0 }}
          animate={{
            opacity: 0,
            scale: 1.5,
            x: Math.cos((i / 16) * Math.PI * 2) * 180,
            y: Math.sin((i / 16) * Math.PI * 2) * 180
          }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        >
          ❤️
        </motion.div>
      ))}
    </div>
  );
}
