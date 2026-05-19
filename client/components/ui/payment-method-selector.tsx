"use client";
import { motion, AnimatePresence } from "framer-motion";
import { SiGooglepay, SiPhonepe, SiPaytm } from "react-icons/si";
export type UpiApp = "gpay" | "phonepe" | "paytm" | "upi";
interface PaymentMethodSelectorProps {
  selected: UpiApp | null;
  onChange: (app: UpiApp | null) => void;
  className?: string;
}
function UpiLogo() {
  return (
    <svg viewBox="0 0 46 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M2 2v7a5 5 0 0 0 10 0V2" stroke="#FF6600" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <path d="M16 2v14M16 2h6a4 4 0 0 1 0 8h-6" stroke="#002B5B" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <line x1="30" y1="2"  x2="30" y2="16" stroke="#002B5B" strokeWidth="2.4" strokeLinecap="round" />
      <line x1="27" y1="2"  x2="33" y2="2"  stroke="#002B5B" strokeWidth="2.4" strokeLinecap="round" />
      <line x1="27" y1="16" x2="33" y2="16" stroke="#002B5B" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M38 9L42 5M38 9L42 13" stroke="#FF6600" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
interface MethodConfig {
  id:        UpiApp;
  label:     string;
  bg:        string;
  iconColor: string;
  ringColor: string;
  glowColor: string;
}
const METHODS: MethodConfig[] = [
  {
    id:        "gpay",
    label:     "Google Pay",
    bg:        "#ffffff",
    iconColor: "#5F6368",
    ringColor: "#4285F4",
    glowColor: "rgba(66,133,244,0.52)",
  },
  {
    id:        "phonepe",
    label:     "PhonePe",
    bg:        "#5f259f",
    iconColor: "#ffffff",
    ringColor: "#8b2fc9",
    glowColor: "rgba(95,37,159,0.58)",
  },
  {
    id:        "paytm",
    label:     "Paytm",
    bg:        "#002970",
    iconColor: "#ffffff",
    ringColor: "#00BAF2",
    glowColor: "rgba(0,186,242,0.52)",
  },
  {
    id:        "upi",
    label:     "UPI",
    bg:        "#ffffff",
    iconColor: "",
    ringColor: "#FF6600",
    glowColor: "rgba(255,102,0,0.48)",
  },
];
function MethodIcon({ id, color }: { id: UpiApp; color: string }) {
  if (id === "gpay")    return <SiGooglepay className="h-7 w-7" color={color} />;
  if (id === "phonepe") return <SiPhonepe   className="h-7 w-7" color={color} />;
  if (id === "paytm")   return <SiPaytm     className="h-7 w-7" color={color} />;
  return <div className="h-6 w-10"><UpiLogo /></div>;
}
export function PaymentMethodSelector({ selected, onChange, className = "" }: PaymentMethodSelectorProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-purple-400/60">
        Choose payment method
      </p>
      <div className="flex flex-wrap items-end gap-3">
        {METHODS.map((m) => {
          const isSelected = selected === m.id;
          return (
            <div key={m.id} className="flex flex-col items-center gap-1.5">
              <motion.button
                type="button"
                aria-label={m.label}
                aria-pressed={isSelected}
                onClick={() => onChange(isSelected ? null : m.id)}
                whileTap={{ scale: 0.88 }}
                animate={isSelected ? { scale: 1.1 } : { scale: 1 }}
                transition={{ type: "spring", stiffness: 380, damping: 22 }}
                style={{
                  backgroundColor: m.bg,
                  boxShadow: isSelected
                    ? `0 0 0 2.5px ${m.ringColor}, 0 0 20px ${m.glowColor}`
                    : "0 2px 8px rgba(0,0,0,0.25)",
                }}
                className={`relative flex h-14 w-14 items-center justify-center rounded-[14px] transition-opacity duration-200 ${
                  isSelected ? "opacity-100" : "opacity-60 hover:opacity-95"
                }`}
              >
                <MethodIcon id={m.id} color={m.iconColor} />
                {isSelected && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-purple-500 shadow-md"
                  >
                    <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.span>
                )}
              </motion.button>
              <span className={`text-[9px] font-medium leading-tight transition-colors duration-200 ${
                isSelected ? "text-purple-200" : "text-purple-400/50"
              }`}>
                {m.label}
              </span>
            </div>
          );
        })}
        <span className="self-center pb-5 text-[10px] text-purple-400/35">
          · Cards · Wallets
        </span>
      </div>
      <AnimatePresence>
        {selected && (
          <motion.p
            key={selected}
            initial={{ opacity: 0, y: -3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="text-[10px] text-purple-300/60"
          >
            {METHODS.find((m) => m.id === selected)?.label} selected · Opens first in Razorpay
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}