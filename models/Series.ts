import mongoose from "mongoose";

const SeriesSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    year: { type: Number },
    genres: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    actors: { type: [String], default: [] },
    director: { type: String },
    posterUrl: { type: String },
    seasons: [
      {
        seasonNumber: { type: Number, required: true },
        episodes: [
          {
            episodeNumber: { type: Number, required: true },
            title: { type: String, required: true },
            videoUrl: { type: String },
            duration: { type: Number },
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Series || mongoose.model("Series", SeriesSchema);
