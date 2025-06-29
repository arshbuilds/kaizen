"use client";
import Loading from "@/src/components/Loading/Loading";
import AchievementsSection from "@/src/components/Profile/AchievementsSection";
import ProfileSettings from "@/src/components/Profile/ProfileSettings";
// import GrowthCoinsSection from "@/src/components/Profile/GrowthCoinsSection";
import UserData from "@/src/components/Profile/UserData";
import { getGoalsByUser } from "@/src/services/goalServices";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { getProfileStats } from "@/src/utils/taskUtils";
import { useQuery } from "@tanstack/react-query";
import React from "react";

// TODO:- continue later
const Profile = () => {
  const { user, loading } = useAuthStore();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["goals"],
    queryFn: async () => {
      return (await getGoalsByUser(user!.userId)).filter((doc) => {
        return doc.title !== "general";
      });
    },
  });
  if (isLoading) {
    return <Loading />;
  }
  if (isError) {
    return <>Some error occured</>;
  }
  if (user === null) {
    return <>Please login first</>;
  }
  if (loading) {
    return <>loading</>;
  }

  const {timeSpentInHours, tasksCompleted} = getProfileStats(data!)
  return (
    <div className="min-h-screen p-4 mx-auto pb-24">
      <div className="space-y-6">
        <UserData
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
        <ProfileSettings/>

      </div>
    </div>
  );
};

export default Profile;
