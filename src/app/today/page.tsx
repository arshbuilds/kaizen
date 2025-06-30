"use client";
import Loading from "@/src/components/Loading/Loading";
import {
  HabitTaskItemMapper,
  TodoTaskItemMapper,
} from "@/src/components/TaskComponents/TaskItemMapper";
import { useAuth } from "@/src/hooks/useAuth";
import { getTodaysTasks} from "@/src/services/goalServices";
import { getHabitsByUser } from "@/src/services/habitServices";
import { formatDate } from "@/src/utils/dateTimeUtils";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";

const Today = () => {
  const [todoActive, setTodoActive] = useState(true);
  const { user } = useAuth();
  const dueBy = formatDate(new Date());
  const goalsQuery = useQuery({
    queryKey: ["todos"],
    queryFn: async () => {
      const data = await getTodaysTasks(user!.userId, dueBy);
      return data;
    },
  });
  const habitsQuery = useQuery({
    queryKey: ["habits"],
    queryFn: async () => {
      const data = await getHabitsByUser(user!.userId);
      return data;
    },
  });
  if (goalsQuery.isLoading || habitsQuery.isLoading) {
    return <Loading />;
  }
  if (goalsQuery.isError || habitsQuery.isError) {
    console.error(goalsQuery.error, habitsQuery.error)
    return <>Some error occured</>;
  }

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen p-4 mx-auto pb-24">
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-white text-2xl font-bold">My Tasks</h1>
            <p className="text-gray-300 text-sm">Today, {currentDate}</p>
          </div>
        </div>
        <div className="bg-[#262636]/30 rounded-xl p-1 mb-6">
          <div className="flex">
            <button
              onClick={() => setTodoActive(true)}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                todoActive === true
                  ? "bg-slate-700 text-white shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setTodoActive(false)}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                todoActive === false
                  ? "bg-slate-700 text-white shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Habits
            </button>
          </div>
        </div>
        {todoActive ? (
          goalsQuery.data && goalsQuery.data.length !== 0 ? (
            <TodoTaskItemMapper
              queryKey={"todos"}
              data={goalsQuery.data}
              dueBy={dueBy}
            />
          ) : (
            <>There are no todos left for today</>
          )
        ) : habitsQuery.data && habitsQuery.data.length !== 0 ? (
          <HabitTaskItemMapper queryKey={"habits"} data={habitsQuery.data} />
        ) : (
          <>There are no Habits left for today</>
        )}
      </div>
    </div>
  );
};

export default Today;
