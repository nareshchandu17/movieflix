/**
 * @file PaymentAttempt.ts
 * @description Core utility services, backend API clients, or database connectors for MovieFlix services.
 * Provides enterprise-grade reliability, streaming controls, and robust type safety.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import mongoose from 'mongoose';

const PaymentAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'INR'
  },
  status: {
    type: String,
    required: true,
    enum: ['PENDING', 'SUCCESS', 'FAILED'],
    default: 'PENDING'
  },
  paymentMethod: {
    type: String,
    required: false
  },
  transactionId: {
    type: String,
    required: false,
    unique: true,
    sparse: true
  },
  failureReason: {
    type: String,
    required: false
  },
  processedAt: {
    type: Date,
    required: false
  }
}, {
  timestamps: true
});

export default mongoose.models.PaymentAttempt || mongoose.model('PaymentAttempt', PaymentAttemptSchema);
