"use client";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Crown, Home, FileText, CalendarCheck } from "lucide-react";
import { useMemo } from "react";

type Plan = "starter" | "premium" | "vip";

const PLAN_LABELS: Record<Plan, string> = {
  starter: "Starter",
  premium: "Premium",
  vip:     "VIP",
};

const PLAN_COLOR: Record<Plan, string> = {
  starter: "from-emerald-400 to-teal-500",
  premium: "from-purple-500 to-fuchsia-500",
  vip:     "from-yellow-400 to-orange-500",
};

interface PaymentSuccessProps {
  show:       boolean;
  plan:       Plan;
  amount:     number;
  paymentId:  string;
  userName?:  string;
  /** Override the badge label. Defaults to "<Plan> Activated" */
  label?:     string;
  /** Override the subtitle line. Defaults to "You are now <Plan> ✨" */
  subtitle?:  string;
  /** Override tick circle gradient. Defaults to plan colour. */
  gradientClass?: string;
  onHome:        () => void;
  onViewReceipt: () => void;
}

export function PaymentSuccess({
  show, plan, amount, paymentId, userName,
  label, subtitle, gradientClass,
  onHome, onViewReceipt
}: PaymentSuccessProps) {
  // Stable random positions for coins (generated once per mount)
  const coins = useMemo(
    () => Array.from({ length: 14 }, (_, i) => ({
      id:       i,
      left:     5 + (i * 7) % 90,
      delay:    (i * 0.12) % 1.2,
      duration: 1.4 + (i % 4) * 0.25,
      size:     24 + (i % 3) * 8,
    })),
    []
  );

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm"
        >
          {/* ── Falling coins ───────────────────────────────────────────── */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {coins.map((c) => (
              <motion.div
                key={c.id}
                className="absolute flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 font-bold text-white shadow-[0_0_10px_rgba(234,179,8,0.6)]"
                style={{ left: `${c.left}%`, top: -c.size, width: c.size, height: c.size, fontSize: c.size * 0.42 }}
                animate={{ y: "110vh", rotate: [0, 180, 360], opacity: [0, 1, 1, 0] }}
                transition={{
                  delay: c.delay,
                  duration: c.duration,
                  ease: "easeIn",
                  repeat: Infinity,
                  repeatDelay: 0.6 + (c.id % 3) * 0.4,
                  times: [0, 0.1, 0.7, 1],
                }}
              >
                ₹
              </motion.div>
            ))}
          </div>

          {/* ── Card ────────────────────────────────────────────────────── */}
          <motion.div
            initial={{ scale: 0.7, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            className="relative mx-4 w-full max-w-sm overflow-hidden rounded-[2rem] border border-fuchsia-400/30 bg-gradient-to-b from-[#1c0940] to-[#0d041e] p-8 text-center shadow-[0_0_100px_rgba(196,70,255,0.45)]"
          >
            {/* ambient glow border */}
            <div className="pointer-events-none absolute inset-0 rounded-[2rem] border border-fuchsia-400/20 shadow-[inset_0_0_50px_rgba(196,70,255,0.12)]" />

            {/* ── Success tick ────────────────────────────────────────── */}
            <div className="mx-auto mb-5 h-20 w-20">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.25, 1] }}
                transition={{ delay: 0.15, duration: 0.55, times: [0, 0.65, 1] }}
                className={`flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${gradientClass ?? PLAN_COLOR[plan]} shadow-[0_0_35px_rgba(52,211,153,0.65)]`}
              >
                <CheckCircle className="h-10 w-10 text-white" strokeWidth={2.5} />
              </motion.div>
            </div>

            {/* ── Plan badge ──────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-500/10 px-4 py-1.5"
            >
              {label ? (
                <CalendarCheck className="h-4 w-4 text-yellow-300" />
              ) : (
                <Crown className="h-4 w-4 text-yellow-300" />
              )}
              <span className="text-sm font-semibold text-yellow-200">
                {label ?? `${PLAN_LABELS[plan]} Activated`}
              </span>
            </motion.div>

            {/* ── Headline ────────────────────────────────────────────── */}
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="mb-1 text-[1.6rem] font-bold text-white"
            >
              Payment Successful 🎉
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
              className="mb-1 text-sm text-purple-300/80"
            >
              {subtitle ?? (
                <>
                  {userName ? `Hey ${userName}, you` : "You"} are now{" "}
                  <span className="font-semibold text-fuchsia-300">{PLAN_LABELS[plan]}</span> ✨
                </>
              )}
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.72 }}
              className="mb-1 text-lg font-bold text-white"
            >
              ₹{amount.toLocaleString("en-IN")}
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.78 }}
              className="mb-7 font-mono text-[10px] text-purple-500/60"
            >
              {paymentId}
            </motion.p>

            {/* ── Buttons ─────────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.88 }}
              className="flex gap-3"
            >
              <button
                onClick={onHome}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-purple-600 py-3 text-sm font-semibold text-white shadow-[0_0_20px_rgba(147,51,234,0.45)] transition-colors hover:bg-purple-500"
              >
                <Home className="h-4 w-4" />
                {label ? "Done" : "Go to Home"}
              </button>
              <button
                onClick={onViewReceipt}
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-fuchsia-400/30 bg-fuchsia-600/20 py-3 text-sm font-semibold text-fuchsia-200 transition-colors hover:bg-fuchsia-600/35"
              >
                <FileText className="h-4 w-4" />
                View Receipt
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
