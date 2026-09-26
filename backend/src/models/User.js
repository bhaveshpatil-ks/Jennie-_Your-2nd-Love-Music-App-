import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    date_of_birth_encrypted: {
      type: String,
      required: true,
      // AES-256-GCM encrypted string, never sent to client
    },
    age_bracket: {
      type: String,
      enum: ['under13', '13-15', '16-17', '18+'],
      required: true,
    },
    is_minor: {
      type: Boolean,
      required: true,
      default: false,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say', null],
      default: null,
    },
    email_verified: {
      type: Boolean,
      default: false,
    },
    dpdp_consent: {
      accepted: { type: Boolean, default: false },
      accepted_at: { type: Date, default: null },
      version: { type: String, default: 'DPDP-2023-v1' },
      ip_address: { type: String, default: null },
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
