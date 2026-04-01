import mongoose from "mongoose";

const CharacterArcLogSchema = new mongoose.Schema(
  {
    characterId: { type: mongoose.Schema.Types.ObjectId, ref: "CharacterProfile", required: true },
    episodeId: { type: String },
    timestamp: { type: Number, required: true }, // Time point of this state
    
    emotionalState: { type: String, required: true },
    moralAlignment: { type: Number, min: -10, max: 10, default: 0 },
    stabilityScore: { type: Number, min: 0, max: 10, default: 5 },
    powerLevel: { type: Number, min: 0, max: 10, default: 5 },
    
    motivation: { type: String },
    decisionsMade: [{ type: String }],
    informationGained: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

CharacterArcLogSchema.index({ characterId: 1, timestamp: 1 });

export default mongoose.models.CharacterArcLog || mongoose.model("CharacterArcLog", CharacterArcLogSchema);
