"use client";
import { FirestoreTimestamp } from "@/src/lib/firebase";
import {
  deletehabitByUser,
  updateHabitByUser,
} from "@/src/services/habitServices";
import { deleteTodoByUser, updateTodoByUser } from "@/src/services/todoServices";
import { habitType } from "@/src/types/habitTypes";
import { todoType } from "@/src/types/todoTypes";
import { wasCompletedYesterday } from "@/src/utils/dateTimeUtils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";

type ToggleButtonProps = {
  taskType: "habit" | "todo";
  completionStatus: boolean;
  userId: string;
  goalId?: string;
  todoType?: string;
  todoId?: string;
  habitId?: string;
  streak?: number;
  lastCompleted?: FirestoreTimestamp;
};

export const ToggleButton = ({
  taskType,
  completionStatus,
  userId,
  goalId,
  todoType,
  todoId,
  habitId,
  streak,
  lastCompleted,
}: ToggleButtonProps) => {
  const queryClient = useQueryClient();
  const queryKey = taskType === "habit" ? `habits` : `${todoType}-todos`;
  const toggleTaskMutation = useMutation({
    mutationFn: async (newStatus: boolean) => {
      if (taskType === "habit" && habitId && lastCompleted) {
        const currentStreak =
          typeof streak === "number" && wasCompletedYesterday(lastCompleted)
            ? streak
            : 0;
        const newStreak = newStatus ? currentStreak + 1 : currentStreak - 1;
        return await updateHabitByUser(
          {
            status: newStatus,
            streak: newStreak,
            lastCompleted: serverTimestamp(),
          },
          userId,
          habitId
        );
      }
      if (taskType === "todo" && goalId && todoType && todoId) {
        return await updateTodoByUser(
          { status: newStatus },
          userId,
          goalId,
          todoType,
          todoId
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
            habit.habitId === habitId
              ? {
                  ...habit,
                  status: newStatus,
                  streak: newStatus ? habit.streak + 1 : habit.streak - 1,
                }
              : habit
          );
        });
      }
      return { previousTasks };
    },

    onError: (_err, _newStatus, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData([queryKey], context.previousTasks);
      }
    },

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
      toggle {streak}
    </button>
  );
};

type DeleteButtonProps = {
  taskType: "habit" | "todo";
  userId: string;
  goalId?: string;
  todoType?: string;
  todoId?: string;
  habitId?: string;
};

export const DeleteButton = ({
  taskType,
  userId,
  goalId,
  todoId,
  todoType,
  habitId,
}: DeleteButtonProps) => {
  const queryClient = useQueryClient();
  const queryKey = taskType === "habit" ? `habits` : `${todoType}-todos`;
  const deleteTaskMutation = useMutation({
    mutationFn: async () => {
      if (taskType === "habit" && habitId) {
        return await deletehabitByUser(userId, habitId);
      }
      if (taskType === "todo" && goalId && todoType && todoId) {
        return await deleteTodoByUser(userId, goalId, todoType, todoId);
      }
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: [queryKey] });

      const previousTasks = queryClient.getQueryData([queryKey]);
      if (taskType === "todo") {
        queryClient.setQueryData([queryKey], (old: Array<todoType>) => {
          if (!old) return old;
          return old.filter((todo: todoType) => todo.todoId !== todoId)
        });
      }
      if (taskType === "habit") {
        queryClient.setQueryData([queryKey], (old: Array<habitType>) => {
          if (!old) return old;
          return old.filter((habit: habitType)=> habit.habitId !== habitId)
        });
      }
      return { previousTasks };
    },

    onError: (_err, _newStatus, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData([queryKey], context.previousTasks);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast.success("Task deleted successfully")
    },
  });

  return (
    <button
      className="text-black bg-yellow-600"
      onClick={() => deleteTaskMutation.mutate()}
      disabled={deleteTaskMutation.isPending}
    >
      Delete
      {/* {completionStatus ? <h1>done</h1> : <h2>not done</h2>} */}
      {/* toggle {streak} */}
    </button>
  );
};
