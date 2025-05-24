"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
// import { toast } from "sonner";
import { useAuth } from "@/src/hooks/useAuth";
import { getTasksFromPrompt } from "@/src/services/ai/getTasks";
import { addGoalByUser, uploadTasksForGoals } from "@/src/services/goalServices";
import { kebabCase } from "lodash";

const habitSchema = z.object({
  title: z.string().min(1, "Please enter a valid title"),
  description: z.string(),
  weeks: z.number(),
  tags: z.string(),
});

type HabitForm = z.infer<typeof habitSchema>;

const GetTodosFromPrompt = () => {
  // const queryClient = useQueryClient();

  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HabitForm>({
    resolver: zodResolver(habitSchema),
  });

  const addGoalAndTasks = useMutation({
    mutationFn: async (data: HabitForm) => {
      const tasks = await getTasksFromPrompt(data.description, data.weeks);
      await addGoalByUser({
        userId: user!.userId,
        title: data.title,
        tags: data.tags,
        description: data.description,
        weeks: data.weeks,
      });
      await uploadTasksForGoals(tasks, user!.userId, kebabCase(data.title));
    },
  });

  const onSubmit = (data: HabitForm) => {
    addGoalAndTasks.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("title")} placeholder="What's your goal?" />
      {errors.title && <p>{errors.title.message}</p>}

      <input
        {...register("description")}
        placeholder="Briefly describe what you'd like to achieve"
      />

      <input
        {...register("weeks", { valueAsNumber: true })}
        placeholder="How many weeks to accomplish this goal"
        type="number"
      />
      {errors.weeks && <p>{errors.weeks.message}</p>}
      <input
        {...register("tags")}
        placeholder="Enter relevent tags seperated by commas(,)"
      />

      {errors.tags && <p>{errors.tags.message}</p>}
      <button disabled={addGoalAndTasks.isPending} type="submit">
        Add goal
      </button>
    </form>
  );
};

export default GetTodosFromPrompt;
