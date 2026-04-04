import mongoose from "mongoose";

const DeviceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['Desktop', 'Mobile', 'Tablet', 'TV', 'Gaming Console'],
    required: true
  },
  platform: { type: String }, // Windows, iOS, Android, etc.
  browser: { type: String }, // Chrome, Safari, etc.
  location: { type: String }, // City, Country
  isActive: { type: Boolean, default: true },
  isCurrent: { type: Boolean, default: false },
  lastActive: { type: Date, default: Date.now },
  userAgent: { type: String },
  ipAddress: { type: String },
  downloadSlots: { type: Number, default: 0 },
  maxDownloadSlots: { type: Number, default: 4 }
}, {
  timestamps: true
});

const Device = mongoose.models.Device || mongoose.model('Device', DeviceSchema);
export default Device;
