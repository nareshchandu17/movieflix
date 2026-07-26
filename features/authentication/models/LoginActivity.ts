import mongoose from "mongoose";

const LoginActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: { type: String, required: true },
  platform: { type: String, required: true },
  browser: { type: String, required: true },
  deviceType: { type: String, required: true },
  ipAddress: { type: String, required: true },
  isActive: { type: Boolean, default: false },
  loginTime: { type: Date, default: Date.now },
  logoutTime: { type: Date },
  userAgent: { type: String }
}, {
  timestamps: true
});

// TTL index to automatically remove login activity older than 90 days
LoginActivitySchema.index({ loginTime: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

const LoginActivity = mongoose.models.LoginActivity || mongoose.model('LoginActivity', LoginActivitySchema);
export default LoginActivity;
