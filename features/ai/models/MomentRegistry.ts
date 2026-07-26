import mongoose from "mongoose";

const MomentRegistrySchema = new mongoose.Schema(
  {
    contentId: { type: String, required: true }, // Movie/Series ID
    timestamp: { type: Number, required: true }, // Trigger time in seconds
    type: { 
      type: String, 
      enum: ["twist", "death", "jump-scare", "joke", "romance", "action-peak"],
      required: true 
    },
    intensity: { type: Number, min: 1, max: 10, default: 5 },
    description: { type: String },
    
    // Community stats
    totalReactions: { type: Number, default: 0 },
    avgCommunityIntensity: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

MomentRegistrySchema.index({ contentId: 1, timestamp: 1 });

export default mongoose.models.MomentRegistry || mongoose.model("MomentRegistry", MomentRegistrySchema);
