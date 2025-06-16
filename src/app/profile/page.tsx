"use client";
import AchievementsSection from "@/src/components/Profile/AchievementsSection";
import GrowthCoinsSection from "@/src/components/Profile/GrowthCoinsSection";
import UserData from "@/src/components/Profile/UserData";
import { useAuthStore } from "@/src/stores/useAuthStore";
import React from "react";

// TODO:- continue later
const Profile = () => {
  const { user, loading } = useAuthStore();

  if (user === null) {
    return <>Please login first</>;
  }
  if (loading) {
    return <>loading</>;
  }
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 space-y-6">
      <UserData
        pfpUrl={user.pfpUrl}
        createdAt={user.createdAt}
        interests={user.interests}
        followers={user.followersCount}
        following={user.followingCount}
        goals={user.goalsCount}
      />
      <div className="flex flex-row gap-4">
        {/* <DailyStatCard
          icon={FaBrain}
          title="Daily Focus"
          hours={user.dailyFocusHours}
          hourDelta={user.dailyFocusDelta}
        />
        <DailyStatCard
          icon={FaHeartbeat}
          title="Wellbeing Score"
          score={user.wellbeingScore}
          scoreDelta={user.wellbeingDelta}
        /> */}
      </div>
      <AchievementsSection
        dayStreak={user.dayStreak}
        meditationHours={user.meditationHours}
        badgesCount={user.badgesCount}
      />
      <GrowthCoinsSection
        todayCoins={user.todayCoins}
        totalCoins={user.todayCoins}
        weeklyCoins={user.weeklyCoins}
        percentileRank={user.percentileRank}
      />
    </div>
  );
};

export default Profile;
