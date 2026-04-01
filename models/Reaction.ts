import mongoose, { Schema, Document } from 'mongoose';

export interface IReaction extends Document {
  userId: string;
  movieId: string;
  timestamp: number;
  videoUrl: string;
  visibility: 'public' | 'private';
  duration: number;
  likes: number;
  comments: string[];
  createdAt: Date;
}

const ReactionSchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  movieId: { type: String, required: true, index: true },
  timestamp: { type: Number, required: true },
  videoUrl: { type: String, required: true },
  visibility: { type: String, enum: ['public', 'private'], default: 'public' },
  duration: { type: Number, required: true },
  likes: { type: Number, default: 0 },
  comments: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
});

export const Reaction = mongoose.models.Reaction || mongoose.model<IReaction>('Reaction', ReactionSchema);
