import mongoose from "mongoose";

const GroupActivitySchema = new mongoose.Schema(
  {
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "WatchGroup", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Action author
    
    type: { 
      type: String, 
      enum: ["watch-progress", "streak-at-risk", "streak-saved", "milestone", "nudge", "invitation"],
      required: true 
    },
    
    message: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed }, // Meta info (episode ID, milestone ID)
    
    reactions: [{
      emoji: String,
      count: { type: Number, default: 0 },
      userIds: [String]
    }]
  },
  {
    timestamps: true,
  }
);

GroupActivitySchema.index({ groupId: 1, createdAt: -1 });

export default mongoose.models.GroupActivity || mongoose.model("GroupActivity", GroupActivitySchema);
