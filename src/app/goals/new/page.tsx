import GetTodosFromPrompt from "@/src/components/GoalMaking/GetTodosFromPrompt";
import React from "react";

const NewGoal = () => {
  return (
    <div className="min-h-screen p-4 mx-auto">
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-white text-2xl font-bold mb-2">
            Create Your Goal
          </h1>
          <p className="text-gray-400 text-sm">
            Break it down step by step to achieve it
          </p>
        </div>
        <GetTodosFromPrompt />
      </div>
    </div>
  );
};

export default NewGoal;
