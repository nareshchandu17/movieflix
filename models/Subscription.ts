import mongoose, { Document, Model, Schema } from "mongoose";
import { ISubscription, SubscriptionStatus, BillingCycle, PlanTier } from "@/types/payment";

// ============================================================
// Subscription Mongoose Model — MovieFlix
// ============================================================

export interface SubscriptionDocument extends ISubscription, Document {}

const SubscriptionSchema = new Schema<SubscriptionDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    planId: {
      type: String,
      enum: ["mobile", "basic", "premium"] satisfies PlanTier[],
      required: true,
    },
    status: {
      type: String,
      enum: [
        "active",
        "inactive",
        "cancelled",
        "past_due",
        "trialing",
      ] satisfies SubscriptionStatus[],
      default: "inactive",
      index: true,
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "annually"] satisfies BillingCycle[],
      required: true,
    },
    currentPeriodStart: {
      type: Date,
      required: true,
    },
    currentPeriodEnd: {
      type: Date,
      required: true,
      index: true,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    razorpaySubscriptionId: {
      type: String,
      sparse: true,
      index: true,
    },
    razorpayCustomerId: {
      type: String,
      sparse: true,
    },
    trialEnd: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtual: isActive ────────────────────────────────────────
SubscriptionSchema.virtual("isActive").get(function (this: SubscriptionDocument) {
  return (
    this.status === "active" &&
    !this.cancelAtPeriodEnd &&
    this.currentPeriodEnd > new Date()
  );
});

// ─── Virtual: daysRemaining ───────────────────────────────────
SubscriptionSchema.virtual("daysRemaining").get(function (this: SubscriptionDocument) {
  const now = new Date();
  const end = new Date(this.currentPeriodEnd);
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

// ─── Compound index for lookups ───────────────────────────────
SubscriptionSchema.index({ userId: 1, status: 1 });

const Subscription: Model<SubscriptionDocument> =
  mongoose.models.Subscription ||
  mongoose.model<SubscriptionDocument>("Subscription", SubscriptionSchema);

export default Subscription;
