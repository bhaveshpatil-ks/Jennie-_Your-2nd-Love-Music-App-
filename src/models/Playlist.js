import mongoose from 'mongoose';

const PlaylistSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    coverUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    },
    trackIds: {
      type: [String],
      default: [],
    },
    tracks: {
      type: [Object],
      default: [],
    },
    createdAt: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
  },
  {
    timestamps: true,
  }
);

export const Playlist = mongoose.models.Playlist || mongoose.model('Playlist', PlaylistSchema);
