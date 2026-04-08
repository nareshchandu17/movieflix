// ============================================================
// MovieFlix Payment Types — Complete Type System
// ============================================================

export type PlanTier = "mobile" | "basic" | "premium";
export type BillingCycle = "monthly" | "annually";
export type SubscriptionStatus =
  | "active"
  | "inactive"
  | "cancelled"
  | "past_due"
  | "trialing";
export type PaymentStatus =
  | "created"
  | "authorized"
  | "captured"
  | "refunded"
  | "failed";

// ─── Plan Feature Flags ───────────────────────────────────────
export interface PlanFeatures {
  resolution: "480p" | "1080p" | "4K Ultra HD";
  hdr: boolean;
  dolbyAtmos: boolean;
  simultaneousStreams: number;
  downloadDevices: number;
  spatialAudio: boolean;
  adFree: boolean;
  earlyAccess: boolean;
  offlineDownloads: boolean;
  aiRecommendations: boolean;
  watchParty: boolean;
  watchPartySize: number;
  exclusiveContent: boolean;
}

// ─── Subscription Plan Definition ────────────────────────────
export interface SubscriptionPlan {
  id: PlanTier;
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  annualSavings: number;
  currency: string;
  color: string;
  accentColor: string;
  gradientFrom: string;
  gradientTo: string;
  popular: boolean;
  features: PlanFeatures;
  razorpayMonthlyPlanId?: string;
  razorpayAnnualPlanId?: string;
}

// ─── Razorpay Order ──────────────────────────────────────────
export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number; // in paise
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: "created" | "attempted" | "paid";
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

// ─── Razorpay Payment Response ────────────────────────────────
export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// ─── Checkout Session ─────────────────────────────────────────
export interface CheckoutSession {
  orderId: string;
  amount: number;
  currency: string;
  planId: PlanTier;
  billingCycle: BillingCycle;
  userId: string;
  email: string;
  name: string;
  phone?: string;
}

// ─── Subscription Model (DB) ─────────────────────────────────
export interface ISubscription {  userId: string;
  planId: PlanTier;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  razorpaySubscriptionId?: string;
  razorpayCustomerId?: string;
  trialEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Payment Record (DB) ──────────────────────────────────────
export interface IPayment {  userId: string;
  subscriptionId: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  planId: PlanTier;
  billingCycle: BillingCycle;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Invoice ─────────────────────────────────────────────────
export interface Invoice {
  id: string;
  date: Date;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "failed";
  planName: string;
  billingCycle: BillingCycle;
  downloadUrl?: string;
}

// ─── Plan Config ─────────────────────────────────────────────
export const PLANS: SubscriptionPlan[] = [
  {
    id: "mobile",
    name: "Mobile",
    tagline: "Great video quality",
    monthlyPrice: 149,
    annualPrice: 1490,
    annualSavings: 298,
    currency: "INR",
    color: "#64748b",
    accentColor: "#94a3b8",
    gradientFrom: "#1e293b",
    gradientTo: "#334155",
    popular: false,
    features: {
      resolution: "480p",
      hdr: false,
      dolbyAtmos: false,
      simultaneousStreams: 1,
      downloadDevices: 1,
      spatialAudio: false,
      adFree: true,
      earlyAccess: false,
      offlineDownloads: true,
      aiRecommendations: true,
      watchParty: false,
      watchPartySize: 0,
      exclusiveContent: false,
    },
  },
  {
    id: "basic",
    name: "Standard",
    tagline: "Full HD streaming",
    monthlyPrice: 499,
    annualPrice: 4990,
    annualSavings: 998,
    currency: "INR",
    color: "#e50914",
    accentColor: "#ff3547",
    gradientFrom: "#7f1d1d",
    gradientTo: "#991b1b",
    popular: true,
    features: {
      resolution: "1080p",
      hdr: true,
      dolbyAtmos: false,
      simultaneousStreams: 2,
      downloadDevices: 2,
      spatialAudio: false,
      adFree: true,
      earlyAccess: false,
      offlineDownloads: true,
      aiRecommendations: true,
      watchParty: true,
      watchPartySize: 5,
      exclusiveContent: false,
    },
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "4K + Dolby Atmos",
    monthlyPrice: 799,
    annualPrice: 7990,
    annualSavings: 1598,
    currency: "INR",
    color: "#f59e0b",
    accentColor: "#fbbf24",
    gradientFrom: "#78350f",
    gradientTo: "#92400e",
    popular: false,
    features: {
      resolution: "4K Ultra HD",
      hdr: true,
      dolbyAtmos: true,
      simultaneousStreams: 4,
      downloadDevices: 6,
      spatialAudio: true,
      adFree: true,
      earlyAccess: true,
      offlineDownloads: true,
      aiRecommendations: true,
      watchParty: true,
      watchPartySize: 20,
      exclusiveContent: true,
    },
  },
];

export const getPlanById = (id: PlanTier): SubscriptionPlan =>
  PLANS.find((p) => p.id === id) ?? PLANS[1];

export const formatCurrency = (
  amount: number,
  currency = "INR"
): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};
