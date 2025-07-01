"use client";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/src/hooks/useAuth";
import { addTodoByUser } from "@/src/services/todoServices";
import { formatDate } from "@/src/utils/dateTimeUtils";
import { partialtodoOutputType, todoOutputType } from "@/src/types/todoTypes";
import FormDropdown from "../ui/dropdown";

const addTodoSchema = z.object({
  title: z.string(),
  description: z.string(),
  priority: z.enum(["low", "medium", "high"]),
  goalId: z.string().nonempty(),
});

type todoForm = z.infer<typeof addTodoSchema>;

const CreateNewTodoForm = ({ onClose }: { onClose: () => void }) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const queryKey = "todos";
  const { register, handleSubmit, control, formState:{errors} } = useForm<todoForm>({
    resolver: zodResolver(addTodoSchema),
  });
  const addTodoMutation = useMutation({
    mutationFn: (data: todoForm) =>
      addTodoByUser(
        {
          title: data.title,
          description: data.description,
          priority: data.priority,
          xp: 0,
          coins: 0,
          timeRequired: 10,
        },
        user!.userId,
        data.goalId,
        formatDate(new Date())
      ),
    onMutate: async (data: partialtodoOutputType) => {
      await queryClient.cancelQueries({ queryKey: [queryKey] });
      const prevData = queryClient.getQueryData([queryKey]);
      queryClient.setQueryData([queryKey], (old: Array<todoOutputType>) => [
        ...(old || []),
        {
          title: data.title,
          status: false,
          description: data.description,
          priority: data.priority,
          goalId: data.goalId,
        },
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
      toast.success("Todo added");
    },
  });

  const onSubmit = (data: todoForm) => {
    addTodoMutation.mutate(data);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-sm my-16">
      <div>
        <label className="mb-1 block font-medium">Task Name</label>
        <input
          {...register("title")}
          required
          name="title"
          placeholder="e.g., Review project proposal"
          className="w-full rounded-lg border border-slate-600/60 bg-slate-700/60 px-4 py-2 placeholder:text-slate-500 focus:border-violet-500 focus:outline-none"
        />
      </div>
      {errors.description && <>{errors.description.message}</>}
      {errors.goalId && <>{errors.goalId.message}</>}
      {errors.title && <>{errors.title.message}</>}
      {errors.priority && <>{errors.priority.message}</>}

      {/* Description */}
      <div>
        <label className="mb-1 block font-medium">Description</label>
        <textarea
          rows={3}
          {...register("description")}
          placeholder="Add more details about the task..."
          className="w-full resize-none rounded-lg border border-slate-600/60 bg-slate-700/60 px-4 py-2 placeholder:text-slate-500 focus:border-violet-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block font-medium">Priority</label>
          <Controller
            control={control}
            name="priority"
            render={({ field }) => (
              <FormDropdown
                value={field.value}
                onChange={field.onChange}
                options={["low", "medium", "high"]}
                placeholder="priority"
              />
            )}
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">Goal</label>
          <Controller
            control={control}
            name="goalId"
            render={({ field }) => (
              <FormDropdown
                value={field.value}
                onChange={field.onChange}
                options={user!.goals}
                placeholder="Select"
              />
            )}
          />
        </div>
      </div>

      <button
        type="submit"
        className="flex-1 rounded-md bg-gradient-to-r from-violet-500 to-pink-500 px-6 py-3 font-medium text-white hover:opacity-90"
      >
        + Create Task
      </button>
    </form>
  );
};

export default CreateNewTodoForm;
