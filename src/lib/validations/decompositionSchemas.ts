import { z } from "zod";

export const CognitiveLoadEnum = z.enum(["deep_work", "shallow_work", "learning"]);
export type CognitiveLoadType = z.infer<typeof CognitiveLoadEnum>;

export const ActionDifficultyEnum = z.enum(["easy", "medium", "hard"]);
export type ActionDifficultyType = z.infer<typeof ActionDifficultyEnum>;

export const DecomposedActionSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Action title must be at least 3 characters")
    .max(200, "Action title cannot exceed 200 characters"),
  description: z.string().trim().max(500).optional(),
  estimatedMinutes: z
    .number()
    .int()
    .min(15, "Minimum session duration is 15 minutes")
    .max(90, "Maximum session duration is 90 minutes")
    .default(45),
  cognitiveLoad: CognitiveLoadEnum.default("deep_work"),
  difficulty: ActionDifficultyEnum.default("medium"),
});

export const DecomposedMilestoneSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Milestone title is required")
    .max(150, "Milestone title cannot exceed 150 characters"),
  description: z.string().trim().max(500).optional(),
  order: z.number().int().min(0).default(0),
  actions: z
    .array(DecomposedActionSchema)
    .min(2, "Each milestone must contain at least 2 executable actions")
    .max(8, "Keep milestones bounded to at most 8 actions"),
});

export const DecomposedOutcomeSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Outcome title is required")
    .max(150, "Outcome title cannot exceed 150 characters"),
  description: z.string().trim().max(500).optional(),
  order: z.number().int().min(0).default(0),
  milestones: z
    .array(DecomposedMilestoneSchema)
    .min(1, "Each outcome must contain at least 1 milestone")
    .max(5, "Keep outcomes bounded to at most 5 milestones"),
});

export const DecomposedRoadmapSchema = z.object({
  summary: z
    .string()
    .trim()
    .max(1000, "Roadmap summary cannot exceed 1000 characters"),
  outcomes: z
    .array(DecomposedOutcomeSchema)
    .min(2, "A goal must be structured into at least 2 outcomes")
    .max(5, "Keep goals structured into at most 5 outcomes"),
});

export const CommitRoadmapSchema = z.object({
  outcomes: z.array(
    z.object({
      title: z.string().trim().min(2).max(150),
      description: z.string().trim().max(500).optional(),
      order: z.number().int().min(0),
      milestones: z.array(
        z.object({
          title: z.string().trim().min(2).max(150),
          description: z.string().trim().max(500).optional(),
          order: z.number().int().min(0),
          actions: z.array(
            z.object({
              title: z.string().trim().min(2).max(200),
              description: z.string().trim().max(500).optional(),
              estimatedMinutes: z.number().int().min(15).max(90),
              cognitiveLoad: CognitiveLoadEnum,
              difficulty: ActionDifficultyEnum,
            })
          ),
        })
      ),
    })
  ),
});

export type DecomposedActionDto = z.infer<typeof DecomposedActionSchema>;
export type DecomposedMilestoneDto = z.infer<typeof DecomposedMilestoneSchema>;
export type DecomposedOutcomeDto = z.infer<typeof DecomposedOutcomeSchema>;
export type DecomposedRoadmapDto = z.infer<typeof DecomposedRoadmapSchema>;
export type CommitRoadmapInput = z.infer<typeof CommitRoadmapSchema>;

// Hierarchical DTOs for client roadmap rendering
export interface HierarchicalActionDto {
  id: string;
  milestoneId: string;
  outcomeId: string;
  goalId: string;
  title: string;
  description?: string;
  estimatedMinutes: number;
  actualMinutes: number;
  difficulty: ActionDifficultyType;
  cognitiveLoad: CognitiveLoadType;
  status: string;
  order: number;
  completedAt?: string;
}

export interface HierarchicalMilestoneDto {
  id: string;
  outcomeId: string;
  goalId: string;
  title: string;
  description?: string;
  order: number;
  status: string;
  actions: HierarchicalActionDto[];
}

export interface HierarchicalOutcomeDto {
  id: string;
  goalId: string;
  title: string;
  description?: string;
  order: number;
  status: string;
  milestones: HierarchicalMilestoneDto[];
}

export interface FullRoadmapDto {
  goalId: string;
  totalOutcomes: number;
  totalMilestones: number;
  totalActions: number;
  totalEstimatedMinutes: number;
  totalCompletedMinutes: number;
  outcomes: HierarchicalOutcomeDto[];
}
