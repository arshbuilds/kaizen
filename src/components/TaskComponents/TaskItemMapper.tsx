"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getTodosByUser } from "@/src/services/todoServices";
import { HabitTaskItem, TodoTaskItem } from "./TaskItem";
import { getHabitsByUser } from "@/src/services/habitServices";
import { habitType } from "@/src/types/habitTypes";
import { wasCompletedYesterday } from "@/src/lib/utils";

type todoTaskItemMapperProps = {
  goalId: string;
  type: string;
  userId: string;
};
export const TodoTaskItemMapper = ({
  goalId,
  type,
  userId,
}: todoTaskItemMapperProps) => {
  const { isPending, isError, data, error } = useQuery({
    queryKey: [`${type}-todos`],
    queryFn: async () => {
      const data = await getTodosByUser(userId, goalId, type);
      return data;
    },
  });

  if (isPending) {
    return <span>Loading...</span>;
  }

  if (isError) {
    return <span>Error: {error.message}</span>;
  }

  return (
    <ul>
      {data.map((todo, index) => (
        <TodoTaskItem key={index} data={todo} />
      ))}
    </ul>
  );
};

type habitTaskItemMapperProps = {
  userId: string;
};

export const HabitTaskItemMapper = ({ userId }: habitTaskItemMapperProps) => {

  const { isPending, isError, data, error } = useQuery({
    queryKey: [`habits`],
    queryFn: async () => await getHabitsByUser(userId),
    select: (data) => {
      return data.map((habit: habitType) => {
        console.log(wasCompletedYesterday(habit.lastCompleted))
        return ({
        ...habit,
        streak: wasCompletedYesterday(habit.lastCompleted) ? habit.streak : 0,
      })});
    },
  });

  if (isPending) {
    return <span>Loading...</span>;
  }

  if (isError) {
    return <span>Error: {error.message}</span>;
  }

  return (
    <ul>
      {data.map((habit, index) => (
        <HabitTaskItem key={index} data={habit} />
      ))}
    </ul>
  );
};
