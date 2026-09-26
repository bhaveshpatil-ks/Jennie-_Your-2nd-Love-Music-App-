import mongoose from 'mongoose';

const RateLimitSchema = new mongoose.Schema(
  {
    ip_address: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    attempt_count: {
      type: Number,
      default: 0,
    },
    first_attempt_at: {
      type: Date,
      default: Date.now,
    },
    blocked_until: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// TTL index to automatically purge expired records after 15 minutes
RateLimitSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 900 });

export const RateLimit = mongoose.models.RateLimit || mongoose.model('RateLimit', RateLimitSchema);
