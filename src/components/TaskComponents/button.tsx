"use client";
import { updatehabitByUser } from "@/src/services/habitServices";
import { updateTodoByUser } from "@/src/services/todoServices";
import { habitType } from "@/src/types/habitTypes";
import { todoType } from "@/src/types/todoTypes";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type Props = {
  taskType: "habit" | "todo";
  completionStatus: boolean;
  userId: string;
  goalId?: string;
  todoType?: string;
  todoId?: string;
  habitId?: string;
};

export const ToggleButton = ({
  taskType,
  completionStatus,
  userId,
  goalId,
  todoType,
  todoId,
  habitId,
}: Props) => {
  const queryClient = useQueryClient();
  const queryKey = taskType === "habit" ? `habits` : `${todoType}-todos`;
  const toggleTaskMutation = useMutation({
    mutationFn: async (newStatus: boolean) => {
      if (taskType === "todo" && goalId && todoType && todoId) {
        return await updateTodoByUser(
          { status: newStatus },
          userId,
          goalId,
          todoType,
          todoId
        );
      }
      if (taskType === "habit" && habitId) {
        return await updatehabitByUser(
          { status: newStatus },
          userId,
          habitId
        );
      }
    },
    onMutate: async (newStatus) => {
      await queryClient.cancelQueries({ queryKey: [queryKey] });

      const previousTasks = queryClient.getQueryData([queryKey]);
      if (taskType === "todo") {
        queryClient.setQueryData([queryKey], (old: Array<todoType>) => {
          if (!old) return old;

          return old.map((todo: todoType) =>
            todo.todoId === todoId ? { ...todo, status: newStatus } : todo
          );
        });
      }
      if (taskType === "habit") {
        queryClient.setQueryData([queryKey], (old: Array<habitType>) => {
          if (!old) return old;

          return old.map((habit: habitType) =>
            habit.habitId === habitId ? { ...habit, status: newStatus } : habit
          );
        });
      }
      return { previousTasks };
    },

    // 👇 Rollback on error
    onError: (_err, _newStatus, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(
          [queryKey],
          context.previousTasks
        );
      }
    },

    // 👇 Refetch to confirm DB state is synced
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
  });

  return (
    <button
      className="text-black bg-white"
      onClick={() => toggleTaskMutation.mutate(!completionStatus)}
    >
      {completionStatus ? <h1>done</h1> : <h2>not done</h2>}
      toggle
    </button>
  );
};
