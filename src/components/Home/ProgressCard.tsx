"use client"
import { Card } from "@/components/ui/card";
import { useAuth } from "@/src/hooks/useAuth";
import { getTodaysTasks } from "@/src/services/goalServices";
import { getHabitsByUser } from "@/src/services/habitServices";
import { formatDate } from "@/src/utils/dateTimeUtils";
import { useQuery } from "@tanstack/react-query";
import Loading from "../Loading/Loading";
import { getTodayProgress } from "@/src/utils/taskUtils";
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

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
          <CircularProgressbar value={progress} text={`${progress}%`} />
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
