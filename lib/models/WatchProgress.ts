import mongoose, { Schema, Document } from "mongoose";

export interface IWatchProgress extends Document {
  userId: string;
  mediaId: number;
  mediaType: "movie" | "tv";
  title: string;
  backdropPath?: string;
  posterPath?: string;
  timeWatched: number; // in seconds
  totalDuration: number; // in seconds
  lastWatchedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WatchProgressSchema: Schema<IWatchProgress> = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    mediaId: {
      type: Number,
      required: true,
    },
    mediaType: {
      type: String,
      enum: ["movie", "tv"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    backdropPath: String,
    posterPath: String,
    timeWatched: {
      type: Number,
      default: 0,
    },
    totalDuration: {
      type: Number,
      required: true,
    },
    lastWatchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for faster queries
WatchProgressSchema.index({ userId: 1, mediaId: 1, mediaType: 1 });

export const WatchProgress =
  mongoose.models.WatchProgress ||
  mongoose.model<IWatchProgress>("WatchProgress", WatchProgressSchema);
