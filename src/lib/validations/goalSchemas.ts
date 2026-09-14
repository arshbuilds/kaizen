import { z } from "zod";

export const GoalStatusEnum = z.enum(["active", "paused", "completed", "archived"]);
export type GoalStatusType = z.infer<typeof GoalStatusEnum>;

export const MilestoneStatusEnum = z.enum(["pending", "in_progress", "completed"]);
export type MilestoneStatusType = z.infer<typeof MilestoneStatusEnum>;

export const MilestoneSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Milestone title is required")
    .max(150, "Milestone title cannot exceed 150 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  status: MilestoneStatusEnum.default("pending"),
  order: z.number().int().min(0).default(0),
});

export const CreateGoalSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Goal title must be at least 2 characters")
    .max(200, "Goal title cannot exceed 200 characters"),
  whyItMatters: z
    .string()
    .trim()
    .min(3, "Please describe why this goal matters to you")
    .max(1000, "Why this matters cannot exceed 1000 characters"),
  targetWeeks: z
    .number()
    .int()
    .min(1, "Target weeks must be at least 1")
    .max(104, "Target weeks cannot exceed 104 (2 years)")
    .default(12),
  milestones: z.array(MilestoneSchema).optional().default([]),
});

export const UpdateGoalSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Goal title must be at least 2 characters")
    .max(200, "Goal title cannot exceed 200 characters")
    .optional(),
  whyItMatters: z
    .string()
    .trim()
    .min(3, "Why this matters must be at least 3 characters")
    .max(1000, "Why this matters cannot exceed 1000 characters")
    .optional(),
  status: GoalStatusEnum.optional(),
  targetWeeks: z
    .number()
    .int()
    .min(1, "Target weeks must be at least 1")
    .max(104, "Target weeks cannot exceed 104")
    .optional(),
});

export const AddMilestoneSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Milestone title is required")
    .max(150, "Milestone title cannot exceed 150 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
});

export const UpdateMilestoneSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Milestone title cannot be empty")
    .max(150, "Milestone title cannot exceed 150 characters")
    .optional(),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  status: MilestoneStatusEnum.optional(),
  order: z.number().int().min(0).optional(),
});

export type CreateGoalInput = z.infer<typeof CreateGoalSchema>;
export type UpdateGoalInput = z.infer<typeof UpdateGoalSchema>;
export type AddMilestoneInput = z.infer<typeof AddMilestoneSchema>;
export type UpdateMilestoneInput = z.infer<typeof UpdateMilestoneSchema>;

export interface MilestoneDto {
  id: string;
  title: string;
  description?: string;
  status: MilestoneStatusType;
  order: number;
  createdAt: string;
}

export interface GoalSummaryDto {
  id: string;
  title: string;
  whyItMatters: string;
  status: GoalStatusType;
  targetWeeks: number;
  targetDate?: string;
  totalMilestones: number;
  completedMilestones: number;
  progressPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface GoalDto extends GoalSummaryDto {
  milestones: MilestoneDto[];
  totalEstimatedMinutes: number;
  totalCompletedMinutes: number;
}
