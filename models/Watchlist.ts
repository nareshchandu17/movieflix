import mongoose from "mongoose";

const WatchlistSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    contentId: { type: String, required: true },
    contentType: { type: String, enum: ["Movie", "Series"], required: true },
  },
  {
    timestamps: true,
  }
);

WatchlistSchema.index({ userId: 1, contentId: 1 }, { unique: true });

export default mongoose.models.Watchlist || mongoose.model("Watchlist", WatchlistSchema);
