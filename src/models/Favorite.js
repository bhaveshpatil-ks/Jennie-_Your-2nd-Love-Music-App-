import mongoose from 'mongoose';

const FavoriteSchema = new mongoose.Schema(
  {
    trackId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    track: {
      type: Object,
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Favorite = mongoose.models.Favorite || mongoose.model('Favorite', FavoriteSchema);
