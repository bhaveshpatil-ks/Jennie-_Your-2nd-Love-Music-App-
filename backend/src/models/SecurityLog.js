import mongoose from 'mongoose';

const SecurityLogSchema = new mongoose.Schema(
  {
    ip_address: {
      type: String,
      required: true,
      index: true,
    },
    attempted_email: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    action: {
      type: String,
      enum: ['blocked', 'failed_login', 'success', 'signup_blocked_coppa', 'signup_success'],
      required: true,
      index: true,
    },
    details: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const SecurityLog = mongoose.models.SecurityLog || mongoose.model('SecurityLog', SecurityLogSchema);
