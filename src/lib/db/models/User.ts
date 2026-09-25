import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  clerkId: string;
  email: string;
  name?: string;
  imageUrl?: string;
  timezone: string;
  dailyTargetMinutes: number;
  focusDurationMinutes: number;
  preferredWorkBlocks: string[];
  currentStreak: number;
  longestStreak: number;
  lastActiveDate?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
    timezone: {
      type: String,
      default: "UTC",
    },
    dailyTargetMinutes: {
      type: Number,
      default: 180,
      min: 15,
      max: 960,
    },
    focusDurationMinutes: {
      type: Number,
      default: 45,
      min: 10,
      max: 180,
    },
    preferredWorkBlocks: {
      type: [String],
      default: ["morning", "afternoon"],
    },
    currentStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastActiveDate: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
