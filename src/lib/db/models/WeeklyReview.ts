import mongoose, { Schema, Document, Model, Types } from "mongoose";

/**
 * WeeklyReview Document Interface
 *
 * Captures a timestamped snapshot of the user's performance and
 * subjective reflection for a specific ISO calendar week.
 *
 * The week is identified by `weekStart` — a "YYYY-MM-DD" string
 * representing the Monday of that week (ISO 8601 week start).
 * This means one document per user per week, enforced by the
 * compound unique index { userId, weekStart }.
 *
 * Stats fields are populated by the /api/review/stats endpoint
 * at query time (computed from Action, DailyPlan documents) and
 * then persisted when the user submits their review.
 *
 * The `aiInsight` field stores a Gemini-generated personalized
 * observation based on the user's performance patterns and goals.
 */
export interface IWeeklyReview extends Document {
  _id: Types.ObjectId;
  userId: string;            // Clerk user ID — strict tenant isolation
  weekStart: string;         // "YYYY-MM-DD" — Monday of the reviewed week

  // Quantitative performance snapshot
  totalCompletedMinutes: number;   // Sum of actualMinutes across all completed sessions
  totalPlannedMinutes: number;     // Sum of targetMinutes across all DailyPlans
  completedSessionsCount: number;  // Number of actions completed this week
  plannedSessionsCount: number;    // Number of actions that were scheduled
  deepWorkMinutes: number;         // Minutes spent in deep_work sessions
  uniqueGoalsTouched: number;      // Number of distinct goals worked on

  // Qualitative reflection
  energyRating: 1 | 2 | 3 | 4 | 5;       // How energetic the user felt overall
  focusRating: 1 | 2 | 3 | 4 | 5;        // How focused their sessions were
  reflectionNote: string;                   // Free-text: what went well / what to improve
  nextWeekIntention: string;               // One sentence: primary focus for next week

  // AI-generated insight
  aiInsight?: string;    // Gemini-generated observation from performance data

  createdAt: Date;
  updatedAt: Date;
}

const WeeklyReviewSchema = new Schema<IWeeklyReview>(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      index: true,
    },
    weekStart: {
      type: String,
      required: [true, "Week start date is required (YYYY-MM-DD)"],
      match: [/^\d{4}-\d{2}-\d{2}$/, "weekStart must be YYYY-MM-DD format"],
    },
    totalCompletedMinutes: { type: Number, default: 0, min: 0 },
    totalPlannedMinutes: { type: Number, default: 0, min: 0 },
    completedSessionsCount: { type: Number, default: 0, min: 0 },
    plannedSessionsCount: { type: Number, default: 0, min: 0 },
    deepWorkMinutes: { type: Number, default: 0, min: 0 },
    uniqueGoalsTouched: { type: Number, default: 0, min: 0 },
    energyRating: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      required: [true, "Energy rating is required"],
    },
    focusRating: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      required: [true, "Focus rating is required"],
    },
    reflectionNote: {
      type: String,
      trim: true,
      maxlength: [2000, "Reflection note cannot exceed 2000 characters"],
      default: "",
    },
    nextWeekIntention: {
      type: String,
      trim: true,
      maxlength: [300, "Next week intention cannot exceed 300 characters"],
      default: "",
    },
    aiInsight: {
      type: String,
      trim: true,
      maxlength: [1000, "AI insight cannot exceed 1000 characters"],
    },
  },
  { timestamps: true }
);

// One review per user per week
WeeklyReviewSchema.index({ userId: 1, weekStart: 1 }, { unique: true });
// For listing review history in reverse chronological order
WeeklyReviewSchema.index({ userId: 1, createdAt: -1 });

export const WeeklyReview: Model<IWeeklyReview> =
  mongoose.models.WeeklyReview ||
  mongoose.model<IWeeklyReview>("WeeklyReview", WeeklyReviewSchema);
