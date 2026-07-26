import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/authentication/services/auth";
import { connectDB } from "@/lib/db";
import { verifyRazorpaySignature, fetchRazorpayPayment } from "@/features/payments/services/razorpay";
import Payment from "@/features/payments/models/Payment";
import Subscription from "@/features/payments/models/Subscription";
import User from "@/features/authentication/models/User";
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
    const isMock = razorpay_order_id.startsWith("mock_");
    const isDev = process.env.NODE_ENV === "development";

    if (isMock && isDev) {

    } else {
      const isValid = verifyRazorpaySignature({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
      });

      if (!isValid) {
        console.warn("❌ Payment verification failed: Invalid signature for Order:", razorpay_order_id);
        return NextResponse.json(
          { error: "Payment verification failed. Invalid signature." },
          { status: 400 }
        );
      }
    }

    await connectDB();

    // ─── Find Payment Record ────────────────────────────────
    const paymentRecord = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
      userId,
    });

    if (!paymentRecord) {
      console.warn("❌ Payment verification failed: Payment record not found for Order:", razorpay_order_id);
      return NextResponse.json(
        { error: "Payment record not found" },
        { status: 404 }
      );
    }

    // ─── Fetch actual payment status ───────────────────────
    let isCaptured = false;
    
    if (isMock && isDev) {
      isCaptured = true;
    } else {
      const razorpayPayment = await fetchRazorpayPayment(razorpay_payment_id);
      isCaptured = razorpayPayment.status === "captured";
    }

    if (!isCaptured) {
      console.warn("❌ Payment verification failed: Payment not captured status for Order:", razorpay_order_id);
      return NextResponse.json(
        { error: "Payment not captured yet" },
        { status: 400 }
      );
    }

    // ─── Execute Transaction ────────────────────────────────
    let subscription: any;
    
    const sessionMongoose = await mongoose.startSession();
    try {
      await sessionMongoose.withTransaction(async () => {
        paymentRecord.razorpayPaymentId = razorpay_payment_id;
        paymentRecord.razorpaySignature = razorpay_signature;
        paymentRecord.status = "captured";
        await paymentRecord.save({ session: sessionMongoose });

        await Subscription.updateMany(
          { userId, status: "active", _id: { $ne: subscriptionId } },
          { status: "cancelled", cancelAtPeriodEnd: false },
          { session: sessionMongoose }
        );

        subscription = await Subscription.findOneAndUpdate(
          { _id: subscriptionId, userId },
          {
            status: "active",
            razorpaySubscriptionId: razorpay_payment_id,
          },
          { new: true, session: sessionMongoose }
        );

        if (!subscription) {
          throw new Error(`Subscription ID mismatch: ${subscriptionId}`);
        }

        await User.findByIdAndUpdate(userId, {
          subscription: subscription.planId,
          subscriptionStatus: "active",
          subscriptionExpiry: subscription.currentPeriodEnd,
        }, { session: sessionMongoose });
      });
    } finally {
      await sessionMongoose.endSession();
    }



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
  } catch (error: any) {
    console.error("❌ [verify-payment] Exception:", error.message || error);
    return NextResponse.json(
      { error: "Payment verification failed. Please contact support." },
      { status: 500 }
    );
  }
}
