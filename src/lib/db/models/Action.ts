import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type ActionDifficulty = "easy" | "medium" | "hard";
export type ActionCognitiveLoad = "deep_work" | "shallow_work" | "learning";
export type ActionStatus =
  | "ready"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "skipped"
  | "abandoned";

export interface IAction extends Document {
  _id: Types.ObjectId;
  milestoneId: Types.ObjectId; // Parent Milestone reference
  outcomeId: Types.ObjectId;   // Parent Outcome reference
  goalId: Types.ObjectId;      // Root Goal reference
  userId: string;              // Clerk User ID for strict tenant isolation
  title: string;               // Verb-first actionable title (e.g. "Implement Redis cache layer")
  description?: string;        // Specific subtask criteria
  estimatedMinutes: number;    // Strictly bounded between 15 and 90 mins
  actualMinutes: number;       // Actual telemetry tracked during /focus mode
  difficulty: ActionDifficulty;
  cognitiveLoad: ActionCognitiveLoad;
  status: ActionStatus;
  order: number;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ActionSchema = new Schema<IAction>(
  {
    milestoneId: {
      type: Schema.Types.ObjectId,
      ref: "MilestoneModel",
      required: [true, "Milestone ID is required"],
      index: true,
    },
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
      required: [true, "Action title is required"],
      trim: true,
      maxlength: [200, "Action title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    estimatedMinutes: {
      type: Number,
      required: [true, "Estimated minutes is required"],
      min: [15, "Action minimum duration is 15 minutes"],
      max: [90, "Action maximum duration is 90 minutes (break large tasks down)"],
      default: 45,
    },
    actualMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    cognitiveLoad: {
      type: String,
      enum: ["deep_work", "shallow_work", "learning"],
      default: "deep_work",
    },
    status: {
      type: String,
      enum: [
        "ready",
        "scheduled",
        "in_progress",
        "completed",
        "skipped",
        "abandoned",
      ],
      default: "ready",
      index: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for high-frequency queries
ActionSchema.index({ goalId: 1, status: 1, order: 1 });
ActionSchema.index({ milestoneId: 1, order: 1 });
ActionSchema.index({ userId: 1, status: 1 });

export const Action: Model<IAction> =
  mongoose.models.Action || mongoose.model<IAction>("Action", ActionSchema);
