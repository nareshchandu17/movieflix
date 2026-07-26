import mongoose from "mongoose";

const RelationshipHistorySchema = new mongoose.Schema(
  {
    contentId: { type: String, required: true },
    charA: { type: mongoose.Schema.Types.ObjectId, ref: "CharacterProfile", required: true },
    charB: { type: mongoose.Schema.Types.ObjectId, ref: "CharacterProfile", required: true },
    
    evolution: [{
      timestamp: Number,
      episodeId: String,
      type: { type: String, enum: ["mentor", "rival", "romantic", "family", "friend", "enemy", "complicated"] },
      quality: { type: Number, min: -10, max: 10 }, // Positive vs Negative
      description: String
    }],
    
    definingScenes: [{
      episodeId: String,
      timestamp: Number,
      description: String
    }]
  },
  {
    timestamps: true,
  }
);

RelationshipHistorySchema.index({ contentId: 1, charA: 1, charB: 1 });

export default mongoose.models.RelationshipHistory || mongoose.model("RelationshipHistory", RelationshipHistorySchema);
