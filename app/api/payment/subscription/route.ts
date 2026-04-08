import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Subscription from "@/models/Subscription";
import Payment from "@/models/Payment";
import { PLANS } from "@/types/payment";

// ============================================================
// GET /api/payment/subscription
// Returns current subscription + payment history
// ============================================================

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    await connectDB();

    // ─── Active subscription ────────────────────────────────
    const subscription = await Subscription.findOne({
      userId,
      status: "active",
    }).lean();

    // ─── Payment history (last 12) ──────────────────────────
    const payments = await Payment.find({ userId, status: "captured" })
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();

    // ─── Enrich with plan details ───────────────────────────
    const enrichedSub = subscription
      ? {
          ...subscription,
          plan: PLANS.find((p) => p.id === subscription.planId),
          daysRemaining: Math.max(
            0,
            Math.ceil(
              (new Date(subscription.currentPeriodEnd).getTime() -
                Date.now()) /
                (1000 * 60 * 60 * 24)
            )
          ),
        }
      : null;

    const enrichedPayments = payments.map((p) => ({
      ...p,
      amountInRupees: p.amount / 100,
      plan: PLANS.find((pl) => pl.id === p.planId),
    }));

    return NextResponse.json({
      subscription: enrichedSub,
      payments: enrichedPayments,
      hasActiveSubscription: !!enrichedSub,
    });
  } catch (error) {
    console.error("[subscription] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE /api/payment/subscription
// Cancel subscription at period end
// ============================================================

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    await connectDB();

    const subscription = await Subscription.findOneAndUpdate(
      { userId, status: "active" },
      { cancelAtPeriodEnd: true },
      { new: true }
    );

    if (!subscription) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Subscription will be cancelled on ${subscription.currentPeriodEnd.toLocaleDateString()}`,
      cancelDate: subscription.currentPeriodEnd,
    });
  } catch (error) {
    console.error("[cancel-subscription] Error:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
