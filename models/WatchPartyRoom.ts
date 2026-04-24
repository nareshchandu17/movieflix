import mongoose from "mongoose";

const ParticipantSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String },
  socketId: { type: String },
  joinedAt: { type: Date, default: Date.now },
  isHost: { type: Boolean, default: false },
  isMuted: { type: Boolean, default: false },
  isVideoOff: { type: Boolean, default: false }
}, { _id: false });

const WatchPartyRoomSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hostName: {
      type: String,
    },
    movieId: {
      type: String,
      required: true,
    },
    participants: [ParticipantSchema],
    chatHistory: [
      {
        id: String,
        userId: String,
        userName: String,
        message: String,
        timestamp: { type: Date, default: Date.now },
        type: { type: String, default: "text" },
      },
    ],
    isPrivate: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      default: "",
    },
    maxParticipants: {
      type: Number,
      default: 10,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    currentPlayState: {
      type: String,
      enum: ["playing", "paused"],
      default: "paused",
    },
    currentTime: {
      type: Number,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const WatchPartyRoom = mongoose.models.WatchPartyRoom || mongoose.model("WatchPartyRoom", WatchPartyRoomSchema);
export default WatchPartyRoom;
