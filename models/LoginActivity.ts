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

const LoginActivity = mongoose.models.LoginActivity || mongoose.model('LoginActivity', LoginActivitySchema);
export default LoginActivity;
