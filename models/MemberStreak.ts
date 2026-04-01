import mongoose from "mongoose";

const MemberStreakSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "WatchGroup", required: true },
    
    currentPersonalStreak: { type: Number, default: 0 },
    longestPersonalStreak: { type: Number, default: 0 },
    
    episodesWatchedThisWeek: { type: Number, default: 0 },
    lastActiveAt: { type: Date },
    
    streakFreezesRemaining: { type: Number, default: 2 },
    contributionScore: { type: Number, default: 0 }, // Percent of saves
    
    // Tracking for the current week boundary
    weekStart: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

MemberStreakSchema.index({ groupId: 1, userId: 1 }, { unique: true });

export default mongoose.models.MemberStreak || mongoose.model("MemberStreak", MemberStreakSchema);
