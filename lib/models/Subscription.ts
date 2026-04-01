import mongoose from 'mongoose';

const SubscriptionSchema = new mongoose.Schema({
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
  status: {
    type: String,
    required: true,
    enum: ['ACTIVE', 'CANCELLED', 'EXPIRED'],
    default: 'ACTIVE'
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: false
  },
  autoRenew: {
    type: Boolean,
    default: true
  },
  stripeSubscriptionId: {
    type: String,
    required: false // Optional for real Stripe integration
  }
}, {
  timestamps: true
});

export default mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);
