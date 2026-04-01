import mongoose, { Schema, Document } from "mongoose";

export interface IAction extends Document<mongoose.Types.ObjectId> {
  title: string;
  poster_path?: string;
  backdrop_path?: string;
  overview?: string;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: "movie" | "tv";
  id?: number;
  name?: string;
  [key: string]: unknown; // Allow other TMDB fields
}

const ActionSchema: Schema<IAction> = new Schema(
  {
    title: String,
    poster_path: String,
    backdrop_path: String,
    overview: String,
    vote_average: Number,
    release_date: String,
    first_air_date: String,
    media_type: {
      type: String,
      enum: ["movie", "tv"],
    },
    id: Number,
    name: String,
  },
  {
    strict: false, // Allow any fields from TMDB
    timestamps: true,
  }
);

export const Action =
  mongoose.models.Action || mongoose.model<IAction>("Action", ActionSchema);
