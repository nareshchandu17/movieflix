import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReactionClipBase {
  userId: mongoose.Types.ObjectId;
  movieId: string;
  videoUrl: string;
  thumbnailUrl: string;
  movieTimestamp: number;
  moodEmoji: string;
  showInFeed: boolean;
  showInMoviePage: boolean;
  likesCount: number;
  sharesCount: number;
  viewsCount: number;
  duration: number;
  caption?: string;
  status: "pending" | "approved" | "rejected";
}

export interface IReactionClip extends IReactionClipBase, Document {
  createdAt: Date;
  updatedAt: Date;
}

const ReactionClipSchema = new Schema<IReactionClipBase>(
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
    showInFeed: {
      type: Boolean,
      default: false,
      index: true,
    },
    showInMoviePage: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
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
    viewsCount: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      required: true,
    },
    caption: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for scalability
ReactionClipSchema.index({ movieId: 1, showInMoviePage: 1, createdAt: -1 });
ReactionClipSchema.index({ showInFeed: 1, createdAt: -1 });
ReactionClipSchema.index({ userId: 1, createdAt: -1 });

// Ensure any cached model is replaced in development
if (process.env.NODE_ENV === "development" && mongoose.models.ReactionClip) {
  delete mongoose.models.ReactionClip;
}

const ReactionClip: Model<IReactionClip> =
  mongoose.models.ReactionClip || mongoose.model<IReactionClip>("ReactionClip", ReactionClipSchema);

export default ReactionClip;
