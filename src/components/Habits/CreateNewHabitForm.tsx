"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addHabitByUser } from "@/src/services/habitServices";
import { partialHabitType } from "@/src/types/habitTypes";
import { toast } from "sonner";
import { useAuth } from "@/src/hooks/useAuth";

const habitSchema = z.object({
  title: z.string().min(1, "Please enter a valid title"),
  category: z.string(),
});

type HabitForm = z.infer<typeof habitSchema>;

const CreateNewHabitForm = ({ onClose }: { onClose: () => void }) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const queryKey = "habits";
  const { register, handleSubmit } = useForm<HabitForm>({
    resolver: zodResolver(habitSchema),
  });

  const addHabitMutation = useMutation({
    mutationFn: ({ title, category }: { title: string; category: string }) =>
      addHabitByUser({ title, category }, user!.userId),
    onMutate: async (title) => {
      await queryClient.cancelQueries({ queryKey: [queryKey] });
      const prevData = queryClient.getQueryData([queryKey]);
      queryClient.setQueryData([queryKey], (old: Array<partialHabitType>) => [
        ...(old || []),
        { title: title, status: false },
      ]);
      return { prevData };
    },
    onError: (_err, _newStatus, context) => {
      if (context?.prevData) {
        queryClient.setQueryData(["habits"], context.prevData);
      }
      toast.error("some error occured");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast.success("Habit added");
    },
  });

  const onSubmit = (data: HabitForm) => {
    addHabitMutation.mutate({ title: data.title, category: data.category });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("title")} placeholder="Habit name" />
      <input {...register("category")} placeholder="category" />
      <button disabled={addHabitMutation.isPending} type="submit">
        Create Habit
      </button>
    </form>
  );
};

export default CreateNewHabitForm;
