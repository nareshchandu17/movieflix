import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReactionClip extends Document {
  userId: mongoose.Types.ObjectId;
  movieId: string;
  videoUrl: string;
  thumbnailUrl: string;
  movieTimestamp: number;
  moodEmoji: string;
  visibility: "public" | "private";
  likesCount: number;
  sharesCount: number;
  duration: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReactionClipSchema = new Schema<IReactionClip>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    movieId: {
      type: String, // Supporting both local ObjectId and TMDB ID
      required: true,
      index: true,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      required: true,
    },
    movieTimestamp: {
      type: Number, // in seconds
      required: true,
    },
    moodEmoji: {
      type: String,
      required: true,
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
      index: true,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    sharesCount: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for scalability
ReactionClipSchema.index({ movieId: 1, visibility: 1, createdAt: -1 });
ReactionClipSchema.index({ userId: 1, createdAt: -1 });

// Ensure any cached model is replaced in development
if (process.env.NODE_ENV === "development" && mongoose.models.ReactionClip) {
  delete mongoose.models.ReactionClip;
}

const ReactionClip: Model<IReactionClip> =
  mongoose.models.ReactionClip || mongoose.model<IReactionClip>("ReactionClip", ReactionClipSchema);

export default ReactionClip;
