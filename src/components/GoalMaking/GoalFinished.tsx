"use client";
import { useAuth } from "@/src/hooks/useAuth";
import { getGoalByUser, updateGoal } from "@/src/services/goalServices";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import Loading from "../Loading/Loading";
import { Bell, Clock, Sparkles, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const GoalFinished = () => {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const goalId = searchParams.get("id")!

  const { data, isLoading, isError } = useQuery({
    queryKey: ["goal", goalId], // include goalId in the key
    queryFn: () => getGoalByUser({ userId: user!.userId, goalId }), // no await in queryFn
  });

  const goalCompleted = useMutation({
    mutationFn: () =>
      updateGoal({
        data: { isCompleted: true },
        userId: user!.userId,
        goalId: goalId,
      }),
    onSuccess: () => {
      toast.success("Goal finished");
      router.push("/");
    },
  });

  if (!user) return <Loading />;
  if (isLoading) return <Loading />;
  if (isError || !data) return <>Error occurred</>;
  return (
    <div className="min-h-screen  text-white p-6 flex flex-col items-center justify-center max-w-sm mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">
          <span className="text-white">Goal</span>{" "}
          <span className="text-green-400">Complete</span>
        </h1>
        <p className="text-gray-400 text-sm">Outstanding Achievement</p>
      </div>

      {/* Goal Title */}
      <h2 className="text-xl font-semibold text-center mb-12 px-4">
        {data?.title}
      </h2>

      {/* Central Progress Circle */}
      <div className="relative mb-16">
        {/* Outer decorative dots */}
        <div className="absolute inset-0 w-48 h-48">
          <div className="absolute top-4 left-1/2 w-2 h-2 bg-green-400 rounded-full transform -translate-x-1/2"></div>
          <div className="absolute top-8 right-8 w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
          <div className="absolute bottom-8 left-8 w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
          <div className="absolute bottom-4 right-1/3 w-1 h-1 bg-teal-400 rounded-full"></div>
        </div>

        {/* Main circle */}
        <div className="w-32 h-32 rounded-full border-2 border-gray-700 flex items-center justify-center relative">
          <div className="w-24 h-24 rounded-full border border-gray-600 flex items-center justify-center">
            <Bell className="w-8 h-8 text-gray-300" />
          </div>
          {/* Progress ring */}
          <div className="absolute inset-0 rounded-full border-2 border-green-400"></div>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-4 w-full mb-12">
        <div className="flex items-center justify-between bg-[#262636]/50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center">
              <Clock className="w-4 h-4 text-teal-400" />
            </div>
            <span className="text-gray-300">Duration</span>
          </div>
          <span className="text-white font-medium">{data!.weeks * 7} days</span>
        </div>

        <div className="flex items-center justify-between bg-[#262636]/50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <span className="text-gray-300">Progress</span>
          </div>
          <span className="text-white font-medium">
            {data?.weeks} of {data?.weeks}
          </span>
        </div>

        <div className="flex items-center justify-between bg-[#262636]/50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-gray-300">Experience</span>
          </div>
          <span className="text-white font-medium">{data?.totalTodos} XP</span>
        </div>
      </div>

      {/* Bottom Quote */}
      <p className="text-gray-400 text-sm text-center mb-8 px-4">
        Excellence is a continuous journey
      </p>

      {/* Continue Button */}
      <button
        onClick={() => goalCompleted.mutate()}
        className="w-full bg-transparent border border-teal-500 text-teal-400 hover:bg-teal-500/10 font-medium tracking-wide py-2 px-4"
      >
        {">"} CONTINUE JOURNEY
      </button>
    </div>
  );
};

export default GoalFinished;
