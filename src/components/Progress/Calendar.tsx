"use client";
import React from "react";
import { MonthStats } from "@/src/types/progressTypes";

const Calendar = ({
  data,
}: {
  data: MonthStats;
  month: number;
  year: number;
}) => {
  const getColor = (doneCount: number, notDoneCount: number) => {
    const totalTasks = doneCount + notDoneCount;
    const percentageDone =
      totalTasks === 0 ? 0 : (doneCount / totalTasks) * 100;
    if (percentageDone >= 85) return "#50b4d1";
    if (percentageDone >= 70 && percentageDone < 85) return "#467fa4";
    if (percentageDone >= 55 && percentageDone < 70) return "#40648d";
    if (percentageDone >= 40 && percentageDone < 55) return "#3b4976";
    if (percentageDone < 40) return "#3f3966";
  };
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 rounded-xl bg-[#262636] border border-purple-400/30">
      <div className="grid grid-cols-7 gap-1 w-full h-full">
        {Object.entries(data).map((day) => (
          <div
            key={day[1].date}
            style={{
              background: `${getColor(day[1].doneCount, day[1].notDoneCount)}`,
            }}
            className={`h-8 w-8 rounded`}
            title={`${day[1].date}: ${day[1].doneCount} activities`}
          ></div>
        ))}
      </div>
      <div className="flex w-full justify-between items-center my-5">
        <span className="text-sm text-gray-500">less</span>
        <div className="flex w-3/4 justify-evenly">
         <div className="h-6 w-6 rounded bg-[#3f3966]"></div>
         <div className="h-6 w-6 rounded bg-[#3b4976]"></div>
         <div className="h-6 w-6 rounded bg-[#40648d]"></div>
         <div className="h-6 w-6 rounded bg-[#467fa4]"></div>
         <div className="h-6 w-6 rounded bg-[#50b4d1]"></div>

        </div>
        <span className="text-sm text-gray-500">more</span>
      </div>
    </div>
  );
};

export default Calendar;
