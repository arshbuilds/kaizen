import { z } from "zod";

export const WorkBlockEnum = z.enum([
  "morning",
  "afternoon",
  "evening",
  "night",
]);

export const UpdatePreferencesSchema = z.object({
  dailyTargetMinutes: z
    .number({ invalid_type_error: "Daily target must be a number" })
    .int("Daily target must be an integer")
    .min(15, "Daily target must be at least 15 minutes")
    .max(960, "Daily target cannot exceed 16 hours (960 minutes)")
    .optional(),
  focusDurationMinutes: z
    .number({ invalid_type_error: "Focus duration must be a number" })
    .int("Focus duration must be an integer")
    .min(10, "Focus duration must be at least 10 minutes")
    .max(180, "Focus duration cannot exceed 3 hours (180 minutes)")
    .optional(),
  timezone: z
    .string()
    .min(1, "Timezone cannot be empty")
    .max(64, "Timezone string too long")
    .optional(),
  preferredWorkBlocks: z
    .array(WorkBlockEnum)
    .min(1, "Select at least one preferred work block")
    .max(4)
    .optional(),
});

export type UpdatePreferencesInput = z.infer<typeof UpdatePreferencesSchema>;

export interface UserPreferencesDto {
  clerkId: string;
  email: string;
  name?: string;
  timezone: string;
  dailyTargetMinutes: number;
  focusDurationMinutes: number;
  preferredWorkBlocks: string[];
  updatedAt: Date;
}
