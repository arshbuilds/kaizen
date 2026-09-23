import { z } from "zod";

// ─────────────────────────────────────────────────
// Section 1: Submit Weekly Review Input Schema
// Validates the payload sent from the /review form.
// ─────────────────────────────────────────────────

export const SubmitWeeklyReviewSchema = z.object({
  energyRating: z
    .number()
    .int("Energy rating must be an integer")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),
  focusRating: z
    .number()
    .int("Focus rating must be an integer")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),
  reflectionNote: z
    .string()
    .trim()
    .max(2000, "Reflection note cannot exceed 2000 characters")
    .default(""),
  nextWeekIntention: z
    .string()
    .trim()
    .max(300, "Intention cannot exceed 300 characters")
    .default(""),
});

export type SubmitWeeklyReviewInput = z.infer<typeof SubmitWeeklyReviewSchema>;

// ─────────────────────────────────────────────────
// Section 2: Weekly Stats DTO
// Returned by GET /api/review/stats — computed live
// from Action and DailyPlan documents for the current
// (or specified) ISO week.
// ─────────────────────────────────────────────────

export interface GoalWeeklyBreakdown {
  goalId: string;
  goalTitle: string;
  completedMinutes: number;
  completedSessions: number;
  totalSessions: number;       // scheduled or completed during this week
  completionRate: number;      // 0–100
}

export interface WeeklyStatsDto {
  weekStart: string;            // "YYYY-MM-DD" Monday
  weekEnd: string;              // "YYYY-MM-DD" Sunday
  // Quantitative
  totalCompletedMinutes: number;
  totalPlannedMinutes: number;
  completedSessionsCount: number;
  plannedSessionsCount: number;
  deepWorkMinutes: number;
  uniqueGoalsTouched: number;
  // Derived rates
  minuteCompletionRate: number;   // 0–100
  sessionCompletionRate: number;  // 0–100
  // Per-day breakdown (7 entries Mon–Sun)
  dailyMinutes: { date: string; minutes: number }[];
  // Per-goal breakdown
  goalBreakdown: GoalWeeklyBreakdown[];
  // Whether the user has already submitted a review this week
  hasSubmittedReview: boolean;
  existingReviewId?: string;
}

// ─────────────────────────────────────────────────
// Section 3: Review History DTO
// A lightweight summary of past reviews.
// ─────────────────────────────────────────────────

export interface WeeklyReviewSummaryDto {
  id: string;
  weekStart: string;
  weekEnd: string;
  totalCompletedMinutes: number;
  completedSessionsCount: number;
  energyRating: number;
  focusRating: number;
  aiInsight?: string;
  createdAt: string;
}

// ─────────────────────────────────────────────────
// Section 4: Full Review DTO (for submitted review)
// ─────────────────────────────────────────────────

export interface WeeklyReviewDto extends WeeklyReviewSummaryDto {
  totalPlannedMinutes: number;
  plannedSessionsCount: number;
  deepWorkMinutes: number;
  uniqueGoalsTouched: number;
  reflectionNote: string;
  nextWeekIntention: string;
  updatedAt: string;
}
