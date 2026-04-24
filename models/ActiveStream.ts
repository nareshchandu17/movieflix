import mongoose from 'mongoose';

const ActiveStreamSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  deviceId: { type: String, required: true },
  startedAt: { type: Date, default: Date.now },
  lastHeartbeat: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

// Auto-expire inactive streams after 2 minutes
ActiveStreamSchema.index({ lastHeartbeat: 1 }, { expireAfterSeconds: 120 });

export const ActiveStream = mongoose.models.ActiveStream || mongoose.model('ActiveStream', ActiveStreamSchema);
