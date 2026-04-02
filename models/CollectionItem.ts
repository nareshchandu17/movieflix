import mongoose from "mongoose";

const CollectionItemSchema = new mongoose.Schema({
  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Collection",
    required: true,
    index: true
  },

  tmdbId: {
    type: Number,
    required: true
  },

  mediaType: {
    type: String,
    enum: ["movie", "series", "anime"],
    required: true
  },

  title: {
    type: String,
    required: true,
    trim: true
  },

  posterPath: {
    type: String,
    default: ""
  },

  backdropPath: {
    type: String,
    default: ""
  },

  overview: {
    type: String,
    default: ""
  },

  releaseDate: {
    type: String,
    default: ""
  },

  voteAverage: {
    type: Number,
    default: 0
  },

  genreIds: [{
    type: Number
  }],

  addedAt: {
    type: Date,
    default: Date.now
  },

  watched: {
    type: Boolean,
    default: false
  },

  watchProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },

  lastWatchedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compound indexes for better performance
CollectionItemSchema.index({ collectionId: 1, addedAt: -1 });
CollectionItemSchema.index({ collectionId: 1, tmdbId: 1 }, { unique: true });
CollectionItemSchema.index({ collectionId: 1, watched: 1, lastWatchedAt: -1 });

export default mongoose.models.CollectionItem || mongoose.model("CollectionItem", CollectionItemSchema);
