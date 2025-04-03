"use client";
import { updateTodoByUser } from "@/src/services/todoServices";
import React from "react";

type Props = {
  completionStatus: boolean;
  userId: string;
  goalId: string;
  todoType: string;
  todoId: string;
};

const ToggleButton = ({
  completionStatus,
  userId,
  goalId,
  todoType,
  todoId,
}: Props) => {
  const toggleCompletionStatus = () => {
    updateTodoByUser(
      { status: !completionStatus },
      userId,
      goalId,
      todoType,
      todoId
    );
  };
  return (
    <button className="bg-white" onClick={toggleCompletionStatus}>
      Add Todo
    </button>
  );
};

export default ToggleButton;
