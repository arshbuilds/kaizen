import { collection, getDocs } from "firebase/firestore";
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from "date-fns";
import { db } from "../lib/firebase";
import { DailyStats, MonthStats } from "../types/progressTypes";

export const getConsistencyData = async ({userId, year, month}: {
  userId: string;
  year: number;
  month: number;
}) => {
  const start = startOfMonth(new Date(year, month));
  const end = endOfMonth(start);

  const allDays = eachDayOfInterval({ start, end });
  const expectedDates = allDays.map((d) => format(d, "yyyy-MM-dd"));

  const statsCol = collection(db, `users/${userId}/dailyStats`);
  const snapshot = await getDocs(statsCol);

  const monthStats: MonthStats = {};

  snapshot.forEach((doc) => {
    const id = doc.id; // should be 'YYYY-MM-DD'
    if (expectedDates.includes(id)) {
      monthStats[id] = doc.data() as DailyStats;
    }
  });

  // Fill in any missing days with `rating: "missed"`
  for (const date of expectedDates) {
    if (!monthStats[date]) {
      monthStats[date] = {
        date,
        doneCount: 0, 
        notDoneCount: 0,
        taskIdsDone: [],
        taskIdsMissed: [],
        timeSpentByCategory: {},
        timeSpentPerTimeOfDay: {},
        totalTimeSpent: Math.floor(Math.random() * 50) +1, //REMOVE LATER
      };
    }
  }

  return monthStats;
};
