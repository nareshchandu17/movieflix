import mongoose, { Document, Model, Schema } from "mongoose";
import { IPayment, PaymentStatus, PlanTier, BillingCycle } from "@/types/payment";

// ============================================================
// Payment Mongoose Model — MovieFlix
// ============================================================

export interface PaymentDocument extends IPayment, Document {}

const PaymentSchema = new Schema<PaymentDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    subscriptionId: {
      type: String,
      required: true,
      index: true,
    },
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      sparse: true,
      index: true,
    },
    razorpaySignature: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
    },
    status: {
      type: String,
      enum: [
        "created",
        "authorized",
        "captured",
        "refunded",
        "failed",
      ] satisfies PaymentStatus[],
      default: "created",
      index: true,
    },
    planId: {
      type: String,
      enum: ["mobile", "basic", "premium"] satisfies PlanTier[],
      required: true,
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "annually"] satisfies BillingCycle[],
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtual: amountInRupees ──────────────────────────────────
PaymentSchema.virtual("amountInRupees").get(function (this: PaymentDocument) {
  return this.amount / 100;
});

// ─── Compound indexes ─────────────────────────────────────────
PaymentSchema.index({ userId: 1, createdAt: -1 });
PaymentSchema.index({ status: 1, createdAt: -1 });

const Payment: Model<PaymentDocument> =
  mongoose.models.Payment ||
  mongoose.model<PaymentDocument>("Payment", PaymentSchema);

export default Payment;
