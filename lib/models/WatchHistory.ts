/**
 * @file WatchHistory.ts
 * @description Core utility services, backend API clients, or database connectors for MovieFlix services.
 * Provides enterprise-grade reliability, streaming controls, and robust type safety.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import mongoose from "mongoose";

export interface IWatchHistory extends mongoose.Document {
  profileId: mongoose.Types.ObjectId;
  contentId: string;
  contentType: "movie" | "series" | "episode";
  progress: number;
  duration: number;
  completed: boolean;
  lastWatchedAt: Date;
  watchTime: number;
  sessionId?: string;
  deviceId: string;
  device: "web" | "mobile" | "tv" | "tablet";
  quality: "auto" | "360p" | "480p" | "720p" | "1080p" | "4k";
  updateProgress(progress: number, watchTime?: number): Promise<IWatchHistory>;
}

export interface IWatchHistoryModel extends mongoose.Model<IWatchHistory> {
  getContinueWatching(profileId: string, limit?: number): Promise<IWatchHistory[]>;
  getWatchHistory(profileId: string, limit?: number): Promise<IWatchHistory[]>;
}

const WatchHistorySchema = new mongoose.Schema<IWatchHistory, IWatchHistoryModel>({
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
    required: true,
    index: true
  },
  contentId: {
    type: String,
    required: true,
    index: true
  },
  contentType: {
    type: String,
    enum: ["movie", "series", "episode"],
    default: "movie"
  },
  progress: {
    type: Number, // seconds
    default: 0,
    min: 0
  },
  duration: {
    type: Number, // total seconds
    required: true,
    min: 1
  },
  completed: {
    type: Boolean,
    default: false
  },
  lastWatchedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  watchTime: {
    type: Number, // total time watched in seconds
    default: 0
  },
  sessionId: {
    type: String, // for tracking individual viewing sessions
    required: false
  },
  deviceId: {
    type: String,
    required: false,
    index: true
  },
  device: {
    type: String,
    enum: ["web", "mobile", "tv", "tablet"],
    default: "web"
  },
  quality: {
    type: String,
    enum: ["auto", "360p", "480p", "720p", "1080p", "4k"],
    default: "auto"
  }
}, {
  timestamps: true
});

// Critical indexes for performance
WatchHistorySchema.index({ profileId: 1, contentId: 1 }, { unique: true });
WatchHistorySchema.index({ profileId: 1, lastWatchedAt: -1 });
WatchHistorySchema.index({ profileId: 1, completed: 1, lastWatchedAt: -1 });

// Pre-save middleware to update completion status
WatchHistorySchema.pre('save', async function(this: IWatchHistory) {
  if (this.duration > 0) {
    this.completed = this.progress >= this.duration * 0.9; // 90% rule
  }
});

// Static method to get continue watching for a profile
WatchHistorySchema.statics.getContinueWatching = function(profileId: string, limit: number = 20) {
  return this.find({
    profileId,
    completed: false,
    progress: { $gt: 0 } // Only show items with actual progress
  })
    .sort({ lastWatchedAt: -1 })
    .limit(limit)
    .populate('profileId', 'name avatar');
};

// Static method to get watch history for a profile
WatchHistorySchema.statics.getWatchHistory = function(profileId: string, limit: number = 50) {
  return this.find({ profileId })
    .sort({ lastWatchedAt: -1 })
    .limit(limit)
    .populate('profileId', 'name avatar');
};

// Instance method to update progress
WatchHistorySchema.methods.updateProgress = function(this: IWatchHistory, progress: number, watchTime: number = 0) {
  this.progress = progress;
  this.watchTime += watchTime;
  this.lastWatchedAt = new Date();
  
  if (this.duration > 0) {
    this.completed = progress >= this.duration * 0.9;
  }
  
  return this.save();
};

const WatchHistory: IWatchHistoryModel = (mongoose.models.WatchHistory as IWatchHistoryModel) || 
  mongoose.model<IWatchHistory, IWatchHistoryModel>("WatchHistory", WatchHistorySchema);

export default WatchHistory;
