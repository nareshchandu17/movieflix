import mongoose from "mongoose";

const MoodProfileSchema = new mongoose.Schema(
  {
    contentId: { type: String, required: true, unique: true }, // Links to TMDB ID or internal Movie ID
    contentType: { type: String, enum: ["Movie", "Series"], required: true },
    
    // Emotional Arc Fingerprint (Vector components)
    openingEmotion: { type: String, required: true },
    midpointEmotion: { type: String, required: true },
    resolutionEmotion: { type: String, required: true },
    intensityScore: { type: Number, min: 1, max: 10, required: true },
    cryProbability: { type: Number, min: 1, max: 10, required: true },
    hopeIndex: { type: Number, min: 1, max: 10, required: true },
    laughDensity: { type: Number, min: 1, max: 10, required: true },
    
    // Content Tags
    endingType: { type: String, enum: ["open", "closed", "ambiguous", "tragic", "triumphant"], required: true },
    pacing: { type: String, enum: ["slow-burn", "steady", "fast", "erratic"], required: true },
    tone: { type: String, enum: ["dark-but-hopeful", "purely dark", "warm", "satirical", "absurdist"], required: true },
    payoffReliability: { type: Number, min: 1, max: 10, required: true }, // How much it delivers on its promise
    language: { type: String, index: true },
  },
  {
    timestamps: true,
  }
);

// Index for similarity searches
MoodProfileSchema.index({ intensityScore: 1, cryProbability: 1, hopeIndex: 1, laughDensity: 1 });

export default mongoose.models.MoodProfile || mongoose.model("MoodProfile", MoodProfileSchema);
