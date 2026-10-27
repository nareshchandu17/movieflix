import mongoose from "mongoose";

const WatchPartyMessageRateLimitSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true },
    userId: { type: String, required: true },
    windowStart: { type: Date, required: true },
    count: { type: Number, required: true, default: 0 },
  },
  { timestamps: false }
);

WatchPartyMessageRateLimitSchema.index(
  { roomId: 1, userId: 1, windowStart: 1 },
  { unique: true }
);
WatchPartyMessageRateLimitSchema.index(
  { windowStart: 1 },
  { expireAfterSeconds: 3600 }
);

const WatchPartyMessageRateLimit =
  mongoose.models.WatchPartyMessageRateLimit ||
  mongoose.model("WatchPartyMessageRateLimit", WatchPartyMessageRateLimitSchema);

export default WatchPartyMessageRateLimit;
