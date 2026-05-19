"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, CheckCircle, XCircle, Clock, Trash2, ChevronDown, RefreshCw } from "lucide-react";
import { api } from "@/services/api";

type TxStatus = "active" | "pending" | "failed" | "cancelled";
type Plan     = "starter" | "premium" | "vip";

interface Transaction {
  _id:           string;
  plan:          Plan;
  amountInr:     number;
  status:        TxStatus;
  billingPeriod?: string;
  paymentId?:    string;
  externalId?:   string;
  createdAt:     string;
}

const STATUS_CFG: Record<TxStatus, { label: string; Icon: typeof CheckCircle; color: string; bg: string }> = {
  active:    { label: "Success",   Icon: CheckCircle, color: "text-emerald-300", bg: "bg-emerald-500/15 border-emerald-400/25" },
  pending:   { label: "Pending",   Icon: Clock,       color: "text-yellow-300",  bg: "bg-yellow-500/10  border-yellow-400/20"  },
  failed:    { label: "Failed",    Icon: XCircle,     color: "text-red-400",     bg: "bg-red-500/10     border-red-400/20"     },
  cancelled: { label: "Cancelled", Icon: XCircle,     color: "text-gray-400",    bg: "bg-gray-500/10    border-gray-400/20"    },
};

const PLAN_COLOR: Record<Plan, string> = {
  starter: "text-emerald-300",
  premium: "text-purple-300",
  vip:     "text-yellow-300",
};

interface TransactionHistoryProps {
  userId:       string;
  defaultOpen?: boolean;
}

export function TransactionHistory({ userId, defaultOpen = false }: TransactionHistoryProps) {
  const [txns,     setTxns]     = useState<Transaction[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [open,     setOpen]     = useState(defaultOpen);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetch = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await api.get(`/payments/history/${userId}`);
      setTxns(res.data?.data ?? []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { if (open) fetch(); }, [open, userId]);

  const del = async (id: string) => {
    setDeleting(id);
    try {
      await api.delete(`/payments/history/${userId}/${id}`);
      setTxns((prev) => prev.filter((t) => t._id !== id));
    } catch { /* silent */ }
    finally { setDeleting(null); }
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-purple-400/20 bg-white/[0.03]">
      {/* Toggle header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-2">
          <Crown className="h-4 w-4 text-yellow-300" />
          <span className="text-sm font-semibold text-white">Transaction History</span>
          {txns.length > 0 && (
            <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-semibold text-purple-300">
              {txns.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {open && (
            <button
              onClick={(e) => { e.stopPropagation(); fetch(); }}
              className="rounded-full p-1 text-purple-400/50 hover:text-purple-300 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          )}
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="h-4 w-4 text-purple-400" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="history-body"
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: "hidden" }}
          >
            <div className="border-t border-white/5 px-5 pb-5 pt-3">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-400 border-t-transparent" />
                </div>
              ) : txns.length === 0 ? (
                <div className="py-8 text-center">
                  <Crown className="mx-auto mb-2 h-8 w-8 text-purple-400/25" />
                  <p className="text-sm text-purple-400/45">No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <AnimatePresence mode="popLayout">
                    {txns.map((tx) => {
                      const cfg  = STATUS_CFG[tx.status] ?? STATUS_CFG.pending;
                      const Icon = cfg.Icon;
                      return (
                        <motion.div
                          key={tx._id}
                          layout
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 8, transition: { duration: 0.15 } }}
                          className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3"
                        >
                          {/* Status icon */}
                          <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border ${cfg.bg}`}>
                            <Icon className={`h-4 w-4 ${cfg.color}`} />
                          </div>

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <p className={`text-xs font-semibold capitalize ${PLAN_COLOR[tx.plan] ?? "text-white"}`}>
                              {tx.plan}{tx.billingPeriod ? ` · ${tx.billingPeriod}` : ""}
                            </p>
                            <p className="truncate text-[10px] text-purple-400/50">
                              {new Date(tx.createdAt).toLocaleDateString("en-IN", {
                                day: "2-digit", month: "short", year: "numeric"
                              })}
                              {tx.paymentId && ` · ${tx.paymentId.slice(-8)}`}
                            </p>
                          </div>

                          {/* Amount + status + delete */}
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <p className="text-sm font-bold text-white">
                                ₹{tx.amountInr.toLocaleString("en-IN")}
                              </p>
                              <span className={`inline-block rounded-full border px-1.5 py-px text-[9px] font-semibold ${cfg.bg} ${cfg.color}`}>
                                {cfg.label}
                              </span>
                            </div>
                            <button
                              onClick={() => del(tx._id)}
                              disabled={deleting === tx._id}
                              className="rounded-lg p-1.5 text-purple-500/35 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
