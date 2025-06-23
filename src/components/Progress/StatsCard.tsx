import React from "react";

const StatsCard = ({
  dayStreak,
  bestStreak,
  todayTasks,
  monthlyProgress,
}: {
  dayStreak: number;
  bestStreak: number;
  todayTasks: number;
  monthlyProgress: number;
}) => {
  return (
    <div className="max-w-sm rounded-xl bg-[#262636] border border-purple-400/30 p-6 shadow-lg text-white">
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-yellow-400 text-xl">🏆</span>
          <span className="text-lg font-semibold">Your Progress So Far</span>
        </div>
        <div className="flex justify-between mb-4">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-cyan-300">
              {dayStreak}
            </span>
            <span className="text-xs text-gray-300">Current Streak</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-purple-300">
              {todayTasks}
            </span>
            <span className="text-xs text-gray-300">Today&apos;s tasks</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-lime-400">
              {bestStreak}
            </span>
            <span className="text-xs text-gray-300">Longest Streak</span>
          </div>
        </div>
        <div className="text-sm mb-1 flex justify-between">
          <span className="text-gray-200">Monthly Goal Progress</span>
          <span className="font-semibold text-blue-300">{monthlyProgress}%</span>
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-[#32255a] rounded-full h-2.5">
          <div
            className="bg-blue-400 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${monthlyProgress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
