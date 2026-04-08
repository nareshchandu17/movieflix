"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Crown, Lock, Play } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { PlanTier, PLANS } from "@/types/payment";

// ============================================================
// SubscriptionGate — wraps premium content
// Usage: <SubscriptionGate requiredPlan="basic"><VideoPlayer /></SubscriptionGate>
// ============================================================

const TIER_ORDER: PlanTier[] = ["mobile", "basic", "premium"];

function meetsRequirement(userPlan: PlanTier, required: PlanTier): boolean {
  return TIER_ORDER.indexOf(userPlan) >= TIER_ORDER.indexOf(required);
}

interface SubscriptionGateProps {
  children: ReactNode;
  requiredPlan?: PlanTier;
  /** Show blur preview of content behind gate */
  showPreview?: boolean;
  /** Custom unlock message */
  message?: string;
  /** Whether to show loading state */
  showLoading?: boolean;
  /** Custom class for the container */
  className?: string;
}

export function SubscriptionGate({
  children,
  requiredPlan = "mobile",
  showPreview = true,
  message,
  showLoading = true,
  className = "",
}: SubscriptionGateProps) {
  const router = useRouter();
  const { subscription, hasActiveSubscription, loading } = useSubscription();

  if (loading && showLoading) {
    return <div className="animate-pulse bg-zinc-900 rounded-xl h-40" />;
  }

  const hasAccess =
    hasActiveSubscription &&
    subscription &&
    meetsRequirement(subscription.planId, requiredPlan);

  if (hasAccess) return <>{children}</>;

  const requiredPlanData = PLANS.find((p) => p.id === requiredPlan);

  return (
    <div
      className={`relative rounded-2xl overflow-hidden ${
        !children && !showPreview ? "min-h-[300px]" : ""
      } ${className}`}
      style={!children ? { minHeight: "350px" } : {}}
    >
      {/* Blurred content preview */}
      {showPreview && children && (
        <div className="select-none pointer-events-none" aria-hidden>
          <div className="blur-sm opacity-40 scale-[1.01] origin-center">
            {children}
          </div>
        </div>
      )}

      {/* Gate overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`${
          showPreview ? "absolute inset-0" : ""
        } flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-2xl p-8`}
      >
        <div className="text-center max-w-sm">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              backgroundColor: `${requiredPlanData?.color ?? "#e50914"}15`,
              color: requiredPlanData?.color ?? "#e50914",
            }}
          >
            {hasActiveSubscription ? (
              <Lock className="w-7 h-7" />
            ) : (
              <Crown className="w-7 h-7" />
            )}
          </div>

          <h3 className="text-lg font-bold text-white mb-2">
            {hasActiveSubscription
              ? `${requiredPlanData?.name ?? "Higher"} plan required`
              : "Subscribe to watch"}
          </h3>

          <p className="text-zinc-400 text-sm mb-6">
            {message ??
              (hasActiveSubscription
                ? `Upgrade to ${requiredPlanData?.name} to access this content.`
                : "Get unlimited access to movies, series, and originals.")}
          </p>

          <button
            onClick={() => router.push("/pricing")}
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-red-900/30"
          >
            {hasActiveSubscription ? (
              <>
                <Crown className="w-4 h-4" />
                Upgrade Plan
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Get Started
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
