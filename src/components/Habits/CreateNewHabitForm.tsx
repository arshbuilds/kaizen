"use client";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addHabitByUser } from "@/src/services/habitServices";
import { partialHabitType } from "@/src/types/habitTypes";
import { toast } from "sonner";
import { useAuth } from "@/src/hooks/useAuth";
import FormDropdown from "../ui/dropdown";

const habitSchema = z.object({
  title: z.string().min(1, "Please enter a valid title"),
  category: z.string(),
});

type HabitForm = z.infer<typeof habitSchema>;

const CreateNewHabitForm = ({ onClose }: { onClose: () => void }) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const queryKey = "habits";
  const { register, handleSubmit, control } = useForm<HabitForm>({
    resolver: zodResolver(habitSchema),
  });

  const addHabitMutation = useMutation({
    mutationFn: ({ title, category }: { title: string; category: string }) =>
      addHabitByUser({ formData:{title, category }, userId: user!.userId}),
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-sm my-16">
      <div>
        <label className="mb-1 block font-medium">Habit Name</label>
        <input
          {...register("title")}
          required
          name="name"
          placeholder="e.g., Meditate for 10 minutes"
          className="w-full rounded-lg border border-slate-600/60 bg-slate-700/60 px-4 py-2 placeholder:text-slate-500 focus:border-violet-500 focus:outline-none"
        />
      </div>
      <label className="mb-1 block font-medium">Priority</label>
      <Controller
        control={control}
        name="category"
        render={({ field }) => (
          <FormDropdown
            value={field.value}
            onChange={field.onChange}
            options={[
              "💼 Work",
              "🏠 Personal",
              "🏥 Health",
              "📚 Learning",
              "🎨 Creative",
            ]}
            placeholder="priority"
          />
        )}
      />

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 rounded-md bg-gradient-to-r from-violet-500 to-pink-500 px-6 py-3 font-medium text-white hover:opacity-90"
        >
          + Create Habit
        </button>
      </div>
      
    </form>
  );
};

export default CreateNewHabitForm;
