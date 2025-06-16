"use client";
import React from "react";
import { HabitTaskItem, TodoTaskItem } from "./TaskItem";
import { habitType } from "@/src/types/habitTypes";
import { todoOutputType } from "@/src/types/todoTypes";

export const TodoTaskItemMapper = ({
  data,
  dueBy,
  queryKey,
}: {
 queryKey: string;
  data: todoOutputType[];
  dueBy: string;
}) => {
  return (
    <ul>
      {data.map((todo, index) => (
        <TodoTaskItem queryKey={queryKey} key={index} data={todo} dueBy={dueBy} />
      ))}
    </ul>
  );
};

export const HabitTaskItemMapper = ({
  data,
queryKey,
}: {
 queryKey: string;
  data: habitType[];
}) => {
  return (
    <ul className="p-4">
      {data.map((habit, index) => (
        <HabitTaskItem queryKey={queryKey} key={index} data={habit} />
      ))}
    </ul>
  );
};
