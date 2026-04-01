import mongoose from "mongoose";

const CharacterProfileSchema = new mongoose.Schema(
  {
    contentId: { type: String, required: true }, // Movie or Series ID
    name: { type: String, required: true },
    actorName: { type: String },
    
    initialArchetype: { type: String },
    finalArchetype: { type: String },
    
    introEpisodeId: { type: String },
    introTimestamp: { type: Number },
    
    exitEpisodeId: { type: String },
    exitTimestamp: { type: Number },
    isDead: { type: Boolean, default: false },
    
    totalScreenTime: { type: Number }, // In seconds
    dnaSummary: { type: String }, // AI-generated core summary
  },
  {
    timestamps: true,
  }
);

CharacterProfileSchema.index({ contentId: 1, name: 1 });

export default mongoose.models.CharacterProfile || mongoose.model("CharacterProfile", CharacterProfileSchema);
