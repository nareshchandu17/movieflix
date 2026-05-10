import mongoose, { Schema, Document } from "mongoose";

export interface IOTP extends Document {
  email?: string;
  phone?: string;
  otp: string;
  type: "login" | "reset" | "verify";
  expiresAt: Date;
  isVerified: boolean;
  isUsed: boolean;
  createdAt: Date;
}

const OTPSchema: Schema = new Schema(
  {
    email: { type: String },
    phone: { type: String },
    otp: { type: String, required: true },
    type: { type: String, required: true, enum: ["login", "reset", "verify"] },
    expiresAt: { type: Date, required: true },
    isVerified: { type: Boolean, default: false },
    isUsed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Add TTL index to automatically delete expired OTPs (backup to manual cleanup)
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.OTP || mongoose.model<IOTP>("OTP", OTPSchema);
