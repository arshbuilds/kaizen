import React from "react";
import { todoOutputType } from "../../types/todoTypes";
import { DeleteButton, ToggleButton } from "./TaskButtons";
import { habitType } from "@/src/types/habitTypes";
import { useAuth } from "@/src/hooks/useAuth";

export const TodoTaskItem = ({ data, goalId, dueBy}: { data: todoOutputType, goalId: string , dueBy: string}) => {
  const { title, status, description, priority, todoId } = data;
  const { user } = useAuth();
  return (
    <div>
      <ToggleButton
        taskType="todo"
        completionStatus={status}
        userId={user!.userId}
        goalId={goalId}
        dueBy={dueBy}
        todoId={todoId}
      />
      {title}, {description}, {priority}
      <DeleteButton
        taskType="todo"
        userId={user!.userId}
        goalId={goalId}
        dueBy={dueBy}
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
