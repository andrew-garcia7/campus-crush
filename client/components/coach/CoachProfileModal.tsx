"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  BadgeCheck,
  Calendar,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  MessageCircleHeart,
  PhoneCall,
  Shield,
  Star,
  TrendingUp,
  Video,
  X,
} from "lucide-react";
import { api } from "@/services/api";
import { useToastStore } from "@/store/toast-store";
import { useAuthStore } from "@/store/auth-store";
import { PaymentMethodSelector, type UpiApp } from "@/components/ui/payment-method-selector";
import { loadRazorpayScript } from "@/hooks/use-razorpay";
import { PaymentSuccess } from "@/components/ui/payment-success";
import { PaymentReceipt, type ReceiptData } from "@/components/ui/payment-receipt";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type Coach = {
  _id: string;
  name: string;
  title: string;
  bio: string;
  specialization: string[];
  consultationTypes: Array<"chat" | "video" | "call">;
  pricePerSession: number;
  rating: number;
  reviewsCount: number;
  sessionsCompleted: number;
  avatar: string;
  badges: string[];
  photos?: string[];
  age?: number;
  occupation?: string;
  yearsExperience?: number;
  languages?: string[];
  successStories?: string[];
  testimonials?: Array<{ name: string; text: string; rating: number }>;
  sessionDuration?: number;
};

interface Props {
  coach: Coach;
  onClose: () => void;
}

const TIME_SLOTS = [
  { label: "Morning · 10:00 AM", time: "10:00" },
  { label: "Afternoon · 2:00 PM", time: "14:00" },
  { label: "Evening · 6:00 PM", time: "18:00" },
  { label: "Night · 8:30 PM", time: "20:30" },
];

const MOCK_TESTIMONIALS = [
  { name: "Aarav S.", text: "Changed the way I approach relationships entirely. Worth every rupee.", rating: 5 },
  { name: "Priya M.", text: "Helped me get out of a toxic cycle and find real connection.", rating: 5 },
  { name: "Rohan K.", text: "Super practical advice. Booked a second session immediately.", rating: 5 },
];

export function CoachProfileModal({ coach, onClose }: Props) {
  const toast = useToastStore((s) => s.push);
  const user = useAuthStore((s) => s.user);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [consultationType, setConsultationType] = useState<"chat" | "video" | "call">(
    coach.consultationTypes[0] || "chat"
  );
  const [bookingDate, setBookingDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [bookingTime, setBookingTime] = useState(TIME_SLOTS[2].time);
  const [showBooking, setShowBooking] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"idle" | "summary" | "processing" | "done">("idle");
  const [orderData, setOrderData] = useState<any>(null);
  const [selectedUpiMethod, setSelectedUpiMethod] = useState<UpiApp | null>(null);
  const [coachSuccessData, setCoachSuccessData] = useState<{ paymentId: string; orderId: string; amount: number } | null>(null);
  const [showCoachReceipt, setShowCoachReceipt] = useState(false);
  const [coachReceiptData, setCoachReceiptData] = useState<ReceiptData | null>(null);

  const photos = [coach.avatar, ...(coach.photos || [])].filter(Boolean).slice(0, 5);
  const testimonials = coach.testimonials?.length ? coach.testimonials : MOCK_TESTIMONIALS;
  const platformFee = Math.round(coach.pricePerSession * 0.05);
  const total = coach.pricePerSession + platformFee;

  const scheduledFor = new Date(`${bookingDate}T${bookingTime}`).toISOString();

  // Free booking (no Razorpay configured / demo coach) fallback
  const fallbackBookMutation = useMutation({
    mutationFn: async () => {
      // Demo coaches have non-ObjectId IDs — skip the API call and just show success
      const isRealCoach = /^[a-fA-F0-9]{24}$/.test(coach._id);
      if (!isRealCoach) return; // demo: simulate success without hitting backend
      await api.post(`/coaches/${coach._id}/book`, { consultationType, scheduledFor });
    },
    onSuccess: () => {
      setPaymentStep("done");
      toast({ title: "Session booked!", variant: "success" });
    },
    onError: (e: any) => {
      toast({ title: "Booking failed", message: e?.response?.data?.message || "Try again.", variant: "error" });
      setPaymentStep("idle");
    },
  });

  const handlePayWithRazorpay = async () => {
    setPaymentStep("processing");
    try {
      // Demo coaches have non-ObjectId IDs (e.g. "coach-rohan-mehta") — skip payment API
      const isRealCoach = /^[a-fA-F0-9]{24}$/.test(coach._id);
      if (!isRealCoach) {
        fallbackBookMutation.mutate();
        return;
      }

      // Ensure Razorpay checkout.js is loaded before using window.Razorpay
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast({ title: "Could not load payment gateway", message: "Check your internet connection and try again.", variant: "error" });
        setPaymentStep("summary");
        return;
      }

      const res = await api.post(`/coaches/${coach._id}/payment-order`);
      const order = res.data?.data;
      setOrderData(order);

      if (!order?.orderId || !order?.razorpayKeyId) {
        // Razorpay not configured — fallback to free booking
        fallbackBookMutation.mutate();
        return;
      }

      const options = {
        key: order.razorpayKeyId,
        amount: order.amount * 100,
        currency: "INR",
        name: "Campus Crush",
        description: `Session with ${coach.name}`,
        order_id: order.orderId,
        prefill: {
          name:  user?.fullName || user?.name || "",
          email: user?.email || "",
          // Pre-select UPI tab when user has chosen a UPI method.
          // Removing config.display.blocks avoids forcing UPI intent (deep-links
          // to real apps) which always fails in Razorpay test mode.
          ...(selectedUpiMethod ? { method: "upi" } : {}),
        },
        theme: { color: "#9333ea" },
        handler: async (response: any) => {
          try {
            await api.post(`/coaches/${coach._id}/verify-payment`, {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              consultationType,
              scheduledFor,
            });
            setPaymentStep("done");
            setCoachSuccessData({
              paymentId: response.razorpay_payment_id,
              orderId:   response.razorpay_order_id,
              amount:    order.amount,
            });
            toast({ title: "Session booked & paid!", variant: "success" });
          } catch {
            toast({ title: "Payment verified but booking failed", message: "Contact support.", variant: "error" });
            setPaymentStep("idle");
          }
        },
        modal: { ondismiss: () => setPaymentStep("summary") },
      };

      const rzp = new window.Razorpay(options);
      toast({ title: "Opening secure payment…", message: "Razorpay checkout loading", variant: "info" });
      rzp.open();
    } catch (e: any) {
      const status = e?.response?.status;
      // 503 = Razorpay not configured; 404/500 = coach not found or DB error — all fall back to free booking
      if (status === 503 || status === 404 || status === 500) {
        fallbackBookMutation.mutate();
      } else {
        toast({ title: "Could not initiate payment", message: e?.response?.data?.message || "Try again.", variant: "error" });
        setPaymentStep("summary");
      }
    }
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split("T")[0];

  const openCoachReceipt = (sd: NonNullable<typeof coachSuccessData>) => {
    const scheduledLabel = (() => {
      try {
        return new Date(`${bookingDate}T${bookingTime}`).toLocaleString("en-IN", {
          day: "2-digit", month: "short", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        });
      } catch { return `${bookingDate} ${bookingTime}`; }
    })();
    setCoachReceiptData({
      userName:     user?.fullName || user?.name,
      userEmail:    user?.email,
      plan:         "starter",           // required by type; overridden by label
      label:        "Coaching Session",
      coachName:    coach.name,
      sessionType:  consultationType,
      scheduledFor: scheduledLabel,
      amount:       total,
      paymentId:    sd.paymentId,
      orderId:      sd.orderId,
      date:         new Date(),
    });
    setCoachSuccessData(null);
    setShowCoachReceipt(true);
  };

  return (
    <>
      {/* ── Coach payment success overlay ──────────────────────── */}
      <AnimatePresence>
        {coachSuccessData && (
          <PaymentSuccess
            show
            plan="premium"
            gradientClass="from-fuchsia-500 to-purple-600"
            label="Session Booked! 🎓"
            subtitle={`${user?.fullName ? `Hey ${user.fullName}, your` : "Your"} session with ${coach.name} is confirmed ✨`}
            amount={total}
            paymentId={coachSuccessData.paymentId}
            userName={user?.fullName || user?.name}
            onHome={() => setCoachSuccessData(null)}
            onViewReceipt={() => openCoachReceipt(coachSuccessData)}
          />
        )}
      </AnimatePresence>

      {/* ── Coach receipt modal ─────────────────────────────────── */}
      {coachReceiptData && (
        <PaymentReceipt
          show={showCoachReceipt}
          data={coachReceiptData}
          onClose={() => { setShowCoachReceipt(false); setCoachReceiptData(null); }}
        />
      )}

      {/* ── Main modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-[36px] border border-fuchsia-300/20 bg-[#100420] shadow-[0_0_60px_rgba(196,70,255,0.35)] sm:rounded-[36px]"
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="overflow-y-auto">
            {/* Photo gallery */}
            <div className="relative h-72 w-full overflow-hidden bg-black/30 sm:h-80">
              <AnimatePresence mode="wait">
                <motion.img
                  key={photoIndex}
                  src={photos[photoIndex]}
                  alt={coach.name}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="h-full w-full object-cover"
                />
              </AnimatePresence>
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#100420] to-transparent" />
              {photos.length > 1 && (
                <>
                  <button
                    onClick={() => setPhotoIndex((i) => Math.max(0, i - 1))}
                    disabled={photoIndex === 0}
                    className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white disabled:opacity-30"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPhotoIndex((i) => Math.min(photos.length - 1, i + 1))}
                    disabled={photoIndex === photos.length - 1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white disabled:opacity-30"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-14 left-1/2 flex -translate-x-1/2 gap-1.5">
                    {photos.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPhotoIndex(i)}
                        className={`h-1.5 rounded-full transition-all ${i === photoIndex ? "w-5 bg-fuchsia-400" : "w-1.5 bg-white/40"}`}
                      />
                    ))}
                  </div>
                </>
              )}
              {/* Name overlay */}
              <div className="absolute bottom-3 left-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">{coach.name}</h2>
                  <BadgeCheck className="h-5 w-5 text-fuchsia-400" />
                </div>
                <p className="text-xs text-fuchsia-200">{coach.title}</p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-4 p-5">
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: Star, label: "Rating", value: coach.rating.toFixed(1) },
                  { icon: TrendingUp, label: "Sessions", value: `${coach.sessionsCompleted}+` },
                  { icon: Clock, label: "Duration", value: `${coach.sessionDuration || 60} min` },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex flex-col items-center gap-1 rounded-2xl border border-purple-300/15 bg-white/[0.05] p-3">
                    <Icon className="h-4 w-4 text-fuchsia-300" />
                    <p className="text-sm font-semibold text-white">{value}</p>
                    <p className="text-[10px] text-purple-300/60">{label}</p>
                  </div>
                ))}
              </div>

              {/* About */}
              <div>
                <h3 className="mb-1.5 text-sm font-semibold text-white">About</h3>
                <p className="text-xs leading-relaxed text-purple-100/75">{coach.bio}</p>
              </div>

              {/* Expertise */}
              <div>
                <h3 className="mb-2 text-sm font-semibold text-white">Expertise</h3>
                <div className="flex flex-wrap gap-1.5">
                  {coach.specialization.map((s) => (
                    <span key={s} className="rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-2.5 py-1 text-[11px] text-fuchsia-100">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-2">
                {coach.age != null && (
                  <div className="flex items-center gap-2 rounded-xl border border-purple-300/10 bg-white/[0.04] p-2.5">
                    <Award className="h-3.5 w-3.5 text-fuchsia-300 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-purple-300/60">Age</p>
                      <p className="text-xs font-medium text-white">{coach.age} years</p>
                    </div>
                  </div>
                )}
                {coach.occupation && (
                  <div className="flex items-center gap-2 rounded-xl border border-purple-300/10 bg-white/[0.04] p-2.5">
                    <TrendingUp className="h-3.5 w-3.5 text-fuchsia-300 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-purple-300/60">Occupation</p>
                      <p className="text-xs font-medium text-white truncate">{coach.occupation}</p>
                    </div>
                  </div>
                )}
                {coach.yearsExperience != null && (
                  <div className="flex items-center gap-2 rounded-xl border border-purple-300/10 bg-white/[0.04] p-2.5">
                    <Award className="h-3.5 w-3.5 text-fuchsia-300 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-purple-300/60">Experience</p>
                      <p className="text-xs font-medium text-white">{coach.yearsExperience} years</p>
                    </div>
                  </div>
                )}
                {coach.languages?.length ? (
                  <div className="flex items-center gap-2 rounded-xl border border-purple-300/10 bg-white/[0.04] p-2.5">
                    <Globe className="h-3.5 w-3.5 text-fuchsia-300 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-purple-300/60">Languages</p>
                      <p className="text-xs font-medium text-white">{coach.languages.slice(0, 2).join(", ")}</p>
                    </div>
                  </div>
                ) : null}
                <div className="flex items-center gap-2 rounded-xl border border-purple-300/10 bg-white/[0.04] p-2.5">
                  <Shield className="h-3.5 w-3.5 text-fuchsia-300 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-purple-300/60">Reviews</p>
                    <p className="text-xs font-medium text-white">{coach.reviewsCount} verified</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-purple-300/10 bg-white/[0.04] p-2.5">
                  <Calendar className="h-3.5 w-3.5 text-fuchsia-300 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-purple-300/60">Availability</p>
                    <p className="text-xs font-medium text-white">Mon – Sat</p>
                  </div>
                </div>
              </div>

              {/* Badges */}
              {coach.badges?.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {coach.badges.map((b) => (
                    <span key={b} className="flex items-center gap-1 rounded-full border border-yellow-400/20 bg-yellow-500/10 px-2 py-0.5 text-[10px] text-yellow-200">
                      <Star className="h-2.5 w-2.5" /> {b}
                    </span>
                  ))}
                </div>
              ) : null}

              {/* Success stories */}
              {coach.successStories?.length ? (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-white">Success Stories</h3>
                  <div className="space-y-2">
                    {coach.successStories.slice(0, 2).map((story, i) => (
                      <div key={i} className="rounded-2xl border border-emerald-400/15 bg-emerald-500/[0.05] p-3">
                        <p className="text-[11px] leading-relaxed text-emerald-100/80">{story}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Testimonials */}
              <div>
                <h3 className="mb-2 text-sm font-semibold text-white">What clients say</h3>
                <div className="space-y-2">
                  {testimonials.slice(0, 3).map((t, i) => (
                    <div key={i} className="rounded-2xl border border-purple-300/10 bg-white/[0.04] p-3">
                      <div className="mb-1 flex items-center justify-between">
                        <p className="text-xs font-medium text-white">{t.name}</p>
                        <div className="flex gap-0.5">
                          {Array.from({ length: t.rating }).map((_, j) => (
                            <Star key={j} className="h-2.5 w-2.5 fill-yellow-300 text-yellow-300" />
                          ))}
                        </div>
                      </div>
                      <p className="text-[11px] leading-relaxed text-purple-100/70">{t.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Booking section */}
              <div className="rounded-3xl border border-fuchsia-400/20 bg-fuchsia-500/[0.06] p-4">
                <button
                  onClick={() => setShowBooking((v) => !v)}
                  className="flex w-full items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">Book a private session</p>
                    <p className="text-xs text-purple-300/60">Rs {coach.pricePerSession} · {coach.sessionDuration || 60} min</p>
                  </div>
                  <span className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-xs font-semibold text-white">
                    {showBooking ? "Hide" : "Book now"}
                  </span>
                </button>

                <AnimatePresence>
                  {showBooking && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 space-y-3">
                        {/* Session type */}
                        <div className="grid grid-cols-3 gap-2">
                          {coach.consultationTypes.map((type) => (
                            <button
                              key={type}
                              onClick={() => setConsultationType(type)}
                              className={`rounded-xl px-2 py-2 text-[11px] ${consultationType === type ? "bg-fuchsia-500/20 text-white border border-fuchsia-400/30" : "border border-purple-300/15 text-purple-200"}`}
                            >
                              <span className="mx-auto flex w-fit items-center gap-1">
                                {type === "chat" ? <MessageCircleHeart className="h-3.5 w-3.5" /> : null}
                                {type === "video" ? <Video className="h-3.5 w-3.5" /> : null}
                                {type === "call" ? <PhoneCall className="h-3.5 w-3.5" /> : null}
                                {type}
                              </span>
                            </button>
                          ))}
                        </div>

                        {/* Date picker */}
                        <div>
                          <div className="mb-1.5 flex items-center gap-2 text-xs text-purple-200">
                            <CalendarClock className="h-3.5 w-3.5" /> Pick a date &amp; time
                          </div>
                          <input
                            type="date"
                            value={bookingDate}
                            min={minDateStr}
                            onChange={(e) => setBookingDate(e.target.value)}
                            className="w-full rounded-xl border border-purple-300/15 bg-white/[0.05] px-3 py-2 text-xs text-white outline-none focus:border-fuchsia-400/30 [color-scheme:dark]"
                          />
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            {TIME_SLOTS.map((slot) => (
                              <button
                                key={slot.time}
                                onClick={() => setBookingTime(slot.time)}
                                className={`rounded-xl px-3 py-2 text-left text-xs ${bookingTime === slot.time ? "bg-fuchsia-500/20 text-white border border-fuchsia-400/30" : "border border-purple-300/15 text-purple-200"}`}
                              >
                                {slot.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Payment summary or done */}
                        {paymentStep === "done" ? (
                          <div className="flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-500/15 p-3">
                            <BadgeCheck className="h-4 w-4 text-emerald-300" />
                            <p className="text-sm font-medium text-emerald-200">Session confirmed! Check your email.</p>
                          </div>
                        ) : (
                          <>
                            {/* Price breakdown */}
                            <div className="space-y-1.5 rounded-2xl border border-purple-300/10 bg-white/[0.04] p-3">
                              <div className="flex justify-between text-xs text-purple-200">
                                <span>Session fee</span>
                                <span>₹{coach.pricePerSession}</span>
                              </div>
                              <div className="flex justify-between text-xs text-purple-300/60">
                                <span>Platform fee (5%)</span>
                                <span>₹{platformFee}</span>
                              </div>
                              <div className="mt-1 flex justify-between border-t border-purple-300/10 pt-1.5 text-sm font-semibold text-white">
                                <span>Total</span>
                                <span>₹{total}</span>
                              </div>
                            </div>

                            {/* UPI payment method selector */}
                            {paymentStep === "summary" && (
                              <div className="rounded-2xl border border-purple-300/10 bg-white/[0.03] p-3">
                                <PaymentMethodSelector
                                  selected={selectedUpiMethod}
                                  onChange={setSelectedUpiMethod}
                                />
                              </div>
                            )}

                            <div className="flex gap-2">
                              <button
                                onClick={paymentStep === "idle" ? () => setPaymentStep("summary") : handlePayWithRazorpay}
                                disabled={paymentStep === "processing"}
                                className="flex-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 py-2.5 text-xs font-semibold text-white disabled:opacity-60"
                              >
                                {paymentStep === "processing"
                                  ? "Initiating..."
                                  : paymentStep === "summary"
                                  ? "Pay ₹" + total + " · Razorpay"
                                  : "Review & Pay"}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
      </AnimatePresence>
    </>
  );
}
