import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  avatar: {
    type: String,
    default: "default.png"
  },
  isKids: {
    type: Boolean,
    default: false
  },
  maturityLevel: {
    type: String,
    enum: ["U", "13+", "18+"],
    default: "18+"
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastWatchedAt: {
    type: Date,
    default: null
  },
  preferences: {
    autoplay: {
      type: Boolean,
      default: true
    },
    language: {
      type: String,
      default: "en"
    },
    subtitles: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Index for performance
ProfileSchema.index({ userId: 1, isActive: 1 });
ProfileSchema.index({ lastWatchedAt: -1 });

export default mongoose.models.Profile || mongoose.model("Profile", ProfileSchema);
