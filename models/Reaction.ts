import mongoose, { Schema, Document } from 'mongoose';

export interface IReaction extends Document {
  userId: string;
  movieId: number;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  caption?: string;
  likes: number;
  views: number;
  createdAt: Date;
}

const ReactionSchema: Schema = new Schema({
  userId: { type: String, required: true },
  movieId: { type: Number, required: true, index: true },
  videoUrl: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  duration: { type: Number, required: true },
  caption: { type: String },
  likes: { type: Number, default: 0, index: true },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now, index: true },
});

export const Reaction = mongoose.models.Reaction || mongoose.model<IReaction>('Reaction', ReactionSchema);
