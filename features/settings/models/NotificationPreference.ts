import mongoose from 'mongoose';

const NotificationPreferenceSchema = new mongoose.Schema({
  userId: { type: String, required: true, ref: 'User' },
  category: { type: String, enum: ['billing', 'account', 'marketing', 'releases'], required: true },
  isEnabled: { type: Boolean, default: true },
}, {
  timestamps: true
});

export const NotificationPreference = mongoose.models.NotificationPreference || mongoose.model('NotificationPreference', NotificationPreferenceSchema);
export default NotificationPreference;
