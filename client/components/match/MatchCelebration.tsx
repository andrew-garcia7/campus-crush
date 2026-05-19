"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, User, X } from "lucide-react";
import { ConfettiParticles } from "./ConfettiParticles";
import { HeartExplosion } from "./HeartExplosion";

interface MatchCelebrationProps {
  open: boolean;
  firstUserImage: string;
  secondUserImage: string;
  firstName: string;
  secondName: string;
  onSendMessage: () => void;
  onKeepSwiping: () => void;
}

function AvatarCircle({ src, name, className }: { src: string; name: string; className?: string }) {
  if (src) {
    return <img src={src} alt={name} className={`h-24 w-24 rounded-full object-cover ${className ?? ""}`} />;
  }
  return (
    <div className={`flex h-24 w-24 items-center justify-center rounded-full bg-[linear-gradient(145deg,#f7e0eb,#ead79b)] ${className ?? ""}`}>
      <User className="h-10 w-10 text-white/70" />
    </div>
  );
}

function FloatingHeart({ delay, startX }: { delay: number; startX: number }) {
  return (
    <motion.div
      className="pointer-events-none absolute bottom-0 select-none text-xl"
      style={{ left: `${startX}%` }}
      initial={{ y: 0, opacity: 0 }}
      animate={{ y: -480, opacity: [0, 0.9, 0.9, 0] }}
      transition={{ duration: 3.2, delay, ease: "easeOut", repeat: Infinity, repeatDelay: 0.8 }}
    >
      ❤️
    </motion.div>
  );
}

export function MatchCelebration(props: MatchCelebrationProps) {
  return (
    <AnimatePresence>
      {props.open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.25 } }}
          className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden"
          style={{ backdropFilter: "blur(14px)", background: "rgba(18,7,19,0.90)" }}
        >
          <ConfettiParticles />
          <HeartExplosion />

          {/* Looping ambient hearts */}
          {[6, 18, 32, 50, 66, 80, 90].map((x, i) => (
            <FloatingHeart key={x} delay={i * 0.45} startX={x} />
          ))}

          <motion.div
            initial={{ scale: 0.72, y: 32, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.88, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.08 }}
            className="relative z-10 w-[92%] max-w-md overflow-hidden rounded-[36px] border border-[#f7e7b2]/18 text-center shadow-[0_32px_80px_rgba(0,0,0,0.55)]"
            style={{ background: "linear-gradient(180deg,rgba(60,24,70,0.96) 0%,rgba(26,10,30,0.98) 100%)" }}
          >
            {/* Radial glow at top */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_at_top,rgba(247,176,210,0.22),transparent_70%)]" />

            {/* Close */}
            <button
              onClick={props.onKeepSwiping}
              className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/8 text-white/50 transition-colors hover:bg-white/14 hover:text-white/80"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative z-10 px-8 pb-8 pt-10">
              {/* Avatars */}
              <div className="mb-6 flex items-center justify-center">
                <motion.div
                  initial={{ x: -36, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.22, type: "spring", stiffness: 200, damping: 18 }}
                  className="relative"
                >
                  <AvatarCircle
                    src={props.firstUserImage}
                    name={props.firstName}
                    className="ring-2 ring-[#f3c7d8] shadow-[0_0_28px_rgba(243,199,216,0.45)]"
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full ring-4 ring-[#f3c7d8]/30"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                </motion.div>

                <motion.div
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.38, type: "spring", stiffness: 320, damping: 14 }}
                  className="relative z-10 -mx-3 flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#f7e7b2]/25 bg-[#f7e7b2]/12 text-2xl shadow-[0_0_24px_rgba(247,231,178,0.45)]"
                >
                  ❤️
                </motion.div>

                <motion.div
                  initial={{ x: 36, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.22, type: "spring", stiffness: 200, damping: 18 }}
                  className="relative"
                >
                  <AvatarCircle
                    src={props.secondUserImage}
                    name={props.secondName}
                    className="ring-2 ring-[#f7e7b2] shadow-[0_0_28px_rgba(247,231,178,0.45)]"
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full ring-4 ring-[#f7e7b2]/30"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2, delay: 0.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                </motion.div>
              </div>

              {/* Text */}
              <motion.div
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.48 }}
              >
                <h2 className="editorial-title text-[3.2rem] leading-none">It's a Match!</h2>
                <p className="mt-2 text-sm text-[#f4e4ec]/75">
                  You and <span className="font-semibold text-white">{props.secondName}</span> liked each other
                </p>
              </motion.div>

              {/* Buttons */}
              <motion.div
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 flex gap-3"
              >
                <button
                  onClick={props.onSendMessage}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#f7e0eb,#f1cfdd_45%,#ead79b)] px-4 py-3 font-semibold text-[#2a132f] shadow-[0_4px_24px_rgba(247,224,235,0.28)] transition-opacity hover:opacity-88"
                >
                  <MessageCircle className="h-4 w-4" />
                  Send Message
                </button>
                <button
                  onClick={props.onKeepSwiping}
                  className="flex-1 rounded-full border border-[#f7e7b2]/18 bg-white/8 px-4 py-3 text-[#f4e4ec] transition-colors hover:bg-white/12"
                >
                  Keep Swiping
                </button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
