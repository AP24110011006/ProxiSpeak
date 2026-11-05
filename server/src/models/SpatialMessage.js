import mongoose from "mongoose";

const spatialMessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: String,
      required: true,
      index: true,
    },
    senderName: {
      type: String,
      required: true,
      trim: true,
    },
    senderAvatar: {
      type: String,
      default: "https://api.dicebear.com/7.x/bottts/svg?seed=avatar",
    },
    x: {
      type: Number,
      required: true,
    },
    y: {
      type: Number,
      required: true,
    },
    zone: {
      type: String,
      required: true,
      trim: true,
    },
    radius: {
      type: Number,
      default: 160, // Standard acoustic earshot radius in pixels
      min: 40,
      max: 600,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    isRoomLocked: {
      type: Boolean,
      default: false,
    },
    isBroadcast: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 600, // Ephemeral TTL: Automatically expires after 10 minutes (600s)
    },
  },
  {
    timestamps: true,
    collection: "spatial_messages",
  }
);

spatialMessageSchema.index({ x: 1, y: 1 });

export const SpatialMessage = mongoose.model("SpatialMessage", spatialMessageSchema);
