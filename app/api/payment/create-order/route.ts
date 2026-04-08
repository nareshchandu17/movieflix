import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import {
  createRazorpayOrder,
  generateReceiptId,
} from "@/lib/razorpay";
import Payment from "@/models/Payment";
import Subscription from "@/models/Subscription";
import { PlanTier, BillingCycle, PLANS } from "@/types/payment";
import { z } from "zod";

// ============================================================
// POST /api/payment/create-order
// Creates a Razorpay order for the selected plan
// ============================================================

const CreateOrderSchema = z.object({
  planId: z.enum(["mobile", "basic", "premium"]),
  billingCycle: z.enum(["monthly", "annually"]),
});

export async function POST(req: NextRequest) {
  try {
    // ─── Auth ───────────────────────────────────────────────
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();

    // ─── Validate ───────────────────────────────────────────
    const parsed = CreateOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { planId, billingCycle } = parsed.data as {
      planId: PlanTier;
      billingCycle: BillingCycle;
    };

    const plan = PLANS.find((p) => p.id === planId);
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    await connectDB();

    // ─── Check for existing active subscription ─────────────
    const existingSub = await Subscription.findOne({
      userId,
      status: "active",
    });

    // Allow plan upgrade/downgrade — will create new subscription on payment success
    // But prevent duplicate pending orders for same plan

    // ─── Generate receipt ───────────────────────────────────
    const receipt = generateReceiptId(userId);

    // ─── Create Razorpay Order ──────────────────────────────
    const razorpayOrder = await createRazorpayOrder({
      planId,
      billingCycle,
      userId,
      receipt,
    });

    // ─── Create placeholder subscription record ─────────────
    const now = new Date();
    const periodEnd = new Date(now);
    if (billingCycle === "monthly") {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    const subscription = await Subscription.create({
      userId,
      planId,
      status: "inactive", // becomes active on payment success
      billingCycle,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
    });

    // ─── Create Payment Record ──────────────────────────────
    await Payment.create({
      userId,
      subscriptionId: subscription._id.toString(),
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount as number,
      currency: razorpayOrder.currency,
      status: "created",
      planId,
      billingCycle,
      metadata: {
        receipt,
        previousSubscriptionId: existingSub?._id?.toString(),
      },
    });

    // ─── Response ───────────────────────────────────────────
    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      subscriptionId: subscription._id.toString(),
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      prefill: {
        name: session.user.name ?? "",
        email: session.user.email ?? "",
      },
      planName: plan.name,
      billingCycle,
    });
  } catch (error) {
    console.error("[create-order] Error:", error);
    return NextResponse.json(
      { error: "Failed to create order. Please try again." },
      { status: 500 }
    );
  }
}
