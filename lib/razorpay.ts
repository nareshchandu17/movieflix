import Razorpay from "razorpay";
import crypto from "crypto";
import { PlanTier, BillingCycle, PLANS } from "@/types/payment";

// ============================================================
// Razorpay Utility Library — MovieFlix
// ============================================================

// ─── Singleton Instance ───────────────────────────────────────
let razorpayInstance: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  if (!razorpayInstance) {
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET || process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error("Razorpay Error: Missing credentials.", {
        hasKeyId: !!keyId,
        hasKeySecret: !!keySecret,
      });
      throw new Error(
        "Razorpay credentials not configured. Please ensure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set in your .env.local file."
      );
    }

    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }
  return razorpayInstance;
}

// ─── Create Order ─────────────────────────────────────────────
export async function createRazorpayOrder({
  planId,
  billingCycle,
  userId,
  receipt,
}: {
  planId: PlanTier;
  billingCycle: BillingCycle;
  userId: string;
  receipt: string;
}) {
  const razorpay = getRazorpay();
  const plan = PLANS.find((p) => p.id === planId);

  if (!plan) throw new Error(`Plan ${planId} not found`);

  const amount =
    billingCycle === "annually" ? plan.annualPrice : plan.monthlyPrice;

  // Razorpay expects amount in paise (1 INR = 100 paise)
  const amountInPaise = amount * 100;

  const order = await razorpay.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt,
    notes: {
      userId,
      planId,
      billingCycle,
    },
  });

  return order;
}

export function verifyRazorpaySignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET || process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET;
  
  if (!keySecret) {
    console.error("❌ Razorpay Signature Error: Missing RAZORPAY_KEY_SECRET");
    return false;
  }

  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(body)
    .digest("hex");

  // Safety check: timingSafeEqual throws if lengths differ
  if (expectedSignature.length !== signature.length) {
    console.warn("⚠️ Razorpay Signature Mismatch: Length difference");
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature)
  );
}

// ─── Fetch Payment Details ────────────────────────────────────
export async function fetchRazorpayPayment(paymentId: string) {
  const razorpay = getRazorpay();
  return await razorpay.payments.fetch(paymentId);
}

// ─── Refund Payment ───────────────────────────────────────────
export async function refundRazorpayPayment(
  paymentId: string,
  amount?: number
) {
  const razorpay = getRazorpay();
  return await razorpay.payments.refund(paymentId, {
    amount, // if undefined, full refund
    speed: "optimum",
    notes: { reason: "User requested cancellation" },
  });
}

// ─── Calculate Subscription Dates ────────────────────────────
export function calculateSubscriptionDates(billingCycle: BillingCycle): {
  start: Date;
  end: Date;
} {
  const start = new Date();
  const end = new Date(start);

  if (billingCycle === "monthly") {
    end.setMonth(end.getMonth() + 1);
  } else {
    end.setFullYear(end.getFullYear() + 1);
  }

  return { start, end };
}

// ─── Generate Receipt ID ──────────────────────────────────────
export function generateReceiptId(userId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `MFX-${userId.substring(0, 6)}-${timestamp}-${random}`;
}
