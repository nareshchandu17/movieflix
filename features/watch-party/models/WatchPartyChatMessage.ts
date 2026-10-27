import mongoose from "mongoose";

const WatchPartyChatMessageSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true },
    id: { type: String, required: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    avatarUrl: { type: String, default: "" },
    message: { type: String, required: true, maxlength: 2000 },
    timestamp: { type: Date, required: true, default: Date.now },
    type: { type: String, enum: ["text", "system"], default: "text" },
  },
  { timestamps: false }
);

WatchPartyChatMessageSchema.index({ roomId: 1, id: 1 }, { unique: true });
WatchPartyChatMessageSchema.index({ roomId: 1, timestamp: -1, id: -1 });

const WatchPartyChatMessage =
  mongoose.models.WatchPartyChatMessage ||
  mongoose.model("WatchPartyChatMessage", WatchPartyChatMessageSchema);

export default WatchPartyChatMessage;
