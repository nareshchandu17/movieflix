import mongoose from 'mongoose';

interface IWatchPartyRoom {
  roomId: string;
  name: string;
  hostId: mongoose.Types.ObjectId;
  hostName: string;
  movieId?: string;
  participants: IParticipant[];
  isPrivate: boolean;
  password?: string;
  maxParticipants: number;
  isActive: boolean;
  currentPlayState: 'playing' | 'paused' | 'stopped';
  currentTime: number;
  chatHistory: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

interface IParticipant {
  userId: string;
  userName: string;
  socketId: string;
  joinedAt: Date;
  isHost: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
}

interface IChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'system' | 'emoji';
}

const WatchPartyRoomSchema = new mongoose.Schema<IWatchPartyRoom>({
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hostName: {
    type: String,
    required: true
  },
  movieId: {
    type: String,
    required: false
  },
  participants: [{
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    socketId: { type: String, required: true },
    joinedAt: { type: Date, default: Date.now },
    isHost: { type: Boolean, default: false },
    isMuted: { type: Boolean, default: false },
    isVideoOff: { type: Boolean, default: false }
  }],
  isPrivate: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    required: false
  },
  maxParticipants: {
    type: Number,
    default: 10,
    min: 2,
    max: 50
  },
  isActive: {
    type: Boolean,
    default: true
  },
  currentPlayState: {
    type: String,
    enum: ['playing', 'paused', 'stopped'],
    default: 'paused'
  },
  currentTime: {
    type: Number,
    default: 0
  },
  chatHistory: [{
    id: { type: String, required: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    type: { type: String, enum: ['text', 'system', 'emoji'], default: 'text' }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better performance
WatchPartyRoomSchema.index({ roomId: 1 });
WatchPartyRoomSchema.index({ hostId: 1 });
WatchPartyRoomSchema.index({ isActive: 1 });
WatchPartyRoomSchema.index({ createdAt: -1 });

export default mongoose.models.WatchPartyRoom || mongoose.model('WatchPartyRoom', WatchPartyRoomSchema);
