import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type OutcomeStatus = "pending" | "in_progress" | "completed";

export interface IOutcome extends Document {
  _id: Types.ObjectId;
  goalId: Types.ObjectId; // Parent Goal reference
  userId: string;         // Clerk User ID for tenant isolation
  title: string;          // Core domain pillar (e.g., "System Architecture & Scalability")
  description?: string;   // Contextual scope of this pillar
  order: number;          // Presentation order
  status: OutcomeStatus;
  createdAt: Date;
  updatedAt: Date;
}

const OutcomeSchema = new Schema<IOutcome>(
  {
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
      required: [true, "Outcome title is required"],
      trim: true,
      maxlength: [150, "Outcome title cannot exceed 150 characters"],
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
      enum: ["pending", "in_progress", "completed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to quickly fetch an ordered list of outcomes for a specific goal
OutcomeSchema.index({ goalId: 1, order: 1 });
// Compound index for user queries
OutcomeSchema.index({ userId: 1, status: 1 });

export const Outcome: Model<IOutcome> =
  mongoose.models.Outcome || mongoose.model<IOutcome>("Outcome", OutcomeSchema);
