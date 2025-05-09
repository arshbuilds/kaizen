"use client";
import { MonthStats } from "@/src/types/progressTypes";
import { getDateGroupsByRating } from "@/src/utils/genUtils";
import React, { useState } from "react";
import { DayPicker } from "react-day-picker";

const Calendar = ({
  data,
  month,
  year,
}: {
  data: MonthStats;
  month: number;
  year: number;
}) => {
  const ratingGroups = getDateGroupsByRating(data, month, year);
  const [selectedMonth, setSelectedMonth] = useState(new Date(year, month));
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 rounded-xl bg-[#1a2332]">
      <DayPicker
        animate
        mode="single"
        month={selectedMonth}
        onMonthChange={setSelectedMonth}
        modifiers={ratingGroups}
        modifiersClassNames={{
          missed: "bg-[#5a2f38] text-white",
          low: "bg-[#594931] text-white ",
          good: "bg-[#12433b] text-white",
          great: "bg-[#087865] text-white",
        }}
        classNames={{
          day: "h-[50px] w-[50px] sm:h-[70px] sm:w-[70px] md:h-[80px] md:w-[80px] text-sm text-center font-medium rounded-lg",
          day_selected: "bg-blue-500 text-white",
          day_today: "border border-white",
          day_outside: "text-gray-400 opacity-50",
          day_disabled: "opacity-25 cursor-not-allowed",
          table: "w-full border-separate",
          tbody: "gap-2", 
        }}
        hideNavigation={true}
        captionLayout={"label"}
      />
      <div className="flex w-full justify-evenly my-5">
        <div>
          low
          <span className="mx-2 rounded-xl bg-[#594931] text-[#594931]">
            ....
          </span>
        </div>
        <div>
          good
          <span className="mx-2 rounded-xl bg-[#12433b] text-[#12433b]">
            ....
          </span>
        </div>
        <div>
          great
          <span className="mx-2 rounded-xl bg-[#087865] text-[#087865]">
            ....
          </span>
        </div>
        <div>
          missed
          <span className="mx-2 rounded-xl bg-[#5a2f38] text-[#5a2f38]">
            ....
          </span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
