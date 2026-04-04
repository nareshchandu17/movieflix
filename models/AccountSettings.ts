import mongoose from "mongoose";

const AccountSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  profile: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    avatar: { type: String },
    displayName: { type: String }
  },
  parentalControls: {
    enabled: { type: Boolean, default: false },
    maturityRating: { 
      type: String, 
      enum: ['ALL', 'PG', 'PG-13', 'R', 'TV-MA'],
      default: 'ALL'
    },
    pin: { type: String }
  },
  language: {
    display: { type: String, default: 'English' },
    subtitle: { type: String, default: 'English' },
    subtitleAutoDetect: { type: Boolean, default: true }
  },
  playback: {
    autoplayNextEpisode: { type: Boolean, default: true },
    autoplayPreviews: { type: Boolean, default: false },
    skipIntros: { type: Boolean, default: true },
    smartDownloads: { type: Boolean, default: true },
    videoQuality: { 
      type: String, 
      enum: ['Auto', 'Low', 'Medium', 'High', 'Ultra HD 4K'],
      default: 'Auto'
    },
    downloadQuality: { 
      type: String, 
      enum: ['Standard', 'High'],
      default: 'High'
    }
  },
  subtitles: {
    fontSize: { 
      type: String, 
      enum: ['Small', 'Medium', 'Large', 'Extra Large'],
      default: 'Medium'
    },
    fontStyle: { 
      type: String, 
      enum: ['Default', 'Bold', 'Italic', 'Outlined'],
      default: 'Default'
    },
    textColor: { 
      type: String, 
      enum: ['White', 'Yellow', 'Green', 'Cyan'],
      default: 'White'
    },
    backgroundOpacity: { type: Number, default: 60, min: 0, max: 100 }
  },
  notifications: {
    email: {
      newReleases: { type: Boolean, default: true },
      continueWatching: { type: Boolean, default: true },
      billingAlerts: { type: Boolean, default: true },
      promotions: { type: Boolean, default: false }
    },
    push: {
      newEpisode: { type: Boolean, default: true },
      watchlistUpdates: { type: Boolean, default: true },
      friendActivity: { type: Boolean, default: true },
      downloadComplete: { type: Boolean, default: true }
    }
  },
  security: {
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String },
    lastPasswordChange: { type: Date },
    loginAlerts: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

const AccountSettings = mongoose.models.AccountSettings || mongoose.model('AccountSettings', AccountSettingsSchema);
export default AccountSettings;
