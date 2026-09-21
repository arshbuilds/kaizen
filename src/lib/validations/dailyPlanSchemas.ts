import { z } from "zod";
import {
  CognitiveLoadEnum,
  ActionDifficultyEnum,
} from "./decompositionSchemas";

// ─────────────────────────────────────────────────
// Section 1: Enums re-exported for convenience
// ─────────────────────────────────────────────────

export { CognitiveLoadEnum, ActionDifficultyEnum };

// ─────────────────────────────────────────────────
// Section 2: TodayAction DTO
// Represents a single enriched action in the daily plan.
// Contains all information the /today and /focus pages need
// without requiring further DB lookups.
// ─────────────────────────────────────────────────

export interface TodayActionDto {
  id: string;
  title: string;
  description?: string;
  estimatedMinutes: number;
  actualMinutes: number;
  cognitiveLoad: "deep_work" | "shallow_work" | "learning";
  difficulty: "easy" | "medium" | "hard";
  status: "ready" | "scheduled" | "in_progress" | "completed" | "skipped" | "abandoned";
  order: number;
  // Parent references for breadcrumb display (e.g. "Goal → Milestone")
  goalId: string;
  goalTitle: string;
  milestoneId: string;
  milestoneTitle: string;
  outcomeId: string;
  completedAt?: string;
}

// ─────────────────────────────────────────────────
// Section 3: DailyPlan DTO
// The full daily plan returned by GET /api/today.
// ─────────────────────────────────────────────────

export interface DailyPlanDto {
  id: string;
  userId: string;
  date: string;
  targetMinutes: number;
  scheduledMinutes: number;
  completedMinutes: number;
  status: "active" | "completed";
  actions: TodayActionDto[];
  // Derived stats
  remainingMinutes: number;         // targetMinutes - completedMinutes
  progressPercentage: number;       // (completedMinutes / targetMinutes) * 100
  deepWorkCount: number;            // Number of deep_work actions scheduled
  completedCount: number;           // Number of actions completed
  totalCount: number;               // Total actions in plan
}

// ─────────────────────────────────────────────────
// Section 4: CandidateActions response (no plan yet)
// Returned when no DailyPlan exists for today.
// ─────────────────────────────────────────────────

export interface CandidateActionsDto {
  hasPlan: false;
  candidateCount: number;
  candidates: TodayActionDto[];
}

export type TodayResponseDto = (DailyPlanDto & { hasPlan: true }) | CandidateActionsDto;

// ─────────────────────────────────────────────────
// Section 5: Request validation schemas
// ─────────────────────────────────────────────────

/**
 * Schema for PATCH /api/actions/[actionId]
 * Allows the user to update an action's status (e.g., skip, reschedule)
 * or the order within the daily queue.
 */
export const UpdateActionStatusSchema = z.object({
  status: z
    .enum(["ready", "scheduled", "in_progress", "skipped", "abandoned"])
    .optional(),
});

export type UpdateActionStatusInput = z.infer<typeof UpdateActionStatusSchema>;

/**
 * Schema for POST /api/focus/complete
 * The payload sent when a user finishes a focus session.
 * `actualMinutes` is the real elapsed time (from the timer telemetry),
 * which may differ from `estimatedMinutes`.
 */
export const CompleteFocusSessionSchema = z.object({
  actionId: z
    .string()
    .min(24, "Invalid action ID")
    .max(24, "Invalid action ID"),
  actualMinutes: z
    .number()
    .int("Actual minutes must be an integer")
    .min(1, "Actual minutes must be at least 1")
    .max(180, "Actual minutes cannot exceed 180"),
});

export type CompleteFocusSessionInput = z.infer<typeof CompleteFocusSessionSchema>;

/**
 * Response DTO for POST /api/focus/complete
 */
export interface FocusCompleteResultDto {
  actionId: string;
  actualMinutes: number;
  // Whether completing this action caused its parent Milestone to complete
  milestoneCompleted: boolean;
  milestoneId?: string;
  milestoneTitle?: string;
  // Whether completing the milestone completed the parent Outcome
  outcomeCompleted: boolean;
  // Updated goal progress
  goalId: string;
  goalProgressPercentage: number;
  // Updated daily plan progress
  planCompletedMinutes: number;
  planProgressPercentage: number;
}
