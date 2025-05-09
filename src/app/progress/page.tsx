"use client";
import { ProgressCard } from "@/src/components/ui/cards";
import { useAuthStore } from "@/src/stores/useAuthStore";
import React from "react";
import { FaFireAlt, FaFire } from "react-icons/fa";
import { AiOutlineRise } from "react-icons/ai";
import { useQuery } from "@tanstack/react-query";
import { getConsistencyData } from "@/src/services/progressServices";
import { getCompletionRate } from "@/src/utils/genUtils";
import Calendar from "@/src/components/Progress/Calendar";
import BarGraph from "@/src/components/Progress/BarGraph";

const Progress = () => {
  const { user, loading } = useAuthStore();
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth();
  const { isPending, isError, data } = useQuery({
    queryKey: user
      ? [user.userId, "calendar"]
      : ["calendar", "unauthenticated"],
    enabled: !!user && !loading, // Only runs query when user is available
    queryFn: async () => {
      if (!user) throw new Error("User not available");
      return await getConsistencyData({ userId: user.userId, year, month });
    },
  });

  // UI guards
  if (loading) return <>Loading...</>;
  if (!user) return <>Please login first</>;
  if (isPending) return <>Fetching calendar...</>;
  if (isError) return <>Error loading calendar</>;

  const rate = getCompletionRate(data!);
  return (
    <div className="overflow-x-hidden w-full mx-auto px-4 sm:px-6 md:px-8 space-y-6 my-4">
      <Calendar data={data!} month={month} year={year} />
      <div className="flex justify-center gap-4 w-full overflow-hidden">
        <ProgressCard
          Icon={FaFire}
          info={`Best: ${user.bestStreak}`}
          title={"Current Streak"}
          cardValue={user.dayStreak}
          unit={"Days"}
          iconColor="#af5e38"
        />
        <ProgressCard
          Icon={AiOutlineRise}
          info={``}
          title={"Completion Rate"}
          cardValue={rate}
          unit={"%"}
          iconColor="#198865"
        />
        <ProgressCard
          Icon={FaFireAlt}
          info={``}
          title={"Best Streak"}
          cardValue={user.bestStreak}
          unit={"Days"}
          iconColor="#ff9a00"
        />
      </div>
      <BarGraph data={data!} />
    </div>
  );
};

export default Progress;
