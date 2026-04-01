import mongoose from "mongoose";

const ContentSegmentSchema = new mongoose.Schema(
  {
    contentId: { type: String, required: true }, // TMDB ID or Series ID
    contentType: { type: String, enum: ["Movie", "Series"], required: true },
    episodeId: { type: String }, // Optional, for series
    
    startTime: { type: Number, required: true }, // In seconds
    endTime: { type: Number, required: true }, // In seconds
    
    type: { 
      type: String, 
      enum: ["dialogue", "action", "exposition", "emotional-beat", "comic-relief", "plot-critical", "filler"],
      default: "dialogue"
    },
    
    plotImportance: { type: Number, min: 1, max: 10, default: 5 },
    characters: { type: [String], default: [] },
    
    factsIntroduced: [{
      fact: { type: String, required: true },
      isSpoilerForFuture: { type: Boolean, default: false },
      spoilerRadius: { type: String, enum: ["scene", "episode", "season", "all"], default: "episode" }
    }],
    
    summary: { type: String }, // Brief internal summary of this segment
  },
  {
    timestamps: true,
  }
);

ContentSegmentSchema.index({ contentId: 1, episodeId: 1, startTime: 1 });

export default mongoose.models.ContentSegment || mongoose.model("ContentSegment", ContentSegmentSchema);
