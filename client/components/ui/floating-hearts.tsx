"use client";

import { motion } from "framer-motion";

export function FloatingHearts() {
  const colors = ["#ff4fd8", "#b026ff", "#ff7bd5", "#c084fc", "#fb7185"];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {[...Array(14)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: `${8 + ((i * 7) % 84)}%`, bottom: -24 }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: -700, opacity: [0, 0.8, 0.4, 0] }}
          transition={{ duration: 8 + (i % 4), repeat: Infinity, delay: i * 0.35 }}
        >
          <svg
            width={18}
            height={18}
            viewBox="0 0 24 24"
            fill={colors[i % colors.length]}
            style={{
              filter:
                "drop-shadow(0 0 10px rgba(255,79,216,0.35)) drop-shadow(0 0 16px rgba(176,38,255,0.25))"
            }}
          >
            <path d="M12 21s-7.2-4.35-9.6-8.65C.7 9.15 2.1 5.9 5.1 4.8c1.9-.7 4 .05 5.2 1.6 1.2-1.55 3.3-2.3 5.2-1.6 3 1.1 4.4 4.35 2.7 7.55C19.2 16.65 12 21 12 21z" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}
