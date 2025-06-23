import React from "react";

const MotivationCard = () => {
  return (
    <div className="max-w-xs mx-auto rounded-xl border border-purple-400/30 bg-[#262636] bg-opacity-90 shadow-md p-6 flex flex-col items-center text-center">
      <span className="text-2xl mb-2">✨</span>
      <div className="font-semibold text-white text-lg mb-1">
        Keep going! You&apos;re evolving every day.
      </div>
      <div className="text-sm text-purple-100">
        Small steps lead to extraordinary results
      </div>
    </div>
  );
};

export default MotivationCard;
