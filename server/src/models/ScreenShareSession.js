import mongoose from 'mongoose';

/**
 * ScreenShareSession Schema
 * Tracks active corporate screen presentations in meeting rooms and focus zones.
 */
const screenShareSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    roomId: {
      type: String,
      required: true,
      index: true,
    },
    roomName: {
      type: String,
      default: 'Executive Glass Boardroom',
    },
    presenterId: {
      type: String,
      required: true,
      index: true,
    },
    presenterName: {
      type: String,
      required: true,
    },
    resolution: {
      type: String,
      enum: ['1080p', '720p', '480p'],
      default: '1080p',
    },
    maxBitrateKbps: {
      type: Number,
      default: 3500,
    },
    currentBitrateKbps: {
      type: Number,
      default: 3500,
    },
    hasAudio: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    viewers: [
      {
        userId: String,
        userName: String,
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    bandwidthLadder: [
      {
        timestamp: { type: Date, default: Date.now },
        resolution: String,
        bitrateKbps: Number,
        reason: String,
      },
    ],
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    totalDurationSeconds: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const ScreenShareSession =
  mongoose.models.ScreenShareSession ||
  mongoose.model('ScreenShareSession', screenShareSessionSchema);
