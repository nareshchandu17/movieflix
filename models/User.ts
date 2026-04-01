import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      required: false,
      unique: true,
      index: true,
      sparse: true,
    },
    name: {
      type: String,
      required: false, // phone-based login might not have a name initially
    },
    username: {
      type: String,
      required: false,
      unique: true,
      index: true,
      sparse: true,
    },
    email: {
      type: String,
      required: false,
      unique: true,
      index: true,
      sparse: true, // Allow multiple users to have no email
    },
    phone: {
      type: String,
      unique: true,
      index: true,
      sparse: true, // Allow users to have only an email
    },
    dob: {
      type: String, // YYYY-MM-DD
      required: false,
    },
    language: {
      type: String, // e.g. "English", "Telugu"
      required: false,
    },
    password: {
      type: String,
      default: null, // null for OAuth users
    },
    avatar: {
      type: String,
      default: null,
    },
    interests: {
      type: [String],
      default: [],
    },
    moods: {
      type: [String],
      default: [],
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    preferences: {
      genres: {
        type: [String],
        default: [],
      },
    },
    profilesLimit: {
      type: Number,
      default: 5,
      min: 1,
      max: 10
    },
  },
  {
    timestamps: true,
  }
);

// Ensure the model is only created once
const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
