"use client";
import IndivisualGoalCard from "@/src/components/GoalMaking/IndivisualGoalCard";
import ProgressDashboard from "@/src/components/GoalMaking/ProgressCard";
import Loading from "@/src/components/Loading/Loading";
import { useAuth } from "@/src/hooks/useAuth";
import { getGoalsByUser } from "@/src/services/goalServices";
import { useQuery } from "@tanstack/react-query";
import React from "react";

const Goals = () => {
  const { user } = useAuth();
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
  return (

        <div className="min-h-screen p-4 mx-auto pb-24">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-white text-4xl font-light mb-2">Goals</h1>
          <div className="w-12 h-0.5 bg-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400 text-sm">Level up through achievement</p>
        </div>
        <ProgressDashboard
          goals={user!.goalsCount}
          streak={user!.dayStreak}
          badges={user!.badgesCount}
          xp={user!.xp}
        />
        {data?.length !== 0 ? (
          data?.map((doc, index) => (
            <IndivisualGoalCard docData={doc} key={index} />
          ))
        ) : (
          <>no goals</>
        )}
      </div>
    </div>
  );
};

export default Goals;
