import mongoose from 'mongoose';

const TrackCatalogSchema = new mongoose.Schema(
  {
    videoId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      index: true,
    },
    artist: {
      type: String,
      required: true,
      index: true,
    },
    album: {
      type: String,
      default: '',
    },
    duration: {
      type: Number,
      default: 180,
    },
    genreTags: {
      type: [String],
      default: [],
      index: true,
    },
    moodTags: {
      type: [String],
      default: [],
    },
    language: {
      type: String,
      default: 'Unknown',
    },
    thumbnail: {
      type: String,
      default: '',
    },
    publishDate: {
      type: Date,
      default: null,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    audioFeatures: {
      tempo: { type: Number, default: 100 },
      energy: { type: Number, default: 0.5 },
      valence: { type: Number, default: 0.5 },
      danceability: { type: Number, default: 0.5 },
      acousticness: { type: Number, default: 0.5 },
    },
    coPlayed: {
      type: [String],
      default: [],
    },
    qualityScore: {
      type: Number,
      default: 75,
    },
    source: {
      type: String,
      default: 'youtube',
    },
    discoveredVia: {
      type: String,
      enum: ['search.list', 'playlistItems.list', 'seed', 'manual'],
      default: 'seed',
    },
    lastEnrichedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for ultra-fast candidate scoring in Layer 3
TrackCatalogSchema.index({ genreTags: 1, qualityScore: -1 });
TrackCatalogSchema.index({ artist: 1, qualityScore: -1 });

export const TrackCatalog =
  mongoose.models.TrackCatalog || mongoose.model('TrackCatalog', TrackCatalogSchema);
