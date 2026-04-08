"use client";

import { useSubscription } from "@/hooks/useSubscription";
import { formatCurrency, getPlanById } from "@/types/payment";
import {
  CheckCircle2,
  XCircle,
  Calendar,
  CreditCard,
  RefreshCw,
  Zap,
  Shield,
  Smartphone,
  ChevronRight,
  AlertTriangle,
  History,
  Download,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

// ============================================================
// MovieFlix Subscription Dashboard
// ============================================================

export default function SubscriptionManagePage() {
  const {
    subscription,
    payments,
    loading,
    error,
    cancelSubscription,
    cancelling,
  } = useSubscription();

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    );
  }

  const plan = subscription ? getPlanById(subscription.planId) : null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-white mb-2">Subscription</h1>
            <p className="text-zinc-500">Manage your plan and billing history</p>
          </div>
          {!subscription && !loading && (
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-red-900/20"
            >
              Get a Plan
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-8 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ─── Current Plan Card ─────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl"
            >
              <div className="p-8 border-b border-zinc-800 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-500">
                      CURRENT PLAN
                    </span>
                    {subscription?.status === "active" && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  {subscription ? (
                    <>
                      <h2 className="text-3xl font-black text-white mb-1">
                        {plan?.name}
                      </h2>
                      <p className="text-zinc-400 text-sm">{plan?.tagline}</p>
                    </>
                  ) : (
                    <>
                      <h2 className="text-3xl font-black text-zinc-700">No Plan Selected</h2>
                      <p className="text-zinc-500 text-sm italic">
                        Unlock premium features today
                      </p>
                    </>
                  )}
                </div>

                {subscription && (
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center bg-zinc-800"
                    style={{ color: plan?.color }}
                  >
                    {subscription.planId === "mobile" && <Smartphone className="w-6 h-6" />}
                    {subscription.planId === "basic" && <Shield className="w-6 h-6" />}
                    {subscription.planId === "premium" && <Zap className="w-6 h-6" />}
                  </div>
                )}
              </div>

              <div className="p-8 bg-zinc-900/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-zinc-300">
                      <Calendar className="w-4 h-4 text-zinc-500" />
                      <div className="text-sm">
                        <span className="text-zinc-500 block text-[10px] font-bold uppercase tracking-wider">
                          BILLING PERIOD
                        </span>
                        {subscription ? (
                          <span>
                            {new Date(subscription.currentPeriodStart).toLocaleDateString()} —{" "}
                            {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                          </span>
                        ) : (
                          "---"
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-zinc-300">
                      <CreditCard className="w-4 h-4 text-zinc-500" />
                      <div className="text-sm">
                        <span className="text-zinc-500 block text-[10px] font-bold uppercase tracking-wider">
                          PAYMENT METHOD
                        </span>
                        {subscription ? (
                          <span className="flex items-center gap-2">
                            UPI / Card (via Razorpay)
                          </span>
                        ) : (
                          "---"
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-zinc-300">
                      <RefreshCw className="w-4 h-4 text-zinc-500" />
                      <div className="text-sm">
                        <span className="text-zinc-500 block text-[10px] font-bold uppercase tracking-wider">
                          STATUS
                        </span>
                        {subscription ? (
                          <span className="text-white">
                            Renews {subscription.billingCycle}ly on{" "}
                            {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                          </span>
                        ) : (
                          "Inactive"
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-zinc-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <div className="text-sm">
                        <span className="text-zinc-500 block text-[10px] font-bold uppercase tracking-wider">
                          FEATURES
                        </span>
                        {subscription ? (
                          <span className="text-white">
                            {plan?.features.resolution} + {plan?.features.simultaneousStreams}{" "}
                            Screens
                          </span>
                        ) : (
                          "Standard access"
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {subscription && (
                  <div className="mt-10 pt-8 border-t border-zinc-800 flex items-center justify-between">
                    <Link
                      href="/pricing"
                      className="text-white text-sm font-bold hover:text-red-500 transition-colors flex items-center gap-1.5"
                    >
                      Change Plan <ChevronRight className="w-4 h-4" />
                    </Link>

                    {!showCancelConfirm ? (
                      <button
                        onClick={() => setShowCancelConfirm(true)}
                        className="text-zinc-500 text-sm font-medium hover:text-red-400 transition-colors"
                      >
                        Cancel Subscription
                      </button>
                    ) : (
                      <div className="flex items-center gap-4">
                        <p className="text-xs text-red-400 font-medium">Are you sure?</p>
                        <button
                          disabled={cancelling}
                          onClick={async () => {
                            const res = await cancelSubscription();
                            if (res.success) setShowCancelConfirm(false);
                            else setCancelError(res.error || "Failed to cancel");
                          }}
                          className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white text-xs font-bold px-4 py-2 rounded-lg transition-all border border-red-500/20"
                        >
                          {cancelling ? "Cancelling..." : "Yes, Confirm"}
                        </button>
                        <button
                          onClick={() => setShowCancelConfirm(false)}
                          className="text-zinc-500 text-xs font-bold hover:text-zinc-300 transition-colors"
                        >
                          No, Keep it
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>

            {/* ─── Billing History ─────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl"
            >
              <div className="p-6 border-b border-zinc-800 flex items-center gap-2.5">
                <History className="w-5 h-5 text-zinc-500" />
                <h2 className="text-xl font-bold text-white">Billing History</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-zinc-900 text-zinc-500 text-[10px] font-bold uppercase tracking-widest border-b border-zinc-800">
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Description</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-zinc-600 text-sm italic">
                          No transaction history found
                        </td>
                      </tr>
                    ) : (
                      payments.map((p, i) => (
                        <tr key={i} className="hover:bg-zinc-800/20 group transition-colors">
                          <td className="px-6 py-4 text-sm text-zinc-400">
                            {new Date(p.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-white">
                            MovieFlix {p.plan?.name} Plan
                            <span className="block text-[10px] text-zinc-500 capitalize">
                              {p.billingCycle}ly billing
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-zinc-300">
                            {formatCurrency(p.amountInRupees)}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                p.status === "captured"
                                  ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                                  : "text-zinc-500 bg-zinc-500/10 border-zinc-500/20"
                              }`}
                            >
                              {p.status === "captured" ? "PAID" : p.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-zinc-500 hover:text-white transition-colors">
                              <Download className="w-4 h-4 ml-auto" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>

          {/* ─── Side Stats / Info ─────────────────────────── */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
            >
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-red-500" />
                Plan Benefits
              </h3>
              <ul className="space-y-3">
                {plan?.features ? (
                  <>
                    <li className="flex items-start gap-3 text-sm text-zinc-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5" />
                      Unlimited movies & TV shows
                    </li>
                    <li className="flex items-start gap-3 text-sm text-zinc-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5" />
                      Quality: {plan.features.resolution}
                    </li>
                    <li className="flex items-start gap-3 text-sm text-zinc-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5" />
                      {plan.features.simultaneousStreams} Parallel streams
                    </li>
                    {plan.features.dolbyAtmos && (
                      <li className="flex items-start gap-3 text-sm text-zinc-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5" />
                        Dolby Atmos surround sound
                      </li>
                    )}
                  </>
                ) : (
                  <p className="text-zinc-500 text-sm italic">
                    Subscribe to see features here
                  </p>
                )}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
            >
              <h3 className="text-white font-bold mb-4">Payment Support</h3>
              <p className="text-zinc-500 text-sm mb-4 leading-relaxed">
                Having issues with your payment? Check your bank statement or contact
                our support.
              </p>
              <Link
                href="/support"
                className="flex items-center justify-between text-xs font-bold text-zinc-300 hover:text-white transition-colors py-2 group"
              >
                Go to Help Center
                <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
