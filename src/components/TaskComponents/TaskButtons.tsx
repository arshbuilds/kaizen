"use client";
import { FirestoreTimestamp } from "@/src/lib/firebase";
import {
  deletehabitByUser,
  updateHabitByUser,
} from "@/src/services/habitServices";
import {
  deleteTodoByUser,
  updateTodoByUser,
} from "@/src/services/todoServices";
import { habitType } from "@/src/types/habitTypes";
import { todoOutputType } from "@/src/types/todoTypes";
import { wasCompletedYesterday } from "@/src/utils/dateTimeUtils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { serverTimestamp } from "firebase/firestore";
import { FaRegTrashAlt } from "react-icons/fa";
import { toast } from "sonner";

type ToggleButtonProps = {
  taskType: "habit" | "todo";
  completionStatus: boolean;
  userId: string;
  queryKey: string;
  goalId?: string;
  dueBy?: string;
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
  queryKey,
  dueBy,
  todoId,
  habitId,
  streak,
  lastCompleted,
}: ToggleButtonProps) => {
  const queryClient = useQueryClient();
  const toggleTaskMutation = useMutation({
    mutationKey: ["toggle-task"],
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
      if (taskType === "todo" && goalId && dueBy && todoId) {
        return await updateTodoByUser(
          { status: newStatus },
          userId,
          goalId,
          dueBy,
          todoId
        );
      }
    },
   onMutate: async (newStatus) => {
      await queryClient.cancelQueries({ queryKey: [queryKey] });
      const previousTasks = queryClient.getQueryData([queryKey]);
      if (taskType === "todo") {
        queryClient.setQueryData([queryKey], (old: Array<todoOutputType>) => {
          if (!old) return old;
          return old.map((todo: todoOutputType) =>
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
      console.error(_err);
      throw _err;
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
  });

  const onClick = () => {
    toggleTaskMutation.mutate(!completionStatus);
  };
  return (
    <button
      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
        completionStatus ? "border-blue-500" : "border-gray-400"
      }`}
      onClick={onClick}
    >
      {completionStatus && (
        <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
      )}
    </button>
  );
};

type DeleteButtonProps = {
  taskType: "habit" | "todo";
  userId: string;
  queryKey: string;
  goalId?: string;
  dueBy?: string;
  todoId?: string;
  habitId?: string;
};

export const DeleteButton = ({
  taskType,
  userId,
  queryKey,
  goalId,
  todoId,
  dueBy,
  habitId,
}: DeleteButtonProps) => {
  const queryClient = useQueryClient();
  const deleteTaskMutation = useMutation({
    mutationFn: async () => {
      if (taskType === "habit" && habitId) {
        return await deletehabitByUser(userId, habitId);
      }
      if (taskType === "todo" && goalId && dueBy && todoId) {
        return await deleteTodoByUser(userId, goalId, dueBy, todoId);
      }
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: [queryKey] });
      const previousTasks = queryClient.getQueryData([queryKey]);
      if (taskType === "todo") {
        queryClient.setQueryData([queryKey], (old: Array<todoOutputType>) => {
          if (!old) return old;
          return old.filter((todo: todoOutputType) => todo.todoId !== todoId)
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
      toast.success("Task deleted successfully");
    },
  });

  return (
    <button
      onClick={() => deleteTaskMutation.mutate()}
      disabled={deleteTaskMutation.isPending}
    >
      <FaRegTrashAlt />
    </button>
  );
};
