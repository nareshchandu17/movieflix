/**
 * @file Plan.ts
 * @description Core utility services, backend API clients, or database connectors for MovieFlix services.
 * Provides enterprise-grade reliability, streaming controls, and robust type safety.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import mongoose from 'mongoose';

const PlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['BASIC', 'PREMIUM'],
    unique: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'INR'
  },
  features: [{
    type: String,
    required: true
  }],
  isActive: {
    type: Boolean,
    required: true,
    default: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true,
    enum: ['monthly', 'yearly']
  },
  stripePriceId: {
    type: String,
    required: false // Optional for real Stripe integration
  }
}, {
  timestamps: true
});

export default mongoose.models.Plan || mongoose.model('Plan', PlanSchema);
