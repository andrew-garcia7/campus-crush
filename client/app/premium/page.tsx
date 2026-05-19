"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Star, Zap, Check, X, Sparkles, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { getUserIdFromToken } from "@/lib/auth";
import { useToastStore } from "@/store/toast-store";
import { SectionCloseButton } from "@/components/layout/section-close-button";
import { useRazorpay, type RzpSuccessData } from "@/hooks/use-razorpay";
import { PaymentSuccess } from "@/components/ui/payment-success";
import { PaymentReceipt, type ReceiptData } from "@/components/ui/payment-receipt";
import { TransactionHistory } from "@/components/ui/transaction-history";
import { api } from "@/services/api";
import { PaymentMethodSelector, type UpiApp } from "@/components/ui/payment-method-selector";
type Plan          = "starter" | "premium" | "vip";
type BillingPeriod = "monthly" | "quarterly" | "yearly";
const PLAN_PRICING: Record<Plan, Record<BillingPeriod, { amount: number; saving?: string }>> = {
  starter: {
    monthly:   { amount: 199 },
    quarterly: { amount: 499,   saving: "Save 16%" },
    yearly:    { amount: 1299,  saving: "Save 46%" },
  },
  premium: {
    monthly:   { amount: 499 },
    quarterly: { amount: 1299,  saving: "Save 13%" },
    yearly:    { amount: 3999,  saving: "Save 33%" },
  },
  vip: {
    monthly:   { amount: 1999 },
    quarterly: { amount: 4999,  saving: "Save 17%" },
    yearly:    { amount: 14999, saving: "Save 37%" },
  },
};
const BILLING_LABELS: Record<BillingPeriod, string> = {
  monthly: "Monthly", quarterly: "3 Months", yearly: "Yearly",
};
const COMPARISON_ROWS = [
  { label: "Daily Likes",        free: "10/day", starter: "Boosted",    premium: "Unlimited", vip: "Unlimited" },
  { label: "Super Likes",        free: "1/day",  starter: "1/day",      premium: "5/day",     vip: "Unlimited" },
  { label: "See Who Liked You",  free: false,    starter: false,         premium: true,        vip: true        },
  { label: "AI Coach",           free: "3/day",  starter: "5/day",      premium: "Unlimited", vip: "Unlimited" },
  { label: "Profile Boost",      free: false,    starter: false,         premium: "1/week",    vip: "Daily"     },
  { label: "Basic Filters",      free: true,     starter: true,          premium: true,        vip: true        },
  { label: "Advanced Filters",   free: false,    starter: false,         premium: true,        vip: true        },
  { label: "Undo Last Swipe",    free: false,    starter: false,         premium: true,        vip: true        },
  { label: "Priority Match",     free: false,    starter: false,         premium: false,       vip: true        },
  { label: "Live Help",          free: false,    starter: false,         premium: false,       vip: true        },
  { label: "VIP Badge",          free: false,    starter: false,         premium: false,       vip: true        },
];

const CellValue = ({ val }: { val: boolean | string }) => {
  if (val === true)  return <Check className="mx-auto h-4 w-4 text-emerald-500" />;
  if (val === false) return <X className="mx-auto h-4 w-4 text-gray-300" />;
  return <span className="text-[11px] text-[#6B4B40]">{val}</span>;
};
function PeriodLabel({ period }: { period: BillingPeriod }) {
  if (period === "monthly")   return <>mo</>;
  if (period === "quarterly") return <>3 mo</>;
  return <>yr</>;
}
export default function PremiumPage() {
  const token   = useAuthStore((s) => s.token);
  // Auth hydration is handled globally by ClientProviders/AuthBootstrap.
  const user    = useAuthStore((s) => s.user);
  const toast   = useToastStore((s) => s.push);
  const userId  = getUserIdFromToken(token) || user?._id || (user as any)?.id || "";
  const [activePlan,    setActivePlan]    = useState("");
  const [tab,           setTab]           = useState<"cards" | "compare">("cards");
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");
  const [successData,   setSuccessData]   = useState<RzpSuccessData | null>(null);
  const [showReceipt,       setShowReceipt]       = useState(false);
  const [receiptData,       setReceiptData]       = useState<ReceiptData | null>(null);
  const [selectedUpiMethod, setSelectedUpiMethod] = useState<UpiApp | null>(null);
  const { openCheckout, loading: rzpLoading } = useRazorpay();
  useEffect(() => {
    if (!userId) return;
    api.get(`/payments/status/${userId}`).then((res) => {
      const sub = res.data?.data?.subscription;
      if (sub?.status === "active") setActivePlan(sub.plan);
    }).catch(() => {});
  }, [userId]);
  const handlePay = (plan: Plan) => {
    if (!userId) {
      toast({ title: "Not logged in", message: "Please sign in to purchase a plan.", variant: "error" });
      return;
    }
    const { amount } = PLAN_PRICING[plan][billingPeriod];
    openCheckout({
      userId,
      plan,
      billingPeriod,
      amount,
      userName:        user?.name,
      userEmail:       user?.email,
      preferredMethod: selectedUpiMethod ?? undefined,
      onSuccess: (data) => {
        setSuccessData(data);
        setActivePlan(plan);
        toast({ title: "Payment Successful!", message: `Welcome to ${plan.toUpperCase()}!`, variant: "success" });
      },
      onFailure: (msg) => {
        if (!msg.toLowerCase().includes("cancel")) {
          toast({ title: "Payment failed", message: msg, variant: "error" });
        }
      },
    });
  };
  const openReceipt = (data: RzpSuccessData) => {
    setReceiptData({
      userName:  user?.name,
      userEmail: user?.email,
      plan:      data.plan,
      amount:    data.amount,
      paymentId: data.paymentId,
      orderId:   data.orderId,
      date:      new Date(),
    });
    setSuccessData(null);
    setShowReceipt(true);
  };
  return (
    <>
      {/* Payment success overlay */}
      <AnimatePresence>
        {successData && (
          <PaymentSuccess
            show
            plan={successData.plan}
            amount={successData.amount}
            paymentId={successData.paymentId}
            userName={user?.name}
            onHome={() => setSuccessData(null)}
            onViewReceipt={() => openReceipt(successData)}
          />
        )}
      </AnimatePresence>
      {receiptData && (
        <PaymentReceipt
          show={showReceipt}
          data={receiptData}
          onClose={() => setShowReceipt(false)}
        />
      )}

      <div className="w-full">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-[0_4px_24px_rgba(255,45,120,0.08)]"
        >
          {/* ── Hero ── */}
          <div className="relative overflow-hidden px-5 pt-6 pb-5">
            {/* Background glows */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-yellow-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-fuchsia-600/10 blur-2xl" />

            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ scale: [1, 1.08, 1], boxShadow: ["0 0 20px rgba(234,179,8,0.5)", "0 0 36px rgba(234,179,8,0.9)", "0 0 20px rgba(234,179,8,0.5)"] }}
                  transition={{ repeat: Infinity, duration: 2.4 }}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500"
                >
                  <Crown className="h-6 w-6 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-xl font-bold text-[#2D1810]">Campus Crush <span className="text-[#FF2D78]">Premium</span></h1>
                  <p className="text-xs text-[#9B7065]">Unlock elite matches on your campus 💫</p>
                </div>
              </div>
              <SectionCloseButton />
            </div>

            {/* Stats row */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { val: "50K+", label: "Happy users" },
                { val: "4.9★", label: "App rating" },
                { val: "98%",  label: "Match success" },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-pink-100 bg-pink-50/60 py-2.5 text-center">
                  <p className="text-sm font-bold text-[#2D1810]">{s.val}</p>
                  <p className="text-[10px] text-[#9B7065]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Active plan banner ── */}
          {activePlan && (
            <div className="mx-5 mb-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
              <Crown className="h-4 w-4 text-emerald-600" />
              <p className="text-sm font-medium text-emerald-800">Active: <span className="font-bold">{activePlan.toUpperCase()}</span></p>
              <Sparkles className="ml-auto h-4 w-4 text-emerald-500" />
            </div>
          )}

          {/* ── Billing period toggle ── */}
          <div className="mx-5 mb-4 flex gap-1 rounded-2xl border border-pink-100 bg-pink-50/60 p-1">
            {(Object.keys(BILLING_LABELS) as BillingPeriod[]).map((p) => (
              <button key={p} type="button" onClick={() => setBillingPeriod(p)}
                className={`relative flex-1 rounded-xl py-2 text-xs font-semibold transition-colors ${billingPeriod === p ? "text-white" : "text-[#9B7065]"}`}>
                {billingPeriod === p && (
                  <motion.div layoutId="billing-pill"
                    className="absolute inset-0 rounded-xl bg-[#FF2D78] shadow-[0_2px_8px_rgba(255,45,120,0.4)]" />
                )}
                <span className="relative z-10 flex items-center justify-center gap-1">
                  {BILLING_LABELS[p]}
                  {p === "yearly" && (
                    <span className="rounded-full bg-yellow-100 px-1 py-0.5 text-[9px] font-bold text-yellow-700">-37%</span>
                  )}
                </span>
              </button>
            ))}
          </div>

          {/* ── Tab switcher ── */}
          <div className="mx-5 mb-5 flex gap-1 rounded-2xl border border-pink-100 bg-pink-50/60 p-1">
            {(["cards", "compare"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`relative flex-1 rounded-xl py-1.5 text-xs font-semibold transition-colors ${tab === t ? "text-white" : "text-[#9B7065]"}`}>
                {tab === t && (
                  <motion.div layoutId="premium-tab"
                    className="absolute inset-0 rounded-xl bg-[#FF2D78] shadow-[0_2px_8px_rgba(255,45,120,0.3)]" />
                )}
                <span className="relative z-10">{t === "cards" ? "Plans" : "Compare"}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === "cards" ? (
              <motion.div key="cards" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }} className="space-y-4 px-5 pb-6">

                {/* ── STARTER ── */}
                <motion.div
                  whileHover={{ scale: 1.015, boxShadow: "0 0 28px rgba(52,211,153,0.3)" }}
                  transition={{ duration: 0.2 }}
                  className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-emerald-50/60 p-5"
                >
                  <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-emerald-500/15 blur-2xl" />
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <div className="mb-1 flex items-center gap-1.5">
                        <Zap className="h-4 w-4 text-emerald-300" />
                        <h3 className="text-base font-bold text-white">Starter</h3>
                        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-300">NEW USERS</span>
                      </div>
                  <p className="text-xs text-emerald-600/80">Dip your toes into premium</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-[#2D1810]">
                        ₹{PLAN_PRICING.starter[billingPeriod].amount.toLocaleString("en-IN")}
                      </p>
                      <p className="text-[11px] text-emerald-600">/<PeriodLabel period={billingPeriod} /></p>
                      {PLAN_PRICING.starter[billingPeriod].saving && (
                        <span className="text-[10px] font-semibold text-orange-600">{PLAN_PRICING.starter[billingPeriod].saving}</span>
                      )}
                    </div>
                  </div>
                  <div className="mb-4 grid grid-cols-2 gap-1.5">
                    {["Boosted Daily Likes", "1 Super Like/day", "Basic Filters", "5 AI Chats/day", "Extended Profiles", "Remove Ads"].map((f) => (
                        <div key={f} className="flex items-center gap-1.5 text-xs text-emerald-800">
                        <Check className="h-3 w-3 flex-shrink-0 text-emerald-600" />{f}
                      </div>
                    ))}
                  </div>
                  <PaymentMethodSelector selected={selectedUpiMethod} onChange={setSelectedUpiMethod} className="mb-3" />
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => handlePay("starter")} disabled={rzpLoading}
                    className="w-full rounded-2xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-[0_4px_12px_rgba(22,163,74,0.4)] transition-all hover:bg-emerald-500 disabled:opacity-60">
                    {rzpLoading ? "Opening…" : `Unlock Starter · ₹${PLAN_PRICING.starter[billingPeriod].amount.toLocaleString("en-IN")}`}
                  </motion.button>
                </motion.div>

                {/* ── PREMIUM ── */}
                <div className="relative">
                  {/* Most popular badge */}
                  <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
                    <motion.span
                      animate={{ boxShadow: ["0 0 10px rgba(196,70,255,0.4)", "0 0 22px rgba(196,70,255,0.8)", "0 0 10px rgba(196,70,255,0.4)"] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full border border-pink-200 bg-[#FF2D78] px-3 py-1 text-[10px] font-bold text-white">
                      <Star className="h-2.5 w-2.5 fill-white" /> Most Popular
                    </motion.span>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.015, boxShadow: "0 0 40px rgba(147,51,234,0.5)" }}
                    transition={{ duration: 0.2 }}
                    className="relative overflow-hidden rounded-3xl border-2 border-[#FF2D78]/30 bg-white p-5 pt-6 shadow-[0_4px_24px_rgba(255,45,120,0.15)]"
                  >
                    <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-purple-500/20 blur-2xl" />
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <div className="mb-1 flex items-center gap-1.5">
                          <Sparkles className="h-4 w-4 text-fuchsia-300" />
                          <h3 className="text-base font-bold text-[#2D1810]">Premium</h3>
                        </div>
                        <p className="text-xs text-[#9B7065]">Perfect for active campus daters</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#2D1810]">
                          ₹{PLAN_PRICING.premium[billingPeriod].amount.toLocaleString("en-IN")}
                        </p>
                        <p className="text-[11px] text-[#FF2D78]">/<PeriodLabel period={billingPeriod} /></p>
                        {PLAN_PRICING.premium[billingPeriod].saving && (
                          <span className="text-[10px] font-semibold text-orange-600">{PLAN_PRICING.premium[billingPeriod].saving}</span>
                        )}
                      </div>
                    </div>
                    <div className="mb-4 grid grid-cols-2 gap-1.5">
                      {["Unlimited Likes", "AI Coach Access", "Advanced Filters", "Weekly Profile Boost", "See Who Liked You", "5 Super Likes/day"].map((f) => (
                        <div key={f} className="flex items-center gap-1.5 text-xs text-[#6B4B40]">
                          <Check className="h-3 w-3 flex-shrink-0 text-[#FF2D78]" />{f}
                        </div>
                      ))}
                    </div>
                    <PaymentMethodSelector selected={selectedUpiMethod} onChange={setSelectedUpiMethod} className="mb-3" />
                    <motion.button whileTap={{ scale: 0.97 }} onClick={() => handlePay("premium")} disabled={rzpLoading}
                      className="w-full rounded-2xl bg-[#FF2D78] py-3 text-sm font-bold text-white shadow-[0_4px_18px_rgba(255,45,120,0.42)] transition-all hover:shadow-[0_8px_28px_rgba(255,45,120,0.5)] disabled:opacity-60">
                      {rzpLoading ? "Opening…" : `Unlock Elite Matches · ₹${PLAN_PRICING.premium[billingPeriod].amount.toLocaleString("en-IN")}`}
                    </motion.button>
                  </motion.div>
                </div>

                {/* ── VIP ── */}
                <motion.div
                  whileHover={{ scale: 1.015, boxShadow: "0 0 42px rgba(236,72,153,0.5)" }}
                  transition={{ duration: 0.2 }}
                  className="relative overflow-hidden rounded-3xl border border-amber-200 bg-amber-50/60 p-5"
                >
                  <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-pink-500/20 blur-2xl" />
                  {/* Gold shimmer strip */}
                  <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-400/70 to-transparent" />
                  <div className="mb-1 flex items-center gap-1.5">
                    <Crown className="h-4 w-4 text-yellow-300" />
                    <span className="rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                      BEST VALUE
                    </span>
                  </div>
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <div className="mb-1 flex items-center gap-1.5">
                        <h3 className="text-base font-bold text-[#2D1810]">VIP</h3>
                      </div>
                      <p className="text-xs text-[#9B7065]">Priority match + live help</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-[#2D1810]">
                        ₹{PLAN_PRICING.vip[billingPeriod].amount.toLocaleString("en-IN")}
                      </p>
                      <p className="text-[11px] text-amber-600">/<PeriodLabel period={billingPeriod} /></p>
                      {PLAN_PRICING.vip[billingPeriod].saving && (
                        <span className="text-[10px] font-semibold text-orange-600">{PLAN_PRICING.vip[billingPeriod].saving}</span>
                      )}
                    </div>
                  </div>
                  <div className="mb-4 grid grid-cols-2 gap-1.5">
                    {["Everything in Premium", "Priority Match Queue", "Live Help Anytime", "VIP Badge on Profile", "Daily Profile Boost", "Unlimited Super Likes"].map((f) => (
                        <div key={f} className="flex items-center gap-1.5 text-xs text-[#6B4B40]">
                        <Check className="h-3 w-3 flex-shrink-0 text-amber-600" />{f}
                      </div>
                    ))}
                  </div>
                  <PaymentMethodSelector selected={selectedUpiMethod} onChange={setSelectedUpiMethod} className="mb-3" />
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => handlePay("vip")} disabled={rzpLoading}
                    className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-sm font-bold text-white shadow-[0_4px_16px_rgba(245,158,11,0.45)] transition-all disabled:opacity-60">
                    {rzpLoading ? "Opening…" : `Go VIP ✨ · ₹${PLAN_PRICING.vip[billingPeriod].amount.toLocaleString("en-IN")}`}
                  </motion.button>
                </motion.div>

                {/* Trust badges */}
                  <div className="flex items-center justify-center gap-5 pt-1 text-[10px] text-[#9B7065]">
                  <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> 7-day refund</span>
                  <span className="flex items-center gap-1"><X className="h-3 w-3" /> Cancel anytime</span>
                  <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> Instant access</span>
                </div>

                {userId && <TransactionHistory userId={userId} />}
              </motion.div>
            ) : (
              <motion.div key="compare" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }} className="px-5 pb-6">
                <div className="overflow-x-auto">
                  <div className="min-w-[380px] overflow-hidden rounded-2xl border border-pink-100">
                    <div className="grid grid-cols-5 bg-pink-50 px-2 py-3 text-center text-[10px] font-bold">
                      <div className="pl-1 text-left text-[#9B7065]">Feature</div>
                      <div className="text-[#9B7065]">Free</div>
                      <div className="text-emerald-600">Starter</div>
                      <div className="text-[#FF2D78]">Premium</div>
                      <div className="text-amber-600">VIP</div>
                    </div>
                    {COMPARISON_ROWS.map((row, i) => (
                      <div key={row.label}
                        className={`grid grid-cols-5 items-center px-2 py-2.5 text-center text-[10px] ${i % 2 === 0 ? "bg-pink-50/40" : ""}`}>
                        <div className="pl-1 text-left text-[10px] text-[#6B4B40]">{row.label}</div>
                        <div><CellValue val={row.free} /></div>
                        <div><CellValue val={row.starter} /></div>
                        <div><CellValue val={row.premium} /></div>
                        <div><CellValue val={row.vip} /></div>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="mt-3 text-center text-[10px] text-purple-400/35">
                  *All plans auto-renew. Cancel anytime.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
}
