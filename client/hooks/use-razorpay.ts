"use client";
import { useState, useCallback } from "react";
import { api } from "@/services/api";

declare global {
  interface Window { Razorpay: any; }
}

export type RzpPlan          = "starter" | "premium" | "vip";
export type RzpBillingPeriod = "monthly" | "quarterly" | "yearly";

export interface RzpSuccessData {
  paymentId: string;
  orderId:   string;
  plan:      RzpPlan;
  amount:    number;
}

export type PreferredUpiApp = "gpay" | "phonepe" | "paytm" | "upi" | null;

const UPI_APP_MAP: Record<NonNullable<PreferredUpiApp>, string> = {
  gpay:    "google_pay",
  phonepe: "phonepe",
  paytm:   "paytm",
  upi:     "google_pay", // fallback: open UPI intent list
};

interface OpenCheckoutOpts {
  userId:           string;
  plan:             RzpPlan;
  billingPeriod?:   RzpBillingPeriod;
  amount?:          number;
  userName?:        string;
  userEmail?:       string;
  userPhone?:       string;
  preferredMethod?: PreferredUpiApp;
  onSuccess:        (data: RzpSuccessData) => void;
  onFailure?:       (msg: string) => void;
}

const PLAN_LABELS: Record<RzpPlan, string> = {
  starter: "Starter Plan",
  premium: "Premium Plan",
  vip:     "VIP Plan",
};

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function useRazorpay() {
  const [loading, setLoading] = useState(false);

  const openCheckout = useCallback(async (opts: OpenCheckoutOpts) => {
    setLoading(true);
    try {
      // 1. Load SDK
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        opts.onFailure?.("Could not load payment gateway. Check your internet connection.");
        return;
      }

      // 2. Create order on backend
      const res = await api.post(`/payments/checkout`, {
        userId: opts.userId,
        plan: opts.plan,
        billingPeriod: opts.billingPeriod ?? "monthly",
        amount: opts.amount
      });
      const { orderId, amount, keyId } = res.data.data as {
        orderId: string; amount: number; keyId: string;
      };

      // 3. Open Razorpay modal
      const rzp = new window.Razorpay({
        key:         keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount:      amount * 100,
        currency:    "INR",
        name:        "Campus Crush",
        description: PLAN_LABELS[opts.plan],
        order_id:    orderId,
        image:       "/assets/cc-logo.png",

        // UPI-first payment config
        config: {
          display: {
            blocks: {
              upi_block: {
                name: "Pay via UPI",
                instruments: [
                  // Bump preferred app to the top of intent list
                  ...(opts.preferredMethod && opts.preferredMethod !== "upi"
                    ? [{ method: "upi", flows: ["intent"], apps: [UPI_APP_MAP[opts.preferredMethod]] }]
                    : []
                  ),
                  { method: "upi", flows: ["intent"], apps: ["google_pay", "phonepe", "paytm"] },
                  { method: "upi", flows: ["collect"] },
                  { method: "upi", flows: ["qr"] },
                ],
              },
              other_block: {
                name: "Other Methods",
                instruments: [
                  { method: "card" },
                  { method: "netbanking" },
                  { method: "wallet" },
                ],
              },
            },
            sequence: ["block.upi_block", "block.other_block"],
            preferences: { show_default_blocks: false },
          },
        },

        prefill: {
          name:    opts.userName  ?? "",
          email:   opts.userEmail ?? "",
          contact: opts.userPhone ?? "",
        },

        theme: { color: "#7c3aed" },

        handler: async (response: {
          razorpay_order_id:   string;
          razorpay_payment_id: string;
          razorpay_signature:  string;
        }) => {
          try {
            // 4. Verify on backend
            await api.post(`/payments/verify`, {
              orderId:   response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
            opts.onSuccess({
              paymentId: response.razorpay_payment_id,
              orderId:   response.razorpay_order_id,
              plan:      opts.plan,
              amount,
            });
          } catch {
            opts.onFailure?.("Payment verification failed. Contact support with ID: " + response.razorpay_payment_id);
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            opts.onFailure?.("Payment cancelled");
            setLoading(false);
          },
        },
      });

      rzp.on("payment.failed", (ev: any) => {
        opts.onFailure?.(ev?.error?.description || "Payment failed. Please try again.");
        setLoading(false);
      });

      rzp.open();
    } catch (e: any) {
      opts.onFailure?.(e?.response?.data?.message ?? e?.message ?? "Something went wrong");
      setLoading(false);
    }
  }, []);

  return { openCheckout, loading };
}
