"use client";

import { Crown, Smartphone, Shield } from "lucide-react";
import { PlanTier, PLANS } from "@/types/payment";
import { useSubscription } from "@/hooks/useSubscription";

// ============================================================
// PlanBadge — shows user's current plan tier
// Use this in Navbar, Profile, and settings
// ============================================================

interface PlanBadgeProps {
  variant?: "full" | "icon" | "pill";
  className?: string;
}

function PlanIcon({ planId, size = 14 }: { planId: PlanTier; size?: number }) {
  const style = { width: size, height: size };
  if (planId === "mobile") return <Smartphone style={style} />;
  if (planId === "basic") return <Shield style={style} />;
  return <Crown style={style} />;
}

export function PlanBadge({ variant = "pill", className = "" }: PlanBadgeProps) {
  const { subscription, hasActiveSubscription, loading } = useSubscription();

  if (loading || !hasActiveSubscription || !subscription) return null;

  const plan = PLANS.find((p) => p.id === subscription.planId);
  if (!plan) return null;

  if (variant === "icon") {
    return (
      <span
        className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${className}`}
        style={{ backgroundColor: `${plan.color}20`, color: plan.color }}
        title={`${plan.name} Plan`}
      >
        <PlanIcon planId={plan.id} size={12} />
      </span>
    );
  }

  if (variant === "pill") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${className}`}
        style={{
          backgroundColor: `${plan.color}12`,
          borderColor: `${plan.color}30`,
          color: plan.color,
        }}
      >
        <PlanIcon planId={plan.id} size={11} />
        {plan.name}
      </span>
    );
  }

  // full variant
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${className}`}
      style={{
        backgroundColor: `${plan.color}08`,
        borderColor: `${plan.color}25`,
      }}
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${plan.color}20`, color: plan.color }}
      >
        <PlanIcon planId={plan.id} size={15} />
      </div>
      <div>
        <p className="text-xs font-bold" style={{ color: plan.color }}>
          {plan.name} Plan
        </p>
        <p className="text-xs text-zinc-600">
          {subscription.daysRemaining}d remaining
        </p>
      </div>
    </div>
  );
}
