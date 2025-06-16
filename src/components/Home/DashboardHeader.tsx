"use client";
import { useAuth } from "@/src/hooks/useAuth";
import React from "react";
import { FaCloud } from "react-icons/fa";

const DashboardHeader = () => {
  const { user } = useAuth();
  const today = new Date().getDay();
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-medium text-gray-300">
          Good morning, {user?.userName}
        </h1>
        <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
          <span>{today}</span>
          <span>•</span>
          <div className="flex items-center gap-1">
            <FaCloud className="w-4 h-4" />
            <span>Feeling Focused</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
