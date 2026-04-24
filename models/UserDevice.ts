import mongoose from 'mongoose';

const UserDeviceSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  deviceId: { type: String, required: true, unique: true },
  browser: String,
  os: String,
  location: String,
  lastActive: { type: Date, default: Date.now }
}, { timestamps: true });

export const UserDevice = mongoose.models.UserDevice || mongoose.model('UserDevice', UserDeviceSchema);
