"use client";
import { useAuthStore } from "@/src/stores/useAuthStore";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getConsistencyData } from "@/src/services/progressServices";
import { getCompletionRate } from "@/src/utils/genUtils";
import Calendar from "@/src/components/Progress/Calendar";
import BarGraph from "@/src/components/Progress/BarGraph";
import StatsCard from "@/src/components/Progress/StatsCard";
import { formatDate } from "@/src/utils/dateTimeUtils";
import LineChart from "@/src/components/Progress/LineChart";
import MotivationCard from "@/src/components/Progress/MotivationCard";

const Progress = () => {
  const { user } = useAuthStore();
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth();
  const { isPending, isError, data } = useQuery({
    enabled: !!user,
    queryKey: [user!.userId, "calendar"],
    queryFn: async () => {
      if (!user) throw new Error("User not available");
      return await getConsistencyData({ userId: user.userId, year, month });
    },
  });

  if (isPending) return <>Fetching calendar...</>;
  if (isError) return <>Error loading calendar</>;
  const rate = getCompletionRate(data!);
  const today = data![formatDate(new Date())];

  return (
    <div className="min-h-screen p-4 mx-auto">
      <div className="space-y-6">
        <StatsCard
          dayStreak={user!.dayStreak}
          bestStreak={user!.bestStreak}
          monthlyProgress={rate}
          todayTasks={today.doneCount + today.notDoneCount}
        />
        <Calendar data={data!} month={month} year={year} />
        <BarGraph data={data!} />
        <LineChart data={data!} />
        <MotivationCard/>
      </div>
    </div>
  );
};

export default Progress;
