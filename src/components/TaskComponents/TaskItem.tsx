import React from "react";
import { todoType } from "../../types/todoTypes";
import ToggleButton from "./button";

type TodoTaskItemProps = {
  data: todoType;
};

export const TodoTaskItem = (props: TodoTaskItemProps) => {
  const { title, status, goalId, type, todoId} = props.data;
  return (
    <div>
      <ToggleButton
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
