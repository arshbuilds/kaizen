import mongoose, { Schema, Document, Model, Types } from "mongoose";

/**
 * DailyPlan Document Interface
 *
 * Tracks the user's execution plan for a specific calendar day.
 * This is the central record that connects:
 *   - The user's planning preferences (daily target minutes)
 *   - The actions selected from their active goals (from Phase 3)
 *   - Real-time progress tracking (completed minutes)
 *
 * A new DailyPlan is created each day (or when the user generates
 * a fresh plan). It stores an ordered array of action IDs (the queue).
 *
 * The `date` field is stored as a YYYY-MM-DD string (in the user's
 * timezone) to guarantee one plan per day per user without any
 * timezone-induced duplicate documents.
 */
export interface IDailyPlan extends Document {
  _id: Types.ObjectId;
  userId: string;              // Clerk user ID — strict tenant isolation
  date: string;                // "YYYY-MM-DD" in user's local timezone
  targetMinutes: number;       // Copied from user.dailyTargetMinutes at generation time
  scheduledMinutes: number;    // Sum of estimatedMinutes of all scheduled actions
  completedMinutes: number;    // Running sum of actualMinutes from completed sessions
  actionIds: Types.ObjectId[]; // Ordered queue of Action _id references
  status: "active" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

const DailyPlanSchema = new Schema<IDailyPlan>(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      index: true,
    },
    date: {
      type: String,
      required: [true, "Date is required (YYYY-MM-DD format)"],
      match: [/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"],
      index: true,
    },
    targetMinutes: {
      type: Number,
      required: [true, "Target minutes is required"],
      min: [15, "Daily target must be at least 15 minutes"],
      default: 180,
    },
    scheduledMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    completedMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    actionIds: {
      type: [Schema.Types.ObjectId],
      ref: "Action",
      default: [],
    },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index — enforces exactly one plan per user per day.
// This prevents duplicate plans from being created concurrently (e.g.
// if the user clicks "Generate Plan" twice in rapid succession).
DailyPlanSchema.index({ userId: 1, date: 1 }, { unique: true });

export const DailyPlan: Model<IDailyPlan> =
  mongoose.models.DailyPlan ||
  mongoose.model<IDailyPlan>("DailyPlan", DailyPlanSchema);
