import mongoose from "mongoose";

const CollectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
    index: true
  },

  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 60
  },

  icon: {
    type: String,
    default: "🎬"
  },

  description: {
    type: String,
    maxlength: 200,
    default: ""
  },

  color: {
    type: String,
    enum: ["blue", "red", "green", "purple", "yellow", "pink", "amber", "gray"],
    default: "blue"
  },

  isDefault: {
    type: Boolean,
    default: false
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
CollectionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Collection || mongoose.model("Collection", CollectionSchema);
