"use client"
import { Card } from "@/components/ui/card";
import { useAuth } from "@/src/hooks/useAuth";
import { getTodaysTasks } from "@/src/services/goalServices";
import { getHabitsByUser } from "@/src/services/habitServices";
import { formatDate } from "@/src/utils/dateTimeUtils";
import { useQuery } from "@tanstack/react-query";
import Loading from "../Loading/Loading";
import { getTodayProgress } from "@/src/utils/taskUtils";

const ProgressCard = () => {
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
  const {totalTasks, doneTasks, progress} = getTodayProgress(habitsQuery!.data ?? [], goalsQuery!.data?? [])
  return (
    <Card className="bg-[#262636] border-slate-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Today&apos;s Progress</h2>
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="rgb(51 65 85)"
              strokeWidth="2"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="rgb(34 197 94)"
              strokeWidth="2"
              strokeDasharray="60, 100"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-green-400">{progress}%</span>
          </div>
        </div>
      </div>
      <div className="text-white font-medium mb-2">{doneTasks}/{totalTasks} Tasks Done</div>
      <div className="text-sm text-gray-400 italic">
        &quot;Small steps today lead to giant leaps tomorrow.&quot;
      </div>
    </Card>
  );
}

export default ProgressCard;
