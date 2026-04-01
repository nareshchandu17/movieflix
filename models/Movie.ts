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
    duration: { type: Number }, // in minutes
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Movie || mongoose.model("Movie", MovieSchema);
