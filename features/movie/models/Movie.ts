import mongoose from "mongoose";

// Movie model for local caching of frequently accessed movies
// This model is used to cache TMDB movie data for faster access and reduced API calls
const MovieSchema = new mongoose.Schema(
  {
    tmdbId: { type: Number, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    year: { type: Number },
    genres: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    actors: { type: [String], default: [] },
    director: { type: String },
    posterUrl: { type: String },
    backdropUrl: { type: String },
    videoUrl: { type: String },
    certification: { 
      type: String, 
      enum: ['G', 'PG', 'PG-13', 'R', 'TV-MA'],
      default: 'G' 
    },
    duration: { type: Number }, // in minutes
    originalLanguage: { type: String, default: 'en' },
    voteAverage: { type: Number },
    voteCount: { type: Number },
    popularity: { type: Number },
    releaseDate: { type: Date },
    // Cache metadata
    lastUpdated: { type: Date, default: Date.now },
    // TTL for cache - 24 hours default
    expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) },
  },
  {
    timestamps: true,
  }
);

// Index for efficient cache lookups and cleanup
MovieSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // MongoDB TTL index for auto-cleanup

// Ensure any cached model is replaced in development
if (process.env.NODE_ENV === "development" && mongoose.models.Movie) {
  delete mongoose.models.Movie;
}

export default mongoose.models.Movie || mongoose.model("Movie", MovieSchema);
