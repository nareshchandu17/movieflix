import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      required: false,
      unique: true,
      index: true,
      sparse: true,
    },
    name: {
      type: String,
      required: false, // phone-based login might not have a name initially
    },
    username: {
      type: String,
      required: false,
      unique: true,
      index: true,
      sparse: true,
    },
    email: {
      type: String,
      required: false,
      unique: true,
      index: true,
      sparse: true, // Allow multiple users to have no email
    },
    phone: {
      type: String,
      unique: true,
      index: true,
      sparse: true, // Allow users to have only an email
    },
    dob: {
      type: String, // YYYY-MM-DD
      required: false,
    },
    language: {
      type: String, // e.g. "English", "Telugu"
      required: false,
    },
    password: {
      type: String,
      default: null, // null for OAuth users
    },
    avatar: {
      type: String,
      default: null,
    },
    interests: {
      type: [String],
      default: [],
    },
    moods: {
      type: [String],
      default: [],
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    preferences: {
      genres: {
        type: [String],
        default: [],
      },
    },
    profilesLimit: {
      type: Number,
      default: 5,
      min: 1,
      max: 10
    },
    subscription: {
      type: String,
      enum: ["mobile", "basic", "premium", "none"],
      default: "none",
    },
    subscriptionStatus: {
      type: String,
      enum: ["active", "inactive", "cancelled", "past_due", "trialing"],
      default: "inactive",
    },
    subscriptionExpiry: {
      type: Date,
      default: null,
    },
    watchPartyRooms: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WatchPartyRoom'
    }],
    lastUsedProfile: {
      type: String, // Store profileId for cross-device memory (default picker)
      default: null,
      index: true
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
      default: null,
    },
    twoFactorRecoveryCodes: {
      type: [String],
      default: [],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      index: true,
    },
    // Merged from lib/mongoose.ts
    firstName: { type: String },
    lastName: { type: String },
    memberSince: { type: Date, default: Date.now },
    settings: { type: mongoose.Schema.Types.Mixed, default: {} },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Ensure the model is only created once
const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
