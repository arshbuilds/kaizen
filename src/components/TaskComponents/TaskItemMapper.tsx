"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getTodosByUser } from "@/src/services/todoServices";
import { HabitTaskItem, TodoTaskItem } from "./TaskItem";
import { getHabitsByUser } from "@/src/services/habitServices";
import { habitType } from "@/src/types/habitTypes";
import { wasCompletedYesterday } from "@/src/utils/dateTimeUtils";
import { useAuth } from "@/src/hooks/useAuth";
import Loading from "../Loading/Loading";

type todoTaskItemMapperProps = {
  goalId: string;
  type: string;
  timeRange: "today"| "all"
};
export const TodoTaskItemMapper = ({
  goalId,
  type,
  timeRange
}: todoTaskItemMapperProps) => {
  const {user} = useAuth()
  const { isPending, isError, data, error } = useQuery({
    queryKey: [`${type}-todos`],
    queryFn: async () => {
      const data = await getTodosByUser(user!.userId, goalId, type, timeRange);
      return data;
    },
  });

  if (isPending) {
    return <Loading/>;
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


export const HabitTaskItemMapper = () => {
  const {user} = useAuth()
  const { isPending, isError, data, error } = useQuery({
    queryKey: [`habits`],
    queryFn: async () => await getHabitsByUser(user!.userId),
    select: (data) => {
      return data.map((habit: habitType) => ({
        ...habit,
        streak: wasCompletedYesterday(habit.lastCompleted) ? habit.streak : 0,
      }));
    },
  });

  if (isPending) {
    return <Loading/>;
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
