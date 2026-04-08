import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProfile extends Document {
  profileId: string;
  userId: string;
  name: string;
  avatarId: string;
  isKids: boolean;
  isDefault: boolean;
  color: string;
  pin?: string; // 4-digit PIN for adult profiles
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

// Drop the old model if exists to allow schema change in dev
if (mongoose.models.Profile) {
  delete mongoose.models.Profile;
}

const Profile: Model<IProfile> = mongoose.model<IProfile>('Profile', ProfileSchema);

export default Profile;
