import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IProfile extends Document {
  profileId: string;
  userId: string;
  name: string;
  avatarId: string;
  isKids: boolean;
  isDefault: boolean;
  color: string;
  pin?: string; // Hashed PIN for adult profiles
  pinEnabled: boolean;
  pinAttempts: number;
  pinLockedUntil?: Date | null;
  maturityRating: 'G' | 'PG' | 'PG-13' | 'R' | 'TV-MA';
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema<IProfile>(
  {
    profileId: { type: String, required: true, unique: true },
    userId:    { type: String, required: true, index: true },
    name:      { type: String, required: true, trim: true, minlength: 2, maxlength: 20 },
    avatarId:  { type: String, required: true },
    isKids:    { type: Boolean, default: false },
    isDefault: { type: Boolean, default: false },
    color:     { type: String, default: '#E50914' },
    pin:       { type: String, default: null },
    pinEnabled:    { type: Boolean, default: false },
    pinAttempts:   { type: Number, default: 0 },
    pinLockedUntil:{ type: Date, default: null },
    maturityRating: { 
      type: String, 
      enum: ['G', 'PG', 'PG-13', 'R', 'TV-MA'],
      default: 'TV-MA' 
    },
    language: { 
      type: String, 
      default: 'en-US' 
    },
  },
  { timestamps: true }
);

// Unique name per user
ProfileSchema.index({ userId: 1, name: 1 }, { unique: true });

// Pre-save hook to hash PIN (Mongoose 7+ async style — no next() callback)
ProfileSchema.pre('save', async function() {
  // Only hash the PIN if it has been modified (or is new)
  if (!this.isModified('pin') || !this.pin) {
    return;
  }

  // Hash PIN with bcrypt
  const salt = await bcrypt.genSalt(12);
  this.pin = await bcrypt.hash(this.pin, salt);
});

// Pre-update hook to hash PIN if modified
ProfileSchema.pre(['findOneAndUpdate', 'updateOne'], async function() {
  const update = this.getUpdate() as any;
  
  // Check if PIN is being updated
  if (update.pin && typeof update.pin === 'string' && update.pin.length === 4) {
    const salt = await bcrypt.genSalt(12);
    update.pin = await bcrypt.hash(update.pin, salt);
  }
});

// Drop the old model if exists to allow schema change in dev
if (mongoose.models.Profile) {
  delete mongoose.models.Profile;
}

const Profile: Model<IProfile> = mongoose.model<IProfile>('Profile', ProfileSchema);

export default Profile;
