"use client";
import { useAuth } from "@/src/hooks/useAuth";
import { getTodaysTasks } from "@/src/services/goalServices";
import { getHabitsByUser } from "@/src/services/habitServices";
import { formatDate } from "@/src/utils/dateTimeUtils";
import { useQuery } from "@tanstack/react-query";
import Loading from "../Loading/Loading";
import { addConsistencyDateData } from "@/src/services/progressServices";

export const TasksGate = ({ children }: { children: React.ReactNode }) => {

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
      const taskIds = data.map(({ habitId }) => habitId); 
      await addConsistencyDateData({userId: user!.userId, date: formatDate(new Date()), totalTasks: data.length, taskIds: taskIds})
      return data;
    },
  });
  if (goalsQuery.isLoading || habitsQuery.isLoading) {
    return <Loading />;
  }
  if (goalsQuery.isError || habitsQuery.isError) {
    return <>Some error occured</>;
  }
  return <>{children}</>;
};
