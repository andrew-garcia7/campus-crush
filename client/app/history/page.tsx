"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarCheck, Clock, CreditCard, Crown, RefreshCw, Star, Trash2, Wallet } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useToastStore } from "@/store/toast-store";
import { getUserIdFromToken } from "@/lib/auth";
import { useApiSWR } from "@/hooks/use-api-swr";
import { getProfileImage } from "@/lib/media";
import { DEMO_COACH_SEEDS } from "@/lib/demo-content";
import { api } from "@/services/api";
import { mutate } from "swr";
import { SectionCloseButton } from "@/components/layout/section-close-button";

type SessionBooking = {
  _id: string;
  // Populated coach object from API
  coach: { _id: string; name: string; title: string; avatar: string; pricePerSession: number } | null;
  // Denormalized fallbacks (saved at booking time)
  coachName:  string;
  coachImage: string;
  consultationType: string;
  scheduledFor: string;   // ISO datetime
  amount?: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  paymentId?: string;
  createdAt: string;
};

type PaymentRecord = {
  _id: string;
  plan: string;
  provider: string;
  status: string;
  amount?: number;
  amountInr?: number;
  billingPeriod?: string;
  createdAt: string;
  expiresAt?: string;
  // Coach session fields
  coachName?:   string;
  coachImage?:  string;
  sessionType?: string;
  scheduledFor?: string;
};

const TABS = ["Sessions", "Payments", "Subscriptions"] as const;

const SAMPLE_SESSIONS: SessionBooking[] = [
  {
    _id: "sh-1",
    coach:            { _id: "c1", name: DEMO_COACH_SEEDS[0].name, title: DEMO_COACH_SEEDS[0].title, avatar: DEMO_COACH_SEEDS[0].avatar, pricePerSession: DEMO_COACH_SEEDS[0].pricePerSession },
    coachName:        DEMO_COACH_SEEDS[0].name,
    coachImage:       DEMO_COACH_SEEDS[0].avatar,
    consultationType: "video",
    scheduledFor:     new Date(Date.now() - 5 * 86400000 + 18 * 3600000).toISOString(),
    amount:           DEMO_COACH_SEEDS[0].pricePerSession,
    status:           "completed",
    createdAt:        new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    _id: "sh-2",
    coach:            { _id: "c2", name: DEMO_COACH_SEEDS[1].name, title: DEMO_COACH_SEEDS[1].title, avatar: DEMO_COACH_SEEDS[1].avatar, pricePerSession: DEMO_COACH_SEEDS[1].pricePerSession },
    coachName:        DEMO_COACH_SEEDS[1].name,
    coachImage:       DEMO_COACH_SEEDS[1].avatar,
    consultationType: "call",
    scheduledFor:     new Date(Date.now() + 2 * 86400000 + 17 * 3600000).toISOString(),
    amount:           DEMO_COACH_SEEDS[1].pricePerSession,
    status:           "confirmed",
    createdAt:        new Date(Date.now() - 86400000).toISOString(),
  },
  {
    _id: "sh-3",
    coach:            { _id: "c3", name: DEMO_COACH_SEEDS[2].name, title: DEMO_COACH_SEEDS[2].title, avatar: DEMO_COACH_SEEDS[2].avatar, pricePerSession: DEMO_COACH_SEEDS[2].pricePerSession },
    coachName:        DEMO_COACH_SEEDS[2].name,
    coachImage:       DEMO_COACH_SEEDS[2].avatar,
    consultationType: "chat",
    scheduledFor:     new Date(Date.now() - 12 * 86400000 + 14 * 3600000).toISOString(),
    amount:           DEMO_COACH_SEEDS[2].pricePerSession,
    status:           "completed",
    createdAt:        new Date(Date.now() - 12 * 86400000).toISOString(),
  },
];

const SAMPLE_PAYMENTS: PaymentRecord[] = [
  {
    _id: "sp-1",
    plan: "premium",
    provider: "razorpay",
    status: "active",
    amount: 499,
    billingPeriod: "monthly",
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    _id: "sp-2",
    plan: "coach-session",
    provider: "razorpay",
    status: "completed",
    amount: 1049,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    _id: "sp-3",
    plan: "premium",
    provider: "razorpay",
    status: "failed",
    amount: 499,
    billingPeriod: "monthly",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

const STATUS_COLORS: Record<string, string> = {
  cancelled:  "bg-rose-100 text-rose-700 border-rose-200",
  failed:     "bg-rose-100 text-rose-700 border-rose-200",
  pending:    "bg-yellow-100 text-yellow-700 border-yellow-200",
  processing: "bg-yellow-100 text-yellow-700 border-yellow-200",
  confirmed:  "bg-blue-100 text-blue-700 border-blue-200",
  completed:  "bg-emerald-100 text-emerald-700 border-emerald-200",
  done:       "bg-emerald-100 text-emerald-700 border-emerald-200",
  active:     "bg-emerald-100 text-emerald-700 border-emerald-200",
  expired:    "bg-gray-100 text-gray-600 border-gray-200",
};

function formatStatusLabel(status?: string, context: "session" | "payment" | "subscription" = "payment") {
  const value = String(status || "pending").toLowerCase();
  if (value === "completed") return context === "subscription" ? "active" : "done";
  if (value === "active" && context === "payment") return "done";
  if (value === "pending" && context === "payment") return "processing";
  return value;
}

function normalizePaymentRecord(record: PaymentRecord): PaymentRecord {
  return {
    ...record,
    status: String(record.status || "pending").toLowerCase(),
    amount: record.amount ?? record.amountInr
  };
}

function formatDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatTime(d?: string) {
  if (!d) return "";
  return new Date(d).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
}

function formatDateTime(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true
  });
}

export default function HistoryPage() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const userId = getUserIdFromToken(token) || user?._id || user?.id;
  const pushToast = useToastStore((s) => s.push);

  const [tab, setTab] = useState<(typeof TABS)[number]>("Sessions");
  const [hiddenSessionIds, setHiddenSessionIds] = useState<string[]>([]);
  const [hiddenPaymentIds, setHiddenPaymentIds] = useState<string[]>([]);

  const { data: bookings, isLoading: loadingBookings } = useApiSWR<SessionBooking[]>(
    token && hydrated ? "/coaches/my-bookings" : null
  );
  const { data: payments, isLoading: loadingPayments } = useApiSWR<PaymentRecord[]>(
    token && hydrated && userId ? `/payments/history/${userId}` : null
  );

  // Use real data once the API has responded (even if the result is empty).
  // Only fall back to demo seeds when the user is not authenticated or the request hasn't run yet.
  const isAuthenticated = Boolean(token && hydrated && userId);
  const bookingsResolved = isAuthenticated && !loadingBookings;
  const paymentsResolved = isAuthenticated && !loadingPayments;

  const sessions = ((bookingsResolved ? (bookings ?? []) : SAMPLE_SESSIONS) as SessionBooking[]).filter(
    (booking) => !hiddenSessionIds.includes(booking._id)
  );
  const allPayments = ((paymentsResolved ? (payments ?? []) : SAMPLE_PAYMENTS) as PaymentRecord[])
    .map(normalizePaymentRecord)
    .filter((payment) => !hiddenPaymentIds.includes(payment._id));
  const subscriptions = allPayments.filter((payment) => {
    const status = String(payment.status || "").toLowerCase();
    // Only show actual recurring premium plans in Subscriptions tab (not one-time coach sessions)
    return payment.plan !== "session" && ["active", "cancelled", "expired"].includes(status);
  });
  const bookingsKey = token && hydrated ? "/coaches/my-bookings" : null;
  const paymentsKey = token && hydrated && userId ? `/payments/history/${userId}` : null;
  const canDeleteSessionHistory = Boolean(sessions.length);
  const canDeletePaymentHistory = Boolean(allPayments.length);

  const deleteSessionMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      if (!token) {
        throw new Error("Sign in to continue");
      }

      return api.delete(`/coaches/my-bookings/${bookingId}`);
    },
    onSuccess: async () => {
      if (bookingsKey) await mutate(bookingsKey);
      pushToast({ title: "History deleted", message: "Session history removed.", variant: "success" });
    },
    onError: (error: any) => {
      pushToast({ title: "Delete failed", message: error?.response?.data?.message || "Please try again.", variant: "error" });
    }
  });

  const deletePaymentMutation = useMutation({
    mutationFn: async (recordId: string) => {
      if (!token || !userId) {
        throw new Error("Sign in to continue");
      }

      return api.delete(`/payments/history/${userId}/${recordId}`);
    },
    onSuccess: async () => {
      if (paymentsKey) await mutate(paymentsKey);
      pushToast({ title: "History deleted", message: "Payment history removed.", variant: "success" });
    },
    onError: (error: any) => {
      pushToast({ title: "Delete failed", message: error?.response?.data?.message || "Please try again.", variant: "error" });
    }
  });

  const handleDeleteSession = (bookingId: string) => {
    if (bookingsResolved && token && hydrated) {
      deleteSessionMutation.mutate(bookingId);
      return;
    }

    setHiddenSessionIds((current) => [...current, bookingId]);
    pushToast({ title: "History deleted", message: "Session history removed.", variant: "success" });
  };

  const handleDeletePayment = (recordId: string) => {
    if (paymentsResolved && token && hydrated && userId) {
      deletePaymentMutation.mutate(recordId);
      return;
    }

    setHiddenPaymentIds((current) => [...current, recordId]);
    pushToast({ title: "History deleted", message: "Payment history removed.", variant: "success" });
  };

  const SESSION_TYPE_ICON: Record<string, string> = { chat: "💬", video: "📹", call: "📞" };

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-pink-100 bg-white shadow-[0_4px_24px_rgba(255,45,120,0.08)]"
      >
        {/* Header */}
        <div className="relative overflow-hidden px-5 pt-6 pb-4">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-purple-500/15 blur-2xl" />
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FF2D78] shadow-[0_4px_12px_rgba(255,45,120,0.4)]">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#2D1810]">History</h1>
                <p className="text-xs text-[#9B7065]">Your bookings, payments &amp; subscriptions</p>
              </div>
            </div>
            <SectionCloseButton />
          </div>
        </div>

        {/* Tabs */}
        <div className="mx-5 mb-4 flex rounded-2xl border border-pink-100 bg-pink-50/60 p-1 gap-1">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`relative flex-1 rounded-xl py-1.5 text-xs font-medium transition-colors ${tab === t ? "text-white" : "text-[#9B7065]"}`}
            >
              {tab === t && (
                <motion.div layoutId="history-tab" className="absolute inset-0 rounded-xl bg-[#FF2D78] shadow-[0_2px_8px_rgba(255,45,120,0.3)]" />
              )}
              <span className="relative z-10">{t}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === "Sessions" && (
            <motion.div
              key="sessions"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              className="space-y-3 px-5 pb-6"
            >
              {loadingBookings
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-20 animate-pulse rounded-2xl bg-pink-50" />
                  ))
                : sessions.length === 0
                ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                    <CalendarCheck className="h-10 w-10 text-pink-300" />
                    <p className="text-sm text-[#9B7065]">No sessions booked yet</p>
                  </div>
                )
                : sessions.map((booking) => {
                  const avatarSrc = booking.coach?.avatar || booking.coachImage || "";
                  const coachName = booking.coach?.name  || booking.coachName  || "Coach";
                  const coachTitle = booking.coach?.title || "";
                  const sessionAmt = booking.amount ?? booking.coach?.pricePerSession;
                  return (
                  <div key={booking._id} className="flex items-center gap-3 rounded-2xl border border-pink-100 bg-white p-3.5">
                    {avatarSrc ? (
                      <img
                        src={getProfileImage(avatarSrc, coachName)}
                        alt={coachName}
                        className="h-12 w-12 rounded-2xl object-cover flex-shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(coachName)}`; }}
                      />
                    ) : (
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-pink-50">
                        <Star className="h-5 w-5 text-[#FF2D78]" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-[#2D1810] truncate">{coachName}</p>
                          {coachTitle && <p className="text-[11px] text-[#9B7065]">{coachTitle}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`flex-shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[formatStatusLabel(booking.status, "session")] || STATUS_COLORS.pending}`}>
                            {formatStatusLabel(booking.status, "session")}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteSession(booking._id)}
                            title="Delete session history"
                            className="rounded-full border border-rose-300/20 bg-rose-500/10 p-1.5 text-rose-200"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-[#9B7065]">
                        <span>{SESSION_TYPE_ICON[booking.consultationType] || "📅"} {booking.consultationType}</span>
                        <span>📅 {formatDate(booking.scheduledFor)}</span>
                        {booking.scheduledFor && <span>⏰ {formatTime(booking.scheduledFor)}</span>}
                      </div>
                      {typeof sessionAmt === "number" && (
                        <p className="mt-0.5 text-[11px] font-medium text-[#FF2D78]">₹{sessionAmt.toLocaleString("en-IN")}</p>
                      )}
                    </div>
                  </div>
                  );
                })
              }
            </motion.div>
          )}

          {tab === "Payments" && (
            <motion.div
              key="payments"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              className="space-y-3 px-5 pb-6"
            >
              {loadingPayments
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-16 animate-pulse rounded-2xl bg-pink-50" />
                  ))
                : allPayments.length === 0
                ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                    <CreditCard className="h-10 w-10 text-pink-300" />
                    <p className="text-sm text-[#9B7065]">No payments yet</p>
                  </div>
                )
                : allPayments.map((p) => {
                  const isSession = p.plan === "session";
                  return (
                  <div key={p._id} className="flex items-center gap-3 rounded-2xl border border-pink-100 bg-white p-3.5">
                    {isSession && p.coachImage ? (
                      <img
                        src={getProfileImage(p.coachImage, p.coachName || "Coach")}
                        alt={p.coachName || "Coach"}
                        className="h-10 w-10 rounded-2xl object-cover flex-shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(p.coachName || "coach")}`; }}
                      />
                    ) : (
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-50">
                        <Wallet className="h-4 w-4 text-amber-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-[#2D1810] capitalize">
                          {isSession ? (p.coachName || "Coaching Session") : `${p.plan} Plan`}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className={`flex-shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[formatStatusLabel(p.status, "payment")] || STATUS_COLORS.pending}`}>
                            {formatStatusLabel(p.status, "payment")}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeletePayment(p._id)}
                            title="Delete transaction"
                            className="rounded-full border border-rose-300/20 bg-rose-500/10 p-1.5 text-rose-200"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-[#9B7065]">
                        <span className="capitalize">{p.provider || "Razorpay"}</span>
                        {!isSession && p.billingPeriod && <span className="capitalize">{p.billingPeriod}</span>}
                        {isSession && p.sessionType && <span className="capitalize">{SESSION_TYPE_ICON[p.sessionType] || "📅"} {p.sessionType}</span>}
                        <span>📅 {formatDate(p.scheduledFor ?? p.createdAt)}</span>
                        {(p.scheduledFor || p.createdAt) && <span>⏰ {formatTime(p.scheduledFor ?? p.createdAt)}</span>}
                      </div>
                      {typeof p.amount === "number" && (
                        <p className="mt-0.5 text-[11px] font-medium text-[#FF2D78]">₹{p.amount.toLocaleString("en-IN")}</p>
                      )}
                    </div>
                  </div>
                  );
                })
              }
            </motion.div>
          )}

          {tab === "Subscriptions" && (
            <motion.div
              key="subscriptions"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              className="space-y-3 px-5 pb-6"
            >
              {loadingPayments
                ? Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="h-20 animate-pulse rounded-2xl bg-pink-50" />
                  ))
                : subscriptions.length === 0
                ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                    <Crown className="h-10 w-10 text-amber-400" />
                    <p className="text-sm text-[#9B7065]">No subscriptions yet</p>
                    <button
                      type="button"
                      onClick={() => { window.location.href = "/premium"; }}
                      className="rounded-full bg-[#FF2D78] px-5 py-2 text-xs font-semibold text-white shadow-[0_4px_12px_rgba(255,45,120,0.4)]"
                    >
                      Explore Premium
                    </button>
                  </div>
                )
                : subscriptions.map((sub) => (
                  <div key={sub._id} className="rounded-2xl border border-pink-100 bg-white p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4 text-amber-500" />
                        <p className="text-sm font-semibold text-[#2D1810] capitalize">{sub.plan} Plan</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[formatStatusLabel(sub.status, "subscription")] || STATUS_COLORS.pending}`}>
                          {formatStatusLabel(sub.status, "subscription")}
                        </span>
                        {canDeletePaymentHistory ? (
                          <button
                            type="button"
                            onClick={() => handleDeletePayment(sub._id)}
                            title="Delete subscription history"
                            className="rounded-full border border-rose-300/20 bg-rose-500/10 p-1.5 text-rose-200"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        ) : null}
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-[#9B7065]">
                      <span className="capitalize">{sub.provider}</span>
                      {sub.billingPeriod && <span className="flex items-center gap-1"><RefreshCw className="h-2.5 w-2.5" />{sub.billingPeriod}</span>}
                      <span>📅 {formatDate(sub.createdAt)}</span>
                      <span>⏰ {formatTime(sub.createdAt)}</span>
                    </div>
                    {typeof sub.amount === "number" && (
                      <p className="mt-1 text-xs font-medium text-[#FF2D78]">₹{sub.amount.toLocaleString("en-IN")}</p>
                    )}
                  </div>
                ))
              }
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
