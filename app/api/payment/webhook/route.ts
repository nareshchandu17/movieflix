import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import Payment from "@/features/payments/models/Payment";
import Subscription from "@/features/payments/models/Subscription";
import User from "@/features/authentication/models/User";

// ============================================================
// POST /api/payment/webhook
// Razorpay webhook handler — handles async payment events
// ============================================================

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // ─── Verify webhook signature ───────────────────────────
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("[webhook] RAZORPAY_WEBHOOK_SECRET is not configured");
      return NextResponse.json(
        { error: "Webhook is not configured" },
        { status: 500 }
      );
    }

    const expectedSig = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    const expectedSigBuffer = Buffer.from(expectedSig);
    const signatureBuffer = Buffer.from(signature);

    if (
      expectedSigBuffer.length !== signatureBuffer.length ||
      !crypto.timingSafeEqual(expectedSigBuffer, signatureBuffer)
    ) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 400 }
      );
    }

    const event = JSON.parse(rawBody);
    await connectDB();

    // ─── Handle events ──────────────────────────────────────
    switch (event.event) {
      case "payment.captured": {
        const payment = event.payload.payment.entity;
        await handlePaymentCaptured(payment);
        break;
      }

      case "payment.failed": {
        const payment = event.payload.payment.entity;
        await handlePaymentFailed(payment);
        break;
      }

      case "refund.created": {
        const refund = event.payload.refund.entity;
        await handleRefundCreated(refund);
        break;
      }

      case "subscription.charged": {
        // For recurring subscriptions
        const sub = event.payload.subscription.entity;
        await handleSubscriptionCharged(sub);
        break;
      }

      case "subscription.cancelled": {
        const sub = event.payload.subscription.entity;
        await handleSubscriptionCancelled(sub);
        break;
      }

      default:

    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[webhook] Error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// ─── Event Handlers ───────────────────────────────────────────

async function handlePaymentCaptured(payment: any) {
  const sessionMongoose = await mongoose.startSession();
  try {
    await sessionMongoose.withTransaction(async () => {
      const paymentRecord = await Payment.findOneAndUpdate(
        { razorpayOrderId: payment.order_id },
        {
          razorpayPaymentId: payment.id,
          status: "captured",
        },
        { new: true, session: sessionMongoose }
      );

      if (!paymentRecord) return;

      const sub = await Subscription.findOneAndUpdate(
        { _id: paymentRecord.subscriptionId },
        { status: "active" },
        { new: true, session: sessionMongoose }
      );

      await User.findByIdAndUpdate(paymentRecord.userId, {
        subscription: paymentRecord.planId,
        subscriptionStatus: "active",
        subscriptionExpiry: sub?.currentPeriodEnd,
      }, { session: sessionMongoose });
    });

  } finally {
    await sessionMongoose.endSession();
  }
}

async function handlePaymentFailed(payment: any) {
  await Payment.findOneAndUpdate(
    { razorpayOrderId: payment.order_id },
    { status: "failed" }
  );


}

async function handleRefundCreated(refund: any) {
  await Payment.findOneAndUpdate(
    { razorpayPaymentId: refund.payment_id },
    { status: "refunded" }
  );


}

async function handleSubscriptionCharged(sub: any) {
  const sessionMongoose = await mongoose.startSession();
  try {
    await sessionMongoose.withTransaction(async () => {
      const subscription = await Subscription.findOne({
        razorpaySubscriptionId: sub.id,
      }).session(sessionMongoose);

      if (subscription) {
        const now = new Date();
        const end = new Date(now);

        if (subscription.billingCycle === "monthly") {
          end.setMonth(end.getMonth() + 1);
        } else {
          end.setFullYear(end.getFullYear() + 1);
        }

        subscription.currentPeriodStart = now;
        subscription.currentPeriodEnd = end;
        subscription.status = "active";
        await subscription.save({ session: sessionMongoose });

        await User.findByIdAndUpdate(subscription.userId, {
          subscription: subscription.planId,
          subscriptionStatus: "active",
          subscriptionExpiry: end,
        }, { session: sessionMongoose });
      }
    });

  } finally {
    await sessionMongoose.endSession();
  }
}

async function handleSubscriptionCancelled(sub: any) {
  const sessionMongoose = await mongoose.startSession();
  try {
    await sessionMongoose.withTransaction(async () => {
      const subscription = await Subscription.findOneAndUpdate(
        { razorpaySubscriptionId: sub.id },
        { status: "cancelled" },
        { new: true, session: sessionMongoose }
      );

      if (subscription) {
        await User.findByIdAndUpdate(subscription.userId, {
          subscriptionStatus: "cancelled",
        }, { session: sessionMongoose });
      }
    });

  } finally {
    await sessionMongoose.endSession();
  }
}
