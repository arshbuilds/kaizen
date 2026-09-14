import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type GoalStatus = "active" | "paused" | "completed" | "archived";
export type MilestoneStatus = "pending" | "in_progress" | "completed";

export interface IMilestone {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  status: MilestoneStatus;
  order: number;
  createdAt: Date;
}

export interface IGoal extends Document {
  _id: Types.ObjectId;
  userId: string; // Clerk User ID
  title: string;
  whyItMatters: string;
  status: GoalStatus;
  targetWeeks: number;
  targetDate?: Date;
  totalEstimatedMinutes: number;
  totalCompletedMinutes: number;
  milestones: IMilestone[];
  createdAt: Date;
  updatedAt: Date;
}

const MilestoneSchema = new Schema<IMilestone>(
  {
    title: {
      type: String,
      required: [true, "Milestone title is required"],
      trim: true,
      maxlength: [150, "Milestone title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "pending",
    },
    order: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  { _id: true }
);

const GoalSchema = new Schema<IGoal>(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Goal title is required"],
      trim: true,
      minlength: [2, "Goal title must be at least 2 characters"],
      maxlength: [200, "Goal title cannot exceed 200 characters"],
    },
    whyItMatters: {
      type: String,
      required: [true, "Why this matters is required"],
      trim: true,
      minlength: [3, "Please provide at least a short reason why this matters"],
      maxlength: [1000, "Why this matters cannot exceed 1000 characters"],
    },
    status: {
      type: String,
      enum: ["active", "paused", "completed", "archived"],
      default: "active",
      index: true,
    },
    targetWeeks: {
      type: Number,
      default: 12,
      min: [1, "Target weeks must be at least 1"],
      max: [104, "Target weeks cannot exceed 104 (2 years)"],
    },
    targetDate: {
      type: Date,
    },
    totalEstimatedMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalCompletedMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    milestones: {
      type: [MilestoneSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying a user's goals by status in chronological order
GoalSchema.index({ userId: 1, status: 1, createdAt: -1 });

export const Goal: Model<IGoal> =
  mongoose.models.Goal || mongoose.model<IGoal>("Goal", GoalSchema);
