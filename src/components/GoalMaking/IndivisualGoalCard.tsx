import { goalOutputType } from "@/src/types/goalTypes";
import { convertToDate } from "@/src/utils/dateTimeUtils";
import { addWeeks, differenceInDays } from "date-fns";
import { Calendar, Clock, Star } from "lucide-react";
import randomColor from "randomcolor";
import React from "react";

const IndivisualGoalCard = ({ docData }: { docData: goalOutputType }) => {
  const createdAt = convertToDate(docData.createdAt);
  const daysBetween = differenceInDays(
    addWeeks(createdAt!, docData.weeks),
    new Date()
  );
  const progress = (docData.doneTodos/100)*docData.totalTodos
  return (
    <div className="bg-[#262636] border-slate-700 border-2 p-6 rounded-2xl mx-auto text-white relative ">
      {/* XP Badge */}
      <div className="absolute top-4 right-4 bg-yellow-600/20 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
        <Star className="w-4 h-4 text-yellow-400" />
        <span className="text-sm font-medium text-yellow-300">{docData.totalTodos} XP</span>
      </div>

      {/* Goal Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1">{docData.title}</h2>
      </div>

      {/* Career Tag */}
      <div className="mb-6 oerflow-clip">
        {docData.tags.map((tag, index) => {
          const tagColor = randomColor({
            hue: "blue",
            luminosity: "light",
          });

          return (
            <span
              key={index}
              style={{ backgroundColor: tagColor }}
              className="backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium border border-blue-400/30 mx-2"
            >
              {tag}
            </span>
          );
        })}
      </div>

      {/* Progress Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-300">Progress</span>
          <span className="text-sm font-medium text-white">{progress}%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-700/50 rounded-full h-2 mb-4">
          <div
            className="bg-gradient-to-r from-cyan-400 to-pink-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>{createdAt?.toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span className="font-medium">{daysBetween} days left</span>
        </div>
      </div>
    </div>
  );
};

export default IndivisualGoalCard;
