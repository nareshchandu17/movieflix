import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { verifyRazorpaySignature, fetchRazorpayPayment } from "@/lib/razorpay";
import Payment from "@/models/Payment";
import Subscription from "@/models/Subscription";
import User from "@/models/User";
import { z } from "zod";

// ============================================================
// POST /api/payment/verify
// Verifies Razorpay signature and activates subscription
// ============================================================

const VerifySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
  subscriptionId: z.string().min(1),
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
    const parsed = VerifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid verification data" },
        { status: 400 }
      );
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      subscriptionId,
    } = parsed.data;

    // ─── Verify Signature ───────────────────────────────────
    const isValid = verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      return NextResponse.json(
        { error: "Payment verification failed. Invalid signature." },
        { status: 400 }
      );
    }

    await connectDB();

    // ─── Find Payment Record ────────────────────────────────
    const paymentRecord = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
      userId,
    });

    if (!paymentRecord) {
      return NextResponse.json(
        { error: "Payment record not found" },
        { status: 404 }
      );
    }

    // ─── Fetch actual payment from Razorpay ─────────────────
    const razorpayPayment = await fetchRazorpayPayment(razorpay_payment_id);

    if (razorpayPayment.status !== "captured") {
      return NextResponse.json(
        { error: "Payment not captured yet" },
        { status: 400 }
      );
    }

    // ─── Update Payment Record ──────────────────────────────
    paymentRecord.razorpayPaymentId = razorpay_payment_id;
    paymentRecord.razorpaySignature = razorpay_signature;
    paymentRecord.status = "captured";
    await paymentRecord.save();

    // ─── Deactivate previous subscriptions ─────────────────
    await Subscription.updateMany(
      { userId, status: "active", _id: { $ne: subscriptionId } },
      { status: "cancelled", cancelAtPeriodEnd: false }
    );

    // ─── Activate new subscription ──────────────────────────
    const subscription = await Subscription.findOneAndUpdate(
      { _id: subscriptionId, userId },
      {
        status: "active",
        razorpaySubscriptionId: razorpay_payment_id,
      },
      { new: true }
    );

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    // ─── Update User's subscription tier ───────────────────
    await User.findByIdAndUpdate(userId, {
      subscription: subscription.planId,
      subscriptionStatus: "active",
      subscriptionExpiry: subscription.currentPeriodEnd,
    });

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription._id,
        planId: subscription.planId,
        status: subscription.status,
        billingCycle: subscription.billingCycle,
        currentPeriodEnd: subscription.currentPeriodEnd,
      },
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    console.error("[verify-payment] Error:", error);
    return NextResponse.json(
      { error: "Payment verification failed. Please contact support." },
      { status: 500 }
    );
  }
}
