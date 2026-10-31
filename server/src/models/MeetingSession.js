import mongoose from "mongoose";

const meetingSessionSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    roomName: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      default: "Confidential Acoustic Session",
      trim: true,
    },
    initiator: {
      type: String,
      default: "ProxiSpeak Colleague",
      trim: true,
    },
    participants: {
      type: [String],
      default: [],
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: {
      type: Date,
    },
    durationSeconds: {
      type: Number,
      default: 0,
    },
    recordingUrl: {
      type: String,
      default: null,
    },
    fileSizeKb: {
      type: Number,
      default: 0,
    },
    isSoundproofLocked: {
      type: Boolean,
      default: true,
    },
    isolationFactor: {
      type: Number,
      default: 0.95,
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "completed",
    },
    notes: {
      type: String,
      default: "Week 3 Acoustic Meeting Archive. Preserved with 95% soundproof isolation.",
    },
  },
  {
    timestamps: true,
  }
);

meetingSessionSchema.index({ roomId: 1, createdAt: -1 });

export const MeetingSession =
  mongoose.models.MeetingSession ||
  mongoose.model("MeetingSession", meetingSessionSchema);
