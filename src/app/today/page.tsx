"use client";
import Loading from "@/src/components/Loading/Loading";
import CreateNewTaskBottomSheet from "@/src/components/TaskComponents/CreateNewTaskBottomSheet";
import {
  HabitTaskItemMapper,
  TodoTaskItemMapper,
} from "@/src/components/TaskComponents/TaskItemMapper";
import { useAuth } from "@/src/hooks/useAuth";
import { getTodaysTasks } from "@/src/services/goalServices";
import { getHabitsByUser } from "@/src/services/habitServices";
import { formatDate } from "@/src/utils/dateTimeUtils";
import { useQuery } from "@tanstack/react-query";
import React from "react";

const Today = () => {
  const { user } = useAuth();
  const dueBy = formatDate(new Date());
  const goalsQuery = useQuery({
    queryKey: ["todos"],
    queryFn: async () => {
      const data = await getTodaysTasks(user!.userId, dueBy);
      return data;
    },
  });
  const habitsQuery = useQuery({
    queryKey: ["habits"],
    queryFn: async () => {
      const data = await getHabitsByUser(user!.userId);
      return data;
    },
  });
  if (goalsQuery.isLoading || habitsQuery.isLoading) {
    return <Loading />;
  }
  if (goalsQuery.isError || habitsQuery.isError) {
    return <>Some error occured</>;
  }

  return (
    <div>
      <CreateNewTaskBottomSheet />
      {goalsQuery.data ? (
        <TodoTaskItemMapper
          queryKey={"todos"}
          data={goalsQuery.data}
          dueBy={dueBy}
        />
      ) : (
        <>There are no todos left for today</>
      )}
      {habitsQuery.data ? (
        <HabitTaskItemMapper queryKey={"habits"} data={habitsQuery.data} />
      ) : (
        <>There are no todos left for today</>
      )}
    </div>
  );
};

export default Today;
