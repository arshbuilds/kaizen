"use client";
import React from "react";
import { Flame, Trophy, Zap } from "lucide-react";

const ProgressDashboard = ({
  goals,
  streak,
  badges,
  xp,
}: {
  goals: number;
  streak: number;
  badges: number;
  xp: number;
}) => {
  return (
    <div className="bg-[#262636] border-slate-700 border-2 p-6 rounded-2xl max-w-sm mx-auto text-white">
      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {/* Goals */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-blue-600/30 rounded-full flex items-center justify-center mb-2">
            {goals}
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">{streak}</div>
            <span className="text-xs text-gray-300 uppercase tracking-wide">
              goals
            </span>
          </div>
        </div>
        {/* Streak */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-orange-600/30 rounded-full flex items-center justify-center mb-2">
            <Flame className="w-5 h-5 text-orange-400" />
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">{streak}</div>
            <span className="text-xs text-gray-300 uppercase tracking-wide">
              Streak
            </span>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-purple-600/30 rounded-full flex items-center justify-center mb-2">
            <Trophy className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">{badges}</div>
            <span className="text-xs text-gray-300 uppercase tracking-wide">
              Badges
            </span>
          </div>
        </div>

        {/* Total XP */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-yellow-600/30 rounded-full flex items-center justify-center mb-2">
            <Zap className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">{xp}</div>
            <span className="text-xs text-gray-300 uppercase tracking-wide">
              Total XP
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressDashboard;
