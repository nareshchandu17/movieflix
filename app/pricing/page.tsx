"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  PLANS,
  SubscriptionPlan,
  BillingCycle,
  PlanTier,
  formatCurrency,
} from "@/types/payment";
import { useRazorpay } from "@/hooks/useRazorpay";
import { useSubscription } from "@/hooks/useSubscription";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  X,
  Zap,
  Crown,
  Smartphone,
  Shield,
  ChevronDown,
  Loader2,
  Sparkles,
  Star,
  Tv,
  Download,
  Users,
  Volume2,
  Play,
} from "lucide-react";

// ============================================================
// MovieFlix Pricing Page — Netflix-Level UI
// ============================================================

const FEATURE_ROWS = [
  { key: "resolution", label: "Video Quality", icon: Tv },
  { key: "hdr", label: "HDR & Dolby Vision", icon: Sparkles },
  { key: "dolbyAtmos", label: "Dolby Atmos Audio", icon: Volume2 },
  { key: "simultaneousStreams", label: "Screens at once", icon: Play },
  { key: "downloadDevices", label: "Download devices", icon: Download },
  { key: "watchParty", label: "Watch Party", icon: Users },
  { key: "watchPartySize", label: "Watch Party size", icon: Users },
  { key: "exclusiveContent", label: "Exclusive content", icon: Star },
  { key: "earlyAccess", label: "Early access", icon: Crown },
  { key: "aiRecommendations", label: "AI recommendations", icon: Zap },
];

function getFeatureValue(plan: SubscriptionPlan, key: string): string | boolean | number {
  return (plan.features as any)[key];
}

function renderFeatureCell(value: string | boolean | number): React.ReactNode {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="w-5 h-5 text-emerald-400 mx-auto" strokeWidth={2.5} />
    ) : (
      <X className="w-4 h-4 text-zinc-600 mx-auto" strokeWidth={2} />
    );
  }
  if (typeof value === "number") {
    return value === 0 ? (
      <X className="w-4 h-4 text-zinc-600 mx-auto" strokeWidth={2} />
    ) : (
      <span className="text-white font-semibold">{value}</span>
    );
  }
  return <span className="text-white font-medium text-sm">{value}</span>;
}

// ─── Plan Icon ────────────────────────────────────────────────
function PlanIcon({ planId }: { planId: PlanTier }) {
  if (planId === "mobile") return <Smartphone className="w-6 h-6" />;
  if (planId === "basic") return <Shield className="w-6 h-6" />;
  return <Crown className="w-6 h-6" />;
}

// ─── FAQ data ─────────────────────────────────────────────────
const FAQS = [
  {
    q: "Can I change my plan later?",
    a: "Yes. You can upgrade or downgrade your plan at any time. If you upgrade, the new plan starts immediately. If you downgrade, the change takes effect at your next billing cycle.",
  },
  {
    q: "How does billing work?",
    a: "For monthly plans, you're billed every 30 days. For annual plans, you're billed once a year and save up to 20%. All payments are processed securely via Razorpay.",
  },
  {
    q: "Can I cancel my subscription?",
    a: "You can cancel anytime from your account settings. Your access continues until the end of the current billing period. We don't offer refunds for partial periods.",
  },
  {
    q: "Is my payment information secure?",
    a: "Absolutely. We use Razorpay, a PCI DSS Level 1 certified payment processor. Your card details are never stored on our servers.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We accept all major credit/debit cards, UPI (GPay, PhonePe, Paytm), net banking, and popular wallets via Razorpay.",
  },
];

// ─── FAQ Item ─────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-zinc-800">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="text-zinc-100 font-medium group-hover:text-white transition-colors">
          {q}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-zinc-400 flex-shrink-0 ml-4 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-zinc-400 text-sm leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Payment State Overlay ────────────────────────────────────
function PaymentOverlay({ state, error, planName, onRetry, onDismiss }: {
  state: string;
  error: string | null;
  planName: string;
  onRetry: () => void;
  onDismiss: () => void;
}) {
  if (state === "idle" || state === "processing") return null;

  return (
    <AnimatePresence>
      {(state === "creating" || state === "verifying" || state === "success" || state === "error") && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-zinc-900 border border-zinc-700/50 rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl"
          >
            {(state === "creating" || state === "verifying") && (
              <>
                <div className="w-16 h-16 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center mx-auto mb-5">
                  <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {state === "creating" ? "Preparing checkout…" : "Confirming payment…"}
                </h3>
                <p className="text-zinc-400 text-sm">
                  {state === "creating"
                    ? "Setting up your secure payment"
                    : "Verifying your transaction with our servers"}
                </p>
              </>
            )}

            {state === "success" && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto mb-5"
                >
                  <Check className="w-8 h-8 text-emerald-400" strokeWidth={2.5} />
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-2">Payment Successful!</h3>
                <p className="text-zinc-400 text-sm mb-6">
                  Welcome to MovieFlix <span className="text-white font-semibold">{planName}</span>. Enjoy unlimited streaming!
                </p>
                <button
                  onClick={onDismiss}
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  Start Watching →
                </button>
              </>
            )}

            {state === "error" && (
              <>
                <div className="w-16 h-16 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center mx-auto mb-5">
                  <X className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Payment Failed</h3>
                <p className="text-zinc-400 text-sm mb-6">{error}</p>
                <div className="flex gap-3">
                  <button
                    onClick={onDismiss}
                    className="flex-1 border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-medium py-3 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onRetry}
                    className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded-xl transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main Pricing Page ────────────────────────────────────────
export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const [selectedPlan, setSelectedPlan] = useState<PlanTier | null>(null);
  const [hoveredPlan, setHoveredPlan] = useState<PlanTier | null>(null);

  const { subscription, hasActiveSubscription, loading: subLoading } = useSubscription();

  const { state, error, initiatePayment, reset } = useRazorpay({
    onSuccess: (data) => {
      router.refresh();
    },
    onError: (err) => console.error("Payment error:", err),
  });

  const handleSubscribe = async (planId: PlanTier) => {
    if (!session) {
      router.push(`/auth/signin?callbackUrl=/pricing`);
      return;
    }
    setSelectedPlan(planId);
    await initiatePayment(planId, billing);
  };

  const selectedPlanData = selectedPlan ? PLANS.find((p) => p.id === selectedPlan) : null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Payment overlay */}
      <PaymentOverlay
        state={state}
        error={error}
        planName={selectedPlanData?.name ?? ""}
        onRetry={() => selectedPlan && initiatePayment(selectedPlan, billing)}
        onDismiss={() => {
          reset();
          setSelectedPlan(null);
          if (state === "success") router.push("/browse");
        }}
      />

      {/* ─── Hero ──────────────────────────────────────────── */}
      <div className="relative overflow-hidden pt-24 pb-16">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(229,9,20,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(229,9,20,0.5) 1px, transparent 1px)`,
            backgroundSize: "80px 80px",
          }}
        />
        {/* Radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {hasActiveSubscription && subscription && (
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium px-4 py-2 rounded-full mb-6">
                <Check className="w-4 h-4" />
                Currently on {subscription.plan?.name} Plan — {subscription.daysRemaining} days remaining
              </div>
            )}

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-5">
              Unlimited{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-300">
                Entertainment
              </span>
            </h1>
            <p className="text-zinc-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10">
              Movies, series, originals — in the quality you deserve. Cancel anytime.
            </p>

            {/* ─── Billing Toggle ─────────────────────────── */}
            <div className="inline-flex items-center bg-zinc-900 border border-zinc-800 rounded-full p-1 gap-1">
              {(["monthly", "annually"] as BillingCycle[]).map((cycle) => (
                <button
                  key={cycle}
                  onClick={() => setBilling(cycle)}
                  className={`relative px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                    billing === cycle
                      ? "text-white"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {billing === cycle && (
                    <motion.div
                      layoutId="billing-pill"
                      className="absolute inset-0 bg-red-600 rounded-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <span className="relative capitalize">{cycle}</span>
                  {cycle === "annually" && (
                    <span className="relative ml-2 text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded-full">
                      Save 20%
                    </span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ─── Plan Cards ─────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {PLANS.map((plan, i) => {
            const isCurrentPlan = subscription?.planId === plan.id && hasActiveSubscription;
            const price = billing === "annually" ? plan.annualPrice : plan.monthlyPrice;
            const monthlyEquiv = billing === "annually" ? Math.round(plan.annualPrice / 12) : plan.monthlyPrice;
            const isHovered = hoveredPlan === plan.id;
            const isProcessing = selectedPlan === plan.id && (state === "creating" || state === "verifying");

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                onHoverStart={() => setHoveredPlan(plan.id)}
                onHoverEnd={() => setHoveredPlan(null)}
                className={`relative rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer ${
                  plan.popular
                    ? "border-red-500/50 shadow-[0_0_60px_-10px_rgba(229,9,20,0.4)]"
                    : isHovered
                    ? "border-zinc-600"
                    : "border-zinc-800"
                } ${plan.popular ? "md:-mt-4 md:mb-4" : ""}`}
                style={{
                  background: plan.popular
                    ? "linear-gradient(160deg, #1a0505 0%, #0f0f0f 60%)"
                    : "linear-gradient(160deg, #111 0%, #0a0a0a 60%)",
                }}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
                )}
                {plan.popular && (
                  <div className="absolute top-4 right-4">
                    <span className="flex items-center gap-1 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      <Star className="w-3 h-3 fill-current" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-7">
                  {/* Plan header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${plan.color}20`, color: plan.color }}
                    >
                      <PlanIcon planId={plan.id} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg leading-tight">{plan.name}</h3>
                      <p className="text-zinc-500 text-xs">{plan.tagline}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-black text-white">
                        {formatCurrency(billing === "annually" ? monthlyEquiv : price)}
                      </span>
                      <span className="text-zinc-500 text-sm mb-1.5">/mo</span>
                    </div>
                    {billing === "annually" && (
                      <p className="text-zinc-500 text-xs mt-1">
                        Billed {formatCurrency(price)}/year · Save {formatCurrency(plan.annualSavings)}
                      </p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isCurrentPlan || isProcessing || state === "creating" || state === "verifying"}
                    className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200 relative overflow-hidden group ${
                      isCurrentPlan
                        ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 cursor-default"
                        : plan.popular
                        ? "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/30 hover:shadow-red-900/50"
                        : "bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 hover:border-zinc-500"
                    }`}
                  >
                    {isProcessing ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing…
                      </span>
                    ) : isCurrentPlan ? (
                      <span className="flex items-center justify-center gap-2">
                        <Check className="w-4 h-4" />
                        Current Plan
                      </span>
                    ) : (
                      <>
                        <span className="relative z-10">
                          {hasActiveSubscription ? "Switch to " : "Get "}
                          {plan.name}
                        </span>
                        {plan.popular && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        )}
                      </>
                    )}
                  </button>

                  {/* Features list */}
                  <ul className="mt-6 space-y-3">
                    <li className="flex items-center gap-3 text-sm">
                      <Tv className="w-4 h-4 flex-shrink-0" style={{ color: plan.color }} />
                      <span className="text-zinc-300">
                        {plan.features.resolution} streaming
                      </span>
                    </li>
                    {plan.features.hdr && (
                      <li className="flex items-center gap-3 text-sm">
                        <Sparkles className="w-4 h-4 flex-shrink-0" style={{ color: plan.color }} />
                        <span className="text-zinc-300">HDR & Dolby Vision</span>
                      </li>
                    )}
                    {plan.features.dolbyAtmos && (
                      <li className="flex items-center gap-3 text-sm">
                        <Volume2 className="w-4 h-4 flex-shrink-0" style={{ color: plan.color }} />
                        <span className="text-zinc-300">Dolby Atmos sound</span>
                      </li>
                    )}
                    <li className="flex items-center gap-3 text-sm">
                      <Play className="w-4 h-4 flex-shrink-0" style={{ color: plan.color }} />
                      <span className="text-zinc-300">
                        {plan.features.simultaneousStreams} screen{plan.features.simultaneousStreams > 1 ? "s" : ""} at once
                      </span>
                    </li>
                    <li className="flex items-center gap-3 text-sm">
                      <Download className="w-4 h-4 flex-shrink-0" style={{ color: plan.color }} />
                      <span className="text-zinc-300">
                        Downloads on {plan.features.downloadDevices} device{plan.features.downloadDevices > 1 ? "s" : ""}
                      </span>
                    </li>
                    {plan.features.watchParty && (
                      <li className="flex items-center gap-3 text-sm">
                        <Users className="w-4 h-4 flex-shrink-0" style={{ color: plan.color }} />
                        <span className="text-zinc-300">
                          Watch Party up to {plan.features.watchPartySize}
                        </span>
                      </li>
                    )}
                    {plan.features.exclusiveContent && (
                      <li className="flex items-center gap-3 text-sm">
                        <Crown className="w-4 h-4 flex-shrink-0" style={{ color: plan.color }} />
                        <span className="text-zinc-300">Exclusive premium content</span>
                      </li>
                    )}
                    {plan.features.earlyAccess && (
                      <li className="flex items-center gap-3 text-sm">
                        <Zap className="w-4 h-4 flex-shrink-0" style={{ color: plan.color }} />
                        <span className="text-zinc-300">Early access to new releases</span>
                      </li>
                    )}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-6 mt-10 text-zinc-500 text-sm"
        >
          <span className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-zinc-400" />
            Secured by Razorpay
          </span>
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-zinc-400" />
            Cancel anytime
          </span>
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-zinc-400" />
            No hidden charges
          </span>
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-zinc-400" />
            UPI · Cards · Net Banking
          </span>
        </motion.div>
      </div>

      {/* ─── Full Comparison Table ───────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">
          Full plan comparison
        </h2>

        <div className="rounded-2xl border border-zinc-800 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-4 bg-zinc-900/80">
            <div className="p-5 col-span-1 border-r border-zinc-800" />
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className="p-5 text-center border-r last:border-r-0 border-zinc-800"
              >
                <p className="font-bold text-white">{plan.name}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{plan.tagline}</p>
              </div>
            ))}
          </div>

          {/* Rows */}
          {FEATURE_ROWS.map((row, i) => {
            const Icon = row.icon;
            return (
              <div
                key={row.key}
                className={`grid grid-cols-4 border-t border-zinc-800 ${
                  i % 2 === 0 ? "bg-zinc-900/20" : "bg-transparent"
                }`}
              >
                <div className="p-4 col-span-1 border-r border-zinc-800 flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                  <span className="text-sm text-zinc-300">{row.label}</span>
                </div>
                {PLANS.map((plan) => (
                  <div
                    key={plan.id}
                    className="p-4 text-center border-r last:border-r-0 border-zinc-800 flex items-center justify-center"
                  >
                    {renderFeatureCell(getFeatureValue(plan, row.key))}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── FAQ ────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-24">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">
          Frequently asked questions
        </h2>
        <div>
          {FAQS.map((faq) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>
    </div>
  );
}