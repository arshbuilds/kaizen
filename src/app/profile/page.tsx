"use client";
import Loading from "@/src/components/Loading/Loading";
import AchievementsSection from "@/src/components/Profile/AchievementsSection";
// import GrowthCoinsSection from "@/src/components/Profile/GrowthCoinsSection";
import UserData from "@/src/components/Profile/UserData";
import BarGraph from "@/src/components/Progress/BarGraph";
import Calendar from "@/src/components/Progress/Calendar";
import LineChart from "@/src/components/Progress/LineChart";
import MotivationCard from "@/src/components/Progress/MotivationCard";
import StatsCard from "@/src/components/Progress/StatsCard";
import { getGoalsByUser } from "@/src/services/goalServices";
import { getConsistencyData } from "@/src/services/progressServices";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { formatDate } from "@/src/utils/dateTimeUtils";
import { getCompletionRate } from "@/src/utils/genUtils";
import { getProfileStats } from "@/src/utils/taskUtils";
import { useQuery } from "@tanstack/react-query";
import React from "react";

// TODO:- continue later
const Profile = () => {
  const { user, loading } = useAuthStore();
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth();
  const goalsQuery = useQuery({
    queryKey: ["goals"],
    queryFn: async () => {
      return (await getGoalsByUser(user!.userId)).filter((doc) => {
        return doc.title !== "general";
      });
    },
  });
  const calendarQuery = useQuery({
    enabled: !!user,
    queryKey: [user!.userId, "calendar"],
    queryFn: async () => {
      if (!user) throw new Error("User not available");
      return await getConsistencyData({ userId: user.userId, year, month });
    },
  });

  if (goalsQuery.isPending || calendarQuery.isPending) return <Loading/>;
  if (goalsQuery.isError || calendarQuery.isError) return <>Error loading calendar</>;
  const rate = getCompletionRate(calendarQuery.data!);
  const today = calendarQuery.data![formatDate(new Date())];
  if (user === null) {
    return <>Please login first</>;
  }
  if (loading) {
    return <>loading</>;
  }

  const {timeSpentInHours, tasksCompleted} = getProfileStats(goalsQuery.data)
  return (
    <div className="min-h-screen p-4 mx-auto pb-24 pt-12">
      <div className="space-y-6">
        <UserData
          name={user.userName}
          role={user.role}
          pfpUrl={user.pfpUrl}
          createdAt={user.createdAt}
          interests={user.interests}
          followers={user.followersCount}
          following={user.followingCount}
          goals={user.goalsCount}
        />
        <AchievementsSection
          dayStreak={user.dayStreak}
          timeSpent={timeSpentInHours}
          tasksCompleted={tasksCompleted}
        />
        <StatsCard
          dayStreak={user!.dayStreak}
          bestStreak={user!.bestStreak}
          monthlyProgress={rate}
          todayTasks={today.doneCount + today.notDoneCount}
        />
        <Calendar data={calendarQuery.data} month={month} year={year} />
        <BarGraph data={calendarQuery.data} />
        <LineChart data={calendarQuery.data} />
        <MotivationCard/>
      </div>
    </div>
  );
};

export default Profile;
