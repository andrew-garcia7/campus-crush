"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, CheckCircle } from "lucide-react";
import { useRef } from "react";

type Plan = "starter" | "premium" | "vip";

const PLAN_LABELS: Record<Plan, string> = {
  starter: "Starter",
  premium: "Premium",
  vip:     "VIP",
};

export interface ReceiptData {
  userName?:    string;
  userEmail?:   string;
  plan:         Plan;
  amount:       number;
  paymentId:    string;
  orderId?:     string;
  date?:        Date;
  /** If set, overrides the "Plan" label in the receipt header & rows */
  label?:       string;
  /** Coach-specific extras shown as additional receipt rows */
  coachName?:   string;
  sessionType?: string;
  scheduledFor?: string;
}

interface PaymentReceiptProps {
  show:    boolean;
  data:    ReceiptData;
  onClose: () => void;
}

export function PaymentReceipt({ show, data, onClose }: PaymentReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const date = data.date ?? new Date();
  const dateStr = date.toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric"
  });

  const handleDownload = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    const planOrLabel = data.label ?? `${PLAN_LABELS[data.plan]} Plan`;
    const extraRows = [
      ...(data.coachName   ? [["Coach",        data.coachName]]   : []),
      ...(data.sessionType ? [["Session Type",  data.sessionType]] : []),
      ...(data.scheduledFor ? [["Scheduled For", data.scheduledFor]] : []),
    ];
    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Campus Crush Receipt – ${data.paymentId}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #f8f8f8; padding: 32px; color: #111; }
    .card { max-width: 420px; margin: 0 auto; background: #fff; border-radius: 16px; border: 1px solid #eee; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,.08); }
    .head { background: linear-gradient(135deg, #4c1d95, #7e22ce); color: #fff; text-align: center; padding: 28px 24px; }
    .head h1 { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
    .head p  { font-size: 12px; opacity: .7; }
    .badge { display: inline-flex; align-items: center; gap: 6px; margin-top: 14px; background: rgba(255,255,255,.15); border-radius: 99px; padding: 4px 14px; font-size: 13px; font-weight: 600; }
    .body { padding: 24px; }
    .row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
    .row:last-of-type { border-bottom: none; }
    .label { font-size: 13px; color: #888; }
    .value { font-size: 13px; font-weight: 500; text-align: right; max-width: 60%; word-break: break-all; }
    .total-row { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; padding: 14px 0 0; border-top: 2px solid #f0f0f0; }
    .total-label { font-size: 15px; font-weight: 700; }
    .total-value { font-size: 20px; font-weight: 800; color: #7e22ce; }
    .footer { text-align: center; font-size: 11px; color: #bbb; padding: 16px 24px 24px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="head">
      <h1>🎓 Campus Crush</h1>
      <p>Official Payment Receipt</p>
      <div class="badge">✅ Payment Successful</div>
    </div>
    <div class="body">
      ${[
        ["Name",       data.userName  ?? "—"],
        ["Email",      data.userEmail ?? "—"],
        [planOrLabel.includes("Plan") ? "Plan" : "Service", planOrLabel],
        ...extraRows,
        ["Date",       dateStr],
        ["Payment ID", data.paymentId],
        ...(data.orderId ? [["Order ID", data.orderId]] : []),
      ].map(([l, v]) => `
      <div class="row">
        <span class="label">${l}</span>
        <span class="value">${v}</span>
      </div>`).join("")}
      <div class="total-row">
        <span class="total-label">Total Paid</span>
        <span class="total-value">₹${data.amount.toLocaleString("en-IN")}</span>
      </div>
    </div>
    <div class="footer">${data.coachName ? `Thank you for booking a session with ${data.coachName} ❤️` : "Thank you for choosing Campus Crush Premium ❤️"}<br/>This is a computer-generated receipt.</div>
  </div>
</body>
</html>`);
    win.document.close();
    setTimeout(() => win.print(), 400);
  };

  const rows: Array<{ label: string; value: string; mono?: boolean }> = [
    { label: "Name",       value: data.userName  ?? "—" },
    { label: "Email",      value: data.userEmail ?? "—" },
    { label: data.label ? "Service" : "Plan", value: data.label ?? `${PLAN_LABELS[data.plan]} Plan` },
    ...(data.coachName   ? [{ label: "Coach",        value: data.coachName }]   : []),
    ...(data.sessionType ? [{ label: "Session Type",  value: data.sessionType }] : []),
    ...(data.scheduledFor ? [{ label: "Scheduled For", value: data.scheduledFor }] : []),
    { label: "Date",       value: dateStr },
    { label: "Payment ID", value: data.paymentId, mono: true },
    ...(data.orderId ? [{ label: "Order ID", value: data.orderId, mono: true }] : []),
  ];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.85, y: 28 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            className="w-full max-w-sm"
          >
            <div ref={receiptRef} className="overflow-hidden rounded-3xl border border-white/10 bg-[#1a0835] shadow-[0_0_70px_rgba(196,70,255,0.3)]">
              {/* Header */}
              <div className="relative bg-gradient-to-br from-purple-900 via-fuchsia-900 to-purple-900 px-6 pt-6 pb-8 text-center">
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 rounded-full bg-white/10 p-1.5 transition-colors hover:bg-white/20"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 shadow-[0_0_22px_rgba(52,211,153,0.55)]">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <p className="text-xl font-bold text-white">Payment Receipt</p>
                <p className="mt-1 text-xs text-purple-300/60">
                  {data.label ? `Campus Crush · ${data.label}` : `Campus Crush ${PLAN_LABELS[data.plan]} Plan`}
                </p>
              </div>

              {/* Rows */}
              <div className="px-6 py-4">
                {rows.map(({ label, value, mono }) => (
                  <div key={label} className="flex items-center justify-between border-b border-white/[0.06] py-2.5">
                    <span className="text-xs text-purple-400/60">{label}</span>
                    <span
                      className={`text-right text-xs text-white ${mono ? "font-mono text-[10px] text-purple-300/70" : "font-medium"}`}
                    >
                      {value}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-4">
                  <span className="text-sm font-semibold text-white">Total Paid</span>
                  <span className="text-xl font-bold text-fuchsia-300">
                    ₹{data.amount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Download */}
              <div className="px-6 pb-6 pt-2">
                <button
                  onClick={handleDownload}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 py-3 text-sm font-semibold text-white shadow-[0_0_22px_rgba(196,70,255,0.38)] transition-all hover:from-purple-500 hover:to-fuchsia-500"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </button>
                <p className="mt-3 text-center text-[10px] text-purple-500/40">
                  Thank you for choosing Campus Crush Premium ❤️
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
