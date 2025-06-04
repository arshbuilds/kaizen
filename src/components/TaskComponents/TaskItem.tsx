import React from "react";
import { todoOutputType } from "../../types/todoTypes";
import { DeleteButton, ToggleButton } from "./TaskButtons";
import { habitType } from "@/src/types/habitTypes";
import { useAuth } from "@/src/hooks/useAuth";

export const TodoTaskItem = ({
  data,
  dueBy,
  queryKey,
}: {
  data: todoOutputType;
  dueBy: string;
  queryKey: string;
}) => {
  const { title, status, description, priority, todoId, goalId } = data;
  const { user } = useAuth();

  return (
    <li
      className="bg-gray-800 border-l-4 rounded-lg p-2 flex items-center my-2 min-h-28"
      style={{
        borderColor:
          priority === "high"
            ? "#ef4444"
            : priority === "medium"
            ? "#facc15"
            : "#22c55e",
      }}
    >
      <div className="w-8 flex-shrink-0 flex justify-center">
        <ToggleButton
          taskType="todo"
          completionStatus={status}
          userId={user!.userId}
          goalId={goalId}
          dueBy={dueBy}
          todoId={todoId}
          queryKey={queryKey}
        />
      </div>

      {/* Content */}
      <div className="flex-1 px-4">
        <span className="block text-md font-bold text-gray-300 truncate">
          {title}
        </span>
        <span className="block text-sm text-gray-400">{description}</span>
        <span
          className="w-max text-center bg-[#121212] rounded-xl p-2 py-1 text-xs border-1"
          style={{
            borderColor:
              priority === "high"
                ? "#ef4444"
                : priority === "medium"
                ? "#facc15"
                : "#22c55e",
          }}
        >
          {priority}
        </span>
      </div>

      <div className="w-16 flex-shrink-0 flex justify-center">
        <DeleteButton
          taskType="todo"
          userId={user!.userId}
          goalId={goalId}
          dueBy={dueBy}
          todoId={todoId}
          queryKey={queryKey}
        />
      </div>
    </li>
  );
};

export const HabitTaskItem = ({
  data,
  queryKey,
}: {
  data: habitType;
  queryKey: string;
}) => {
  const { title, status, habitId, streak, lastCompleted } = data;
  const { user } = useAuth();
  return (
    <li className="bg-gray-800 border-l-4 rounded-lg p-2 flex items-center my-2 min-h-20">
      <div className="w-8 flex-shrink-0 flex justify-center">
        <ToggleButton
          taskType="habit"
          completionStatus={status}
          userId={user!.userId}
          habitId={habitId}
          streak={streak}
          lastCompleted={lastCompleted}
          queryKey={queryKey}
        />
      </div>

      <div className="flex-1 px-4 flex flex-col justify-center">
        <span>{title}</span>
        <span className="text-gray-400 text-sm">streak - {streak}</span>
      </div>

      <div className="w-16 flex-shrink-0 flex justify-center">
        <DeleteButton
          taskType="habit"
          queryKey={queryKey}
          userId={user!.userId}
          habitId={habitId}
        />
      </div>
    </li>
  );
};
