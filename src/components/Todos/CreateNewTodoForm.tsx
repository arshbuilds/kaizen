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
  title: z.string().min(1, "please enter a valid title"),
  description: z.string(),
  priority: z.enum(["low", "medium", "high"]),
  goalId: z.string().nonempty(),
});

type todoForm = z.infer<typeof addTodoSchema>;

const CreateNewTodoForm = ({ onClose }: { onClose: () => void }) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const queryKey = "todos";
  const { register, handleSubmit, control } = useForm<todoForm>({
    resolver: zodResolver(addTodoSchema),
  });
  const addTodoMutation = useMutation({
    mutationFn: (data: todoForm) =>
      addTodoByUser(
        {
          title: data.title,
          description: data.description,
          priority: data.priority,
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
    console.log(data);
    addTodoMutation.mutate(data);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("title")} placeholder="Todo Name" />
      <input {...register("description")} placeholder="description" />
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
      <button type="submit">sumbit</button>
    </form>
  );
};

export default CreateNewTodoForm;
