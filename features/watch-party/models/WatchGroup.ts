import mongoose from "mongoose";

const WatchGroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    coverImage: { type: String },
    
    titleId: { type: String, required: true }, // The show they are watching together
    members: [{ 
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      role: { type: String, enum: ["creator", "member"], default: "member" },
      joinedAt: { type: Date, default: Date.now }
    }],
    
    weeklyGoal: { type: Number, default: 3 }, // Episodes per week
    currentStreak: { type: Number, default: 0 },
    streakStartDate: { type: Date, default: Date.now },
    
    status: { 
      type: String, 
      enum: ["active", "paused", "completed", "abandoned"], 
      default: "active" 
    },
    
    milestones: [{
      id: String,
      unlockedAt: Date,
      sharedCount: { type: Number, default: 0 }
    }]
  },
  {
    timestamps: true,
  }
);

WatchGroupSchema.index({ titleId: 1, status: 1 });

export default mongoose.models.WatchGroup || mongoose.model("WatchGroup", WatchGroupSchema);
