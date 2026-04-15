import mongoose, { Schema, Document } from 'mongoose';

// User Preferences Interface
export interface IUserPreferences extends Document {
  userId: mongoose.Types.ObjectId;
  profileId: mongoose.Types.ObjectId;
  watchlist: Array<{
    contentId: string;
    contentType: 'movie' | 'series' | 'episode';
    addedAt: Date;
    metadata?: {
      title?: string;
      poster?: string;
      overview?: string;
    };
  }>;
  watchHistory: Array<{
    contentId: string;
    contentType: 'movie' | 'series' | 'episode';
    watchedAt: Date;
    duration: number; // in seconds
    progress: number; // percentage 0-100
    metadata?: {
      title?: string;
      season?: number;
      episode?: number;
      seriesId?: string;
    };
  }>;
  episodeProgress: Array<{
    seriesId: string;
    seasonNumber: number;
    episodeId: string;
    progress: number; // percentage 0-100
    lastWatchedAt: Date;
    duration: number; // watched duration in seconds
  }>;
  settings: {
    autoplay: boolean;
    subtitles: boolean;
    subtitleLanguage: string;
    audioLanguage: string;
    videoQuality: 'auto' | 'low' | 'medium' | 'high';
  };
  createdAt: Date;
  updatedAt: Date;
}

// User Preferences Schema
const UserPreferencesSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  profileId: {
    type: Schema.Types.ObjectId,
    ref: 'Profile',
    required: true,
    index: true
  },
  watchlist: [{
    contentId: {
      type: String,
      required: true
    },
    contentType: {
      type: String,
      enum: ['movie', 'series', 'episode'],
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    metadata: {
      title: String,
      poster: String,
      overview: String
    }
  }],
  watchHistory: [{
    contentId: {
      type: String,
      required: true
    },
    contentType: {
      type: String,
      enum: ['movie', 'series', 'episode'],
      required: true
    },
    watchedAt: {
      type: Date,
      default: Date.now
    },
    duration: {
      type: Number,
      default: 0
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    metadata: {
      title: String,
      season: Number,
      episode: Number,
      seriesId: String
    }
  }],
  episodeProgress: [{
    seriesId: {
      type: String,
      required: true
    },
    seasonNumber: {
      type: Number,
      required: true
    },
    episodeId: {
      type: String,
      required: true
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    lastWatchedAt: {
      type: Date,
      default: Date.now
    },
    duration: {
      type: Number,
      default: 0
    }
  }],
  settings: {
    autoplay: {
      type: Boolean,
      default: true
    },
    subtitles: {
      type: Boolean,
      default: false
    },
    subtitleLanguage: {
      type: String,
      default: 'en'
    },
    audioLanguage: {
      type: String,
      default: 'en'
    },
    videoQuality: {
      type: String,
      enum: ['auto', 'low', 'medium', 'high'],
      default: 'auto'
    }
  },
}, {
  timestamps: true
});

// Compound indexes for better performance
UserPreferencesSchema.index({ userId: 1, profileId: 1 }, { unique: true });
UserPreferencesSchema.index({ 'watchlist.contentId': 1 });
UserPreferencesSchema.index({ 'watchHistory.watchedAt': -1 });
UserPreferencesSchema.index({ 'episodeProgress.seriesId': 1, 'episodeProgress.seasonNumber': 1, 'episodeProgress.episodeId': 1 }, { unique: true });

export const UserPreferences = mongoose.models.UserPreferences || mongoose.model<IUserPreferences>('UserPreferences', UserPreferencesSchema);
