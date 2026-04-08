"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";
import { getPlanById, formatCurrency } from "@/types/payment";

// ============================================================
// MovieFlix Payment Success Page
// ============================================================

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);
  const [loading, setLoading] = useState(true);

  const planId = (searchParams.get("planId") as any) || "basic";
  const plan = getPlanById(planId);

  useEffect(() => {
    // Trigger confetti
    const end = Date.now() + 3 * 1000;
    const colors = ["#e50914", "#ffffff", "#f59e0b"];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    // Countdown and redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/browse");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setLoading(false);
    return () => clearInterval(timer);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-xl rounded-3xl p-8 text-center relative z-10 shadow-2xl"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
          className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 className="w-10 h-10 text-emerald-400" strokeWidth={2.5} />
        </motion.div>

        <h1 className="text-3xl font-black text-white mb-2">Payment Confirmed!</h1>
        <p className="text-zinc-400 mb-8">
          Your account is now upgraded to{" "}
          <span className="text-white font-bold">{plan.name}</span>. Unlimited
          streaming awaits!
        </p>

        <div className="bg-zinc-800/50 rounded-2xl p-6 mb-10 text-left">
          <div className="flex justify-between mb-4 pb-4 border-b border-zinc-700/50">
            <span className="text-zinc-400 text-sm">Plan</span>
            <span className="text-white font-medium">{plan.name}</span>
          </div>
          <div className="flex justify-between mb-4 pb-4 border-b border-zinc-700/50">
            <span className="text-zinc-400 text-sm">Status</span>
            <span className="flex items-center gap-1.5 text-emerald-400 text-sm font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              Active
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400 text-sm">Payment ID</span>
            <span className="text-zinc-300 text-sm font-mono uppercase">
              {searchParams.get("paymentId")?.substring(0, 16) || "PAY-REF-XXXXX"}
            </span>
          </div>
        </div>

        <button
          onClick={() => router.push("/browse")}
          className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group shadow-lg shadow-red-900/20"
        >
          Start Browsing
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="text-zinc-500 text-xs mt-6">
          Redirecting to home page in{" "}
          <span className="text-zinc-300 font-bold">{countdown}</span> seconds…
        </p>
      </motion.div>
    </div>
  );
}
