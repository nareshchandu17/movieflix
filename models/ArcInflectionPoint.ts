import mongoose from "mongoose";

const ArcInflectionPointSchema = new mongoose.Schema(
  {
    characterId: { type: mongoose.Schema.Types.ObjectId, ref: "CharacterProfile", required: true },
    episodeId: { type: String },
    timestamp: { type: Number, required: true },
    
    type: { 
      type: String, 
      enum: ["trauma", "revelation", "moral-choice", "loss", "transformation", "betrayal", "growth"],
      required: true 
    },
    
    beforeState: { type: String },
    afterState: { type: String },
    catalyst: { type: String }, // Event or character
    permanence: { type: Number, min: 0, max: 10, default: 10 },
    
    description: { type: String, required: true }
  },
  {
    timestamps: true,
  }
);

ArcInflectionPointSchema.index({ characterId: 1, timestamp: 1 });

export default mongoose.models.ArcInflectionPoint || mongoose.model("ArcInflectionPoint", ArcInflectionPointSchema);
