import mongoose from 'mongoose';

const InvoiceSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  amount: { type: Number, required: true },
  plan: { type: String, required: true },
  date: { type: Date, default: Date.now },
  transactionId: { type: String, unique: true }
}, { timestamps: true });

export const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);
