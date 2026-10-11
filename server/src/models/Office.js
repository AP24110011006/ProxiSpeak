import mongoose from 'mongoose';

const ObstacleSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: ['wall', 'desk', 'table', 'chair', 'plant', 'cooler', 'whiteboard', 'door'],
      required: true,
    },
    label: { type: String, default: '' },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    blocksMovement: { type: Boolean, default: true },
    soundDamping: { type: Number, default: 0.8 }, // 0.0 = transparent, 1.0 = soundproof
    color: { type: String, default: '#64748B' },
  },
  { _id: false }
);

const ZoneSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    color: { type: String, default: '#EEF2F6' },
    isQuietZone: { type: Boolean, default: false },
    soundIsolation: { type: Number, default: 0.5 },
  },
  { _id: false }
);

const OfficeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: 'Collaborative virtual office space',
    },
    width: {
      type: Number,
      default: 1600,
    },
    height: {
      type: Number,
      default: 1000,
    },
    theme: {
      type: String,
      enum: ['modern-wood', 'tech-slate', 'cozy-loft'],
      default: 'modern-wood',
    },
    spawnPoint: {
      x: { type: Number, default: 250 },
      y: { type: Number, default: 250 },
    },
    obstacles: [ObstacleSchema],
    zones: [ZoneSchema],
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [x, y]
        default: [0, 0],
      },
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

OfficeSchema.index({ location: '2dsphere' });

export const Office = mongoose.model('Office', OfficeSchema);
