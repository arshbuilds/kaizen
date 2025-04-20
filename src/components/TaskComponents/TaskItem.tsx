import React from "react";
import { todoType } from "../../types/todoTypes";
import { DeleteButton, ToggleButton } from "./TaskButtons";
import { habitType } from "@/src/types/habitTypes";
import { useAuth } from "@/src/hooks/useAuth";

export const TodoTaskItem = ({ data }: { data: todoType }) => {
  const { title, status, goalId, type, todoId } = data;
  const { user } = useAuth();
  return (
    <div>
      <ToggleButton
        taskType="todo"
        completionStatus={status}
        userId={user!.userId}
        goalId={goalId}
        todoType={type}
        todoId={todoId}
      />
      {title}
      <DeleteButton
        taskType="todo"
        userId={user!.userId}
        goalId={goalId}
        todoType={type}
        todoId={todoId}
      />
    </div>
  );
};

export const HabitTaskItem = ({ data }: { data: habitType }) => {
  const { title, status, habitId, streak, lastCompleted } = data;
  const { user } = useAuth();
  return (
    <div>
      <ToggleButton
        taskType="habit"
        completionStatus={status}
        userId={user!.userId}
        habitId={habitId}
        streak={streak}
        lastCompleted={lastCompleted}
      />
      {title}
      <DeleteButton taskType="habit" userId={user!.userId} habitId={habitId} />
    </div>
  );
};
