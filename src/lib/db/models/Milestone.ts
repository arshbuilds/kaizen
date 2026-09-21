import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type MilestoneRoadmapStatus =
  | "locked"
  | "unlocked"
  | "in_progress"
  | "completed";

export interface IMilestoneDocument extends Document {
  _id: Types.ObjectId;
  outcomeId: Types.ObjectId; // Parent Outcome reference
  goalId: Types.ObjectId;    // Root Goal reference
  userId: string;            // Clerk User ID for tenant isolation
  title: string;             // Sequential checkpoint name
  description?: string;      // Milestone success criteria
  order: number;             // Sequence order within outcome
  status: MilestoneRoadmapStatus;
  createdAt: Date;
  updatedAt: Date;
}

const StandaloneMilestoneSchema = new Schema<IMilestoneDocument>(
  {
    outcomeId: {
      type: Schema.Types.ObjectId,
      ref: "Outcome",
      required: [true, "Outcome ID is required"],
      index: true,
    },
    goalId: {
      type: Schema.Types.ObjectId,
      ref: "Goal",
      required: [true, "Goal ID is required"],
      index: true,
    },
    userId: {
      type: String,
      required: [true, "User ID is required"],
      index: true,
    },
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
    order: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["locked", "unlocked", "in_progress", "completed"],
      default: "unlocked",
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for roadmap retrieval
StandaloneMilestoneSchema.index({ outcomeId: 1, order: 1 });
StandaloneMilestoneSchema.index({ goalId: 1, order: 1 });
StandaloneMilestoneSchema.index({ userId: 1, status: 1 });

export const MilestoneModel: Model<IMilestoneDocument> =
  mongoose.models.MilestoneModel ||
  mongoose.model<IMilestoneDocument>("MilestoneModel", StandaloneMilestoneSchema);
