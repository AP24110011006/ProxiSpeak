import mongoose from 'mongoose';

const RoomSchema = new mongoose.Schema(
  {
    officeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Office',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    bounds: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      width: { type: Number, required: true },
      height: { type: Number, required: true },
    },
    capacity: {
      type: Number,
      default: 10,
    },
    soundIsolation: {
      type: Number,
      default: 0.9, // 0 = open floor, 1 = completely soundproof booth
    },
  },
  {
    timestamps: true,
  }
);

export const Room = mongoose.model('Room', RoomSchema);
