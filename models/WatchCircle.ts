import mongoose from 'mongoose';

// Watch Circle Model - Small groups of 2-6 people
const WatchCircleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Watch Party Model - Individual watch sessions
const WatchPartySchema = new mongoose.Schema({
  circleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WatchCircle',
    required: true
  },
  movieId: {
    type: String,
    required: true
  },
  movieTitle: {
    type: String,
    required: true
  },
  moviePoster: {
    type: String,
    required: true
  },
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    watchDuration: {
      type: Number,
      default: 0 // minutes watched
    },
    completed: {
      type: Boolean,
      default: false
    }
  }],
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  roomCode: {
    type: String,
    unique: true,
    required: true
  }
}, {
  timestamps: true
});

// Streak Model - Track group viewing consistency
const CircleStreakSchema = new mongoose.Schema({
  circleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WatchCircle',
    required: true,
    unique: true
  },
  currentStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  longestStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  lastWatchDate: {
    type: Date,
    default: null
  },
  weeklyWatchCount: {
    type: Number,
    default: 0
  },
  totalWatchSessions: {
    type: Number,
    default: 0
  },
  nextScheduledWatch: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Watch Session Model - Individual user watch activity
const WatchSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  circleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WatchCircle',
    required: true
  },
  watchPartyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WatchParty',
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 0 // minutes
  },
  completed: {
    type: Boolean,
    default: false
  },
  watchDate: {
    type: Date,
    default: Date.now
  },
  reactions: [{
    type: {
      type: String,
      enum: ['like', 'love', 'laugh', 'surprised', 'sad', 'angry']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    movieTimestamp: {
      type: Number // seconds into movie
    }
  }]
}, {
  timestamps: true
});

// Indexes for performance
WatchCircleSchema.index({ 'members.userId': 1 });
WatchCircleSchema.index({ createdBy: 1 });
WatchPartySchema.index({ circleId: 1, status: 1 });
WatchPartySchema.index({ roomCode: 1 });
CircleStreakSchema.index({ circleId: 1 });
WatchSessionSchema.index({ userId: 1, watchDate: -1 });
WatchSessionSchema.index({ circleId: 1, watchDate: -1 });

export const WatchCircle = mongoose.models.WatchCircle || mongoose.model('WatchCircle', WatchCircleSchema);
export const WatchParty = mongoose.models.WatchParty || mongoose.model('WatchParty', WatchPartySchema);
export const CircleStreak = mongoose.models.CircleStreak || mongoose.model('CircleStreak', CircleStreakSchema);
export const WatchSession = mongoose.models.WatchSession || mongoose.model('WatchSession', WatchSessionSchema);
