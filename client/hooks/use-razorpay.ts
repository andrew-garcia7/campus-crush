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

        prefill: {
          name:    opts.userName  ?? "",
          email:   opts.userEmail ?? "",
          contact: opts.userPhone ?? "",
          // Pre-select UPI tab when user picked a UPI method on Campus Crush UI.
          // We do NOT use config.display.blocks here because that custom-block
          // feature forces UPI intent (deep-link to real apps), which always
          // fails in Razorpay test mode. Razorpay's standard checkout already
          // shows UPI, Cards, Netbanking and Wallets — and in test mode it
          // surfaces a prominent "Test Mode" banner with test credentials.
          ...(opts.preferredMethod ? { method: "upi" } : {}),
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
