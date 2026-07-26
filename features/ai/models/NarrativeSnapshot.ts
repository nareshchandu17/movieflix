import mongoose from "mongoose";

const NarrativeSnapshotSchema = new mongoose.Schema(
  {
    contentId: { type: String, required: true },
    episodeId: { type: String }, // Optional
    timestamp: { type: Number }, // If it's a mid-content snapshot
    
    characterStates: [{
      name: { type: String, required: true },
      emotionalState: { type: String },
      location: { type: String },
      knowledgeLevel: { type: String }, // e.g., " знает о тайне" vs "не знает"
      activeRelationships: [{
        target: String,
        status: String // ally, enemy, etc.
      }]
    }],
    
    openThreads: [{
      name: { type: String, required: true },
      status: { type: String, enum: ["active", "dormant", "resolved"], default: "active" },
      lastAdvancedEpisode: String
    }],
    
    mysteries: [{
      description: String,
      isResolved: { type: Boolean, default: false }
    }]
  },
  {
    timestamps: true,
  }
);

NarrativeSnapshotSchema.index({ contentId: 1, episodeId: 1 });

export default mongoose.models.NarrativeSnapshot || mongoose.model("NarrativeSnapshot", NarrativeSnapshotSchema);
