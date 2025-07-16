import React from "react";
import { todoOutputType } from "../../types/todoTypes";
import { DeleteButton, ToggleButton } from "./TaskButtons";
import { useAuth } from "@/src/hooks/useAuth";
import { habitOutputType } from "@/src/types/habitTypes";
import clsx from "clsx";

export const TodoTaskItem = ({
  data,
  dueBy,
  queryKey,
}: {
  data: todoOutputType;
  dueBy: string;
  queryKey: string;
}) => {
  const { title, status, description, todoId, goalId, timeRequired } =
    data;
  const { user } = useAuth();

  return (
    <li
      className="border-1 border-gray-600 p-2 flex items-center my-4 min-h-28 backdrop-filter backdrop-blur-lg bg-[#262636]/60 rounded-2xl">
      {/* left – checkbox */}
      <div className="flex-shrink-0 w-8 flex justify-center items-center">
        <ToggleButton
          taskType="todo"
          completionStatus={status}
          userId={user!.userId}
          goalId={goalId}
          dueBy={dueBy}
          todoId={todoId}
          queryKey={queryKey}
          timeRequired={timeRequired}
        />
      </div>

      {/* middle – content should be allowed to shrink */}
      <div className="flex-1 min-w-0 px-4">
        {/* min-w-0 keeps this column from forcing overflow[2] */}
        <span
          className={clsx(
            `block text-md font-bold text-gray-300 truncate`,
            status && "line-through text-gray-500"
          )}
        >
          {title}
        </span>
        <span className="block text-sm text-gray-400">{description}</span>
      </div>

      {/* right – delete button with fixed box so it cannot protrude */}
      <div className="flex-shrink-0 w-10 h-10 flex justify-center items-center">
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
  data: habitOutputType;
  queryKey: string;
}) => {
  const { title, status, habitId, streak, lastCompleted, timeRequired } = data;
  const { user } = useAuth();
  return (
    <li className="bg-[#262636]/60 border-l-4 rounded-lg p-2 flex items-center my-2 min-h-28">
      {/* left – checkbox */}
      <div className="flex-shrink-0 w-8 flex justify-center items-center">
        <ToggleButton
          taskType="habit"
          completionStatus={status}
          userId={user!.userId}
          habitId={habitId}
          streak={streak}
          lastCompleted={lastCompleted}
          queryKey={queryKey}
          timeRequired={timeRequired}
        />
      </div>

      <div className="flex-1 min-w-0 px-4">
        <span className="block text-md font-bold text-gray-300 truncate">
          {title}
        </span>
        <span className="block text-sm text-gray-400">{streak} day streak</span>
      </div>
      <div className="flex-shrink-0 w-10 h-10 flex justify-center items-center">
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
