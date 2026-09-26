import mongoose from 'mongoose';

const QuotaTrackerSchema = new mongoose.Schema(
  {
    date: {
      type: String, // YYYY-MM-DD format (UTC)
      required: true,
      unique: true,
      index: true,
    },
    totalBudget: {
      type: Number,
      default: 10000,
    },
    searchListUnits: {
      type: Number,
      default: 0,
    },
    videosListUnits: {
      type: Number,
      default: 0,
    },
    playlistItemsListUnits: {
      type: Number,
      default: 0,
    },
    totalUnitsUsed: {
      type: Number,
      default: 0,
    },
    circuitBreakerTripped: {
      type: Boolean,
      default: false,
    },
    history: [
      {
        timestamp: { type: Date, default: Date.now },
        endpoint: String,
        cost: Number,
        callerLayer: Number, // 1 (Discovery), 2 (Enrichment), 3 (FORBIDDEN)
        remaining: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const QuotaTracker =
  mongoose.models.QuotaTracker || mongoose.model('QuotaTracker', QuotaTrackerSchema);
