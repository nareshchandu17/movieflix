import mongoose from "mongoose";

const MovieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    year: { type: Number },
    genres: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    actors: { type: [String], default: [] },
    director: { type: String },
    posterUrl: { type: String },
    videoUrl: { type: String },
    certification: { 
      type: String, 
      enum: ['G', 'PG', 'PG-13', 'R', 'TV-MA'],
      default: 'G' 
    },
    duration: { type: Number }, // in minutes
    tmdbId: { type: Number, index: true },
    originalLanguage: { type: String, default: 'en' },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Movie || mongoose.model("Movie", MovieSchema);
