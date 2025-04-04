import React from "react";
import { todoType } from "../../types/todoTypes";
import { ToggleButton } from "./button";
import { habitType } from "@/src/types/habitTypes";


export const TodoTaskItem = ({data}: {data: todoType}) => {
  const { title, status, goalId, type, todoId } = data;
  return (
    <div>
      <ToggleButton
        taskType="todo"
        completionStatus={status}
        userId={"CFOsu6H7SS6Y5MlLBJf3"}
        goalId={goalId}
        todoType={type}
        todoId={todoId}
      />
      {title}
    </div>
  );
};

export const HabitTaskItem = ({data}: {data: habitType}) => {
  const { title, status, habitId, } = data;
  return (
    <div>
      <ToggleButton
        taskType="habit"
        completionStatus={status}
        userId={"CFOsu6H7SS6Y5MlLBJf3"}
        habitId={habitId}
      />
      {title}
    </div>
  );
}