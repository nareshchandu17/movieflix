import mongoose from 'mongoose';

// User Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  phone: { type: String },
  avatar: { type: String },
  memberSince: { type: Date, default: Date.now },
  settings: { type: mongoose.Schema.Types.Mixed, default: {} },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Subscription Schema
const SubscriptionSchema = new mongoose.Schema({
  userId: { type: String, required: true, ref: 'User' },
  plan: { type: String, enum: ['free', 'basic', 'premium', 'ultra'] },
  status: { type: String, enum: ['active', 'paused', 'cancelled'] },
  quality: { type: String, enum: ['sd', 'hd', 'fullhd', '4k'] },
  screens: { type: Number, default: 1 },
  price: { type: Number },
  currency: { type: String, default: 'USD' },
  nextBilling: { type: Date },
  autoRenew: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Payment Method Schema
const PaymentMethodSchema = new mongoose.Schema({
  userId: { type: String, required: true, ref: 'User' },
  type: { type: String, enum: ['card', 'upi', 'paypal', 'bank'] },
  brand: { type: String },
  last4: { type: String },
  expiry: { type: String },
  isDefault: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Profile Schema
const ProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, ref: 'User' },
  name: { type: String, required: true },
  avatar: { type: String },
  isKids: { type: Boolean, default: false },
  pin: { type: String },
  language: { type: String, default: 'en' },
  maturityRating: { type: String, enum: ['kids', 'teen', 'adult'], default: 'adult' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Device Schema
const DeviceSchema = new mongoose.Schema({
  userId: { type: String, required: true, ref: 'User' },
  name: { type: String, required: true },
  type: { type: String, enum: ['mobile', 'tablet', 'tv', 'desktop'] },
  platform: { type: String },
  lastActive: { type: Date },
  location: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Notification Preference Schema
const NotificationPreferenceSchema = new mongoose.Schema({
  userId: { type: String, required: true, ref: 'User' },
  category: { type: String, enum: ['billing', 'account', 'marketing', 'releases'], required: true },
  isEnabled: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Watch History Schema
const WatchHistorySchema = new mongoose.Schema({
  userId: { type: String, required: true, ref: 'User' },
  mediaId: { type: String, required: true },
  mediaType: { type: String, enum: ['movie', 'tv'], required: true },
  title: { type: String, required: true },
  duration: { type: Number },
  watchedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

// Billing History Schema
const BillingHistorySchema = new mongoose.Schema({
  userId: { type: String, required: true, ref: 'User' },
  type: { type: String, enum: ['subscription', 'payment', 'refund'], required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  status: { type: String, enum: ['completed', 'pending', 'failed'], required: true },
  description: { type: String },
  invoiceId: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Create and export models
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Subscription = mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);
export const PaymentMethod = mongoose.models.PaymentMethod || mongoose.model('PaymentMethod', PaymentMethodSchema);
export const Profile = mongoose.models.Profile || mongoose.model('Profile', ProfileSchema);
export const Device = mongoose.models.Device || mongoose.model('Device', DeviceSchema);
export const NotificationPreference = mongoose.models.NotificationPreference || mongoose.model('NotificationPreference', NotificationPreferenceSchema);
export const WatchHistory = mongoose.models.WatchHistory || mongoose.model('WatchHistory', WatchHistorySchema);
export const BillingHistory = mongoose.models.BillingHistory || mongoose.model('BillingHistory', BillingHistorySchema);

// Database connection
export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cineworld';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('MongoDB disconnection error:', error);
  }
};
