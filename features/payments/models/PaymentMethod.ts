import mongoose from 'mongoose';

const PaymentMethodSchema = new mongoose.Schema({
  userId: { type: String, required: true, ref: 'User' },
  type: { type: String, enum: ['card', 'upi', 'paypal', 'bank'] },
  brand: { type: String },
  last4: { type: String },
  expiry: { type: String },
  isDefault: { type: Boolean, default: false },
}, {
  timestamps: true
});

export const PaymentMethod = mongoose.models.PaymentMethod || mongoose.model('PaymentMethod', PaymentMethodSchema);
export default PaymentMethod;
