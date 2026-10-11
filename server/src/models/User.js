import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    displayName: {
      type: String,
      trim: true,
      default: '',
    },
    avatarColor: {
      type: String,
      default: '#3B82F6', // Tailwind blue-500
    },
    avatarShape: {
      type: String,
      enum: ['circle', 'avatar1', 'avatar2', 'avatar3', 'robot', 'pixel'],
      default: 'circle',
    },
    statusMessage: {
      type: String,
      default: 'Available',
      maxlength: 80,
    },
    lastPosition: {
      officeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Office' },
      x: { type: Number, default: 200 },
      y: { type: Number, default: 200 },
      updatedAt: { type: Date, default: Date.now },
    },
    // GeoJSON Point location for spatial user queries ($near / $geoWithin)
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [x, y]
        default: [200, 200],
      },
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// 2dsphere index for MongoDB $near & $geoWithin proximity queries
UserSchema.index({ location: '2dsphere' });
UserSchema.index({ 'lastPosition.officeId': 1 });

// Password hashing middleware
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    if (!this.displayName) {
      this.displayName = this.username;
    }
    // Synchronize GeoJSON coordinates with lastPosition
    if (this.lastPosition) {
      this.location = {
        type: 'Point',
        coordinates: [this.lastPosition.x, this.lastPosition.y],
      };
    }
    next();
  } catch (err) {
    next(err);
  }
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.toSafeJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const User = mongoose.model('User', UserSchema);
