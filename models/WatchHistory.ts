import mongoose from "mongoose";

const WatchHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    contentId: { type: String, required: true }, // Can be movie ID or series ID
    contentType: { type: String, enum: ["Movie", "Series"], required: true },
    episodeId: { type: String }, // Optional, for series
    timestamp: { type: Number, default: 0 }, // Progress in seconds
    lastWatched: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

WatchHistorySchema.index({ userId: 1, contentId: 1 }, { unique: true });

export default mongoose.models.WatchHistory || mongoose.model("WatchHistory", WatchHistorySchema);
