import { kebabCase } from "lodash";
import { DailyStats, MonthStats, Rating } from "../types/progressTypes";
import { isWithinInterval, parseISO, subDays, format } from "date-fns";

export const turnIntoKebab = (text: string) => {
  return kebabCase(text);
};

export const getRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export function getCompletionRate(stats: MonthStats): number {
  let done = 0;
  let notDone = 0;

  for (const day in stats) {
    done += stats[day].doneCount ?? 0;
    notDone += stats[day].notDoneCount ?? 0;
  }

  const total = done + notDone;
  if (total === 0) return 0;

  return Math.round((done / total) * 100);
}

export const generateMockDay = (): DailyStats => {
  const done = Math.floor(Math.random() * 5);
  const notDone = Math.floor(Math.random() * 3);
  const total = done + notDone;

  const taskIds = Array.from(
    { length: total },
    () => `task-${Math.floor(Math.random() * 10000)}`
  );
  const taskIdsDone = taskIds.slice(0, done);
  const taskIdsMissed = taskIds.slice(done);

  return {
    doneCount: done,
    notDoneCount: notDone,
    taskIdsDone,
    taskIdsMissed,
    timeSpentByCategory: {
      Study: parseFloat((Math.random() * 2).toFixed(1)),
      Gym: parseFloat((Math.random() * 1.5).toFixed(1)),
    },
    rating: ["low", "good", "great"][
      Math.floor(Math.random() * 3)
    ] as DailyStats["rating"],
  };
};

export const getDateGroupsByRating = (
  monthStats: MonthStats,
  month: number,
  year: number
) => {
  const result: Record<Rating, Date[]> = {
    low: [],
    good: [],
    great: [],
    missed: [],
  };

  Object.entries(monthStats).forEach(([dayStr, stats]) => {
    const day = parseInt(dayStr);
    const date = new Date(year, month, day);

    if (stats.doneCount === 0 && stats.notDoneCount > 0) {
      result.missed.push(date);
    } else {
      result[stats.rating].push(date);
    }
  });

  return result;
};

type res = {
  weekdays: Array<string>;
  completionRate: Array<number>;
};

export const modifyForBarGraph = (monthStats: MonthStats, endDate: Date) => {
  const result: res = {
    weekdays: [],
    completionRate: [],
  };

  const year = endDate.getFullYear();
  const month = endDate.getMonth(); // 0-indexed

  for (let i = 6; i >= 0; i--) {
    const date = new Date(year, month, endDate.getDate() - i);
    if (date.getMonth() !== month) continue;

    const dayStr = String(date.getDate()).padStart(2, "0");
    const completionRate = Math.round(
      (monthStats[dayStr].doneCount /
        (monthStats[dayStr].notDoneCount + monthStats[dayStr].doneCount)) *
        100
    );
    if (!completionRate) continue;

    const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
    result.weekdays.push(weekday);
    result.completionRate.push(completionRate);
  }

  return result;
};
