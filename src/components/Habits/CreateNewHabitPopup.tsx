"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addHabitByUser } from "@/src/services/habitServices";
import { partialHabitType } from "@/src/types/habitTypes";
import { toast } from "sonner";

const habitSchema = z.object({
  title: z.string().min(1, "Please enter a valid title"),
});

type HabitForm = z.infer<typeof habitSchema>;

const CreateNewHabitPopup = () => {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HabitForm>({
    resolver: zodResolver(habitSchema),
  });

  const addHabitMutation = useMutation({
    mutationFn: (title: string) =>
      addHabitByUser({ title }, "CFOsu6H7SS6Y5MlLBJf3"),
    onMutate: async (title) => {
      await queryClient.cancelQueries({ queryKey: ["habits"] });
      const prevData = queryClient.getQueryData(["habits"]);
        queryClient.setQueryData(["habits"], (old: Array<partialHabitType>) => [
      ...(old || []),
      {title: title, status: false},
    ]);
      return { prevData };
    },
    onError: (_err, _newStatus, context) => {
      if (context?.prevData) {
        queryClient.setQueryData(["habits"], context.prevData);
      }
      toast.error("some error occured")
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      toast.success("Habit added")
    },
  });

  const onSubmit = (data: HabitForm) => {
    console.log(data);
    addHabitMutation.mutate(data.title);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("title")} placeholder="Habit name" />
      {errors.title && <p>{errors.title.message}</p>}
      <button disabled={addHabitMutation.isPending} type="submit">Create Habit</button>
    </form>
  );
};

export default CreateNewHabitPopup;
