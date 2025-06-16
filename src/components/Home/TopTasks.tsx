"use client";
import React from "react";
import { TodoTaskItemMapper } from "../TaskComponents/TaskItemMapper";
import { formatDate } from "@/src/utils/dateTimeUtils";
import { useQuery } from "@tanstack/react-query";
import { getTodaysTasks } from "@/src/services/goalServices";
import { useAuth } from "@/src/hooks/useAuth";
import Loading from "../Loading/Loading";

const TopTasks = () => {
  const { user } = useAuth();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["todos"],
    queryFn: async () => {
      const data = await getTodaysTasks(user!.userId, formatDate(new Date()));
      return data.sort((a, b) => {
        return Number(a.priority) - Number(b.priority);
      });
    },
  });
  if (isLoading) {
    return <Loading />;
  }
  if (isError) {
    return <>some error occured</>;
  }
  return (
    <div>
      <TodoTaskItemMapper
        data={data!.slice(0,2)}
        queryKey="todos"
        dueBy={formatDate(new Date())}
      />
    </div>
  );
};

export default TopTasks;
