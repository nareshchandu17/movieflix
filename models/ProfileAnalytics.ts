import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProfileAnalytics extends Document {
  profileId: string;
  userId: string;
  totalWatchTime: number; // in minutes
  moviesWatched: number;
  seriesWatched: number;
  episodesWatched: number;
  averageSessionDuration: number; // in minutes
  mostWatchedGenre: string;
  mostWatchedTimeOfDay: string; // morning, afternoon, evening, night
  lastActiveAt: Date;
  weeklyWatchTime: number; // current week
  monthlyWatchTime: number; // current month
  favoriteActors: string[]; // top 5 most watched actors
  favoriteDirectors: string[]; // top 5 most watched directors
  contentPreferences: {
    genres: { [genre: string]: number }; // genre watch count
    ratings: { [rating: string]: number }; // rating preference count
    decades: { [decade: string]: number }; // decade preference
  };
  createdAt: Date;
  updatedAt: Date;
}

const ProfileAnalyticsSchema = new Schema<IProfileAnalytics>(
  {
    profileId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    totalWatchTime: { type: Number, default: 0 },
    moviesWatched: { type: Number, default: 0 },
    seriesWatched: { type: Number, default: 0 },
    episodesWatched: { type: Number, default: 0 },
    averageSessionDuration: { type: Number, default: 0 },
    mostWatchedGenre: { type: String, default: 'Action' },
    mostWatchedTimeOfDay: { type: String, default: 'evening' },
    lastActiveAt: { type: Date, default: Date.now },
    weeklyWatchTime: { type: Number, default: 0 },
    monthlyWatchTime: { type: Number, default: 0 },
    favoriteActors: [{ type: String }],
    favoriteDirectors: [{ type: String }],
    contentPreferences: {
      genres: { type: Map, of: String, default: new Map() },
      ratings: { type: Map, of: String, default: new Map() },
      decades: { type: Map, of: String, default: new Map() }
    },
  },
  { timestamps: true }
);

// Unique profile per user
ProfileAnalyticsSchema.index({ userId: 1, profileId: 1 }, { unique: true });

// Drop old model if exists to allow schema change in dev
if (mongoose.models.ProfileAnalytics) {
  delete mongoose.models.ProfileAnalytics;
}

const ProfileAnalytics: Model<IProfileAnalytics> = mongoose.model<IProfileAnalytics>('ProfileAnalytics', ProfileAnalyticsSchema);

export default ProfileAnalytics;
