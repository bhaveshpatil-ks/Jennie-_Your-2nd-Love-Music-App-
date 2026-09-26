import mongoose from 'mongoose';

const MissedQuerySchema = new mongoose.Schema(
  {
    query: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    count: {
      type: Number,
      default: 1,
      index: true,
    },
    lastRequestedAt: {
      type: Date,
      default: Date.now,
    },
    processed: {
      type: Boolean,
      default: false,
      index: true,
    },
    resolvedVideoId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index to quickly fetch top unfulfilled user requests for daily Layer 1 batch
MissedQuerySchema.index({ processed: 1, count: -1 });

export const MissedQuery =
  mongoose.models.MissedQuery || mongoose.model('MissedQuery', MissedQuerySchema);
