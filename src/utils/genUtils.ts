import { rankedUserType } from "./../types/userTypes";
import { MonthStats } from "./../types/progressTypes";
import { formatDate } from "./dateTimeUtils";

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

export const modifyForBarGraph = (monthStats: MonthStats) => {
  const result = {
    weekDays: [] as string[],
    completionRate: [] as number[],
  };

  const endDate = new Date();
  const year = endDate.getFullYear();
  const month = endDate.getMonth(); // 0-indexed

  for (let i = 7; i >= 0; i--) {
    const date = new Date(year, month, endDate.getDate() - i);
    if (date.getMonth() !== month) continue;

    const dayIndex = formatDate(date);
    const dayStats = monthStats[dayIndex];

    if (!dayStats) continue;

    const doneCount = dayStats.doneCount;
    const notDoneCount = dayStats.notDoneCount;
    const total = doneCount + notDoneCount;
    if (total === 0) continue;

    const completionRate = Math.round((doneCount / total) * 100);

    result.weekDays.push(
      date.toLocaleDateString("en-US", { weekday: "short" })
    );
    result.completionRate.push(completionRate);
  }

  return result;
};

export const modifyForLineChart = ({
  monthStats,
}: {
  monthStats: MonthStats;
}) => {
  const result = {
    weekDays: [] as string[],
    timeSpent: [] as number[],
  };

  const endDate = new Date();
  const year = endDate.getFullYear();
  const month = endDate.getMonth(); // 0-indexed

  for (let i = 7; i >= 0; i--) {
    const date = new Date(year, month, endDate.getDate() - i);
    if (date.getMonth() !== month) continue;

    const dayIndex = formatDate(date);
    const dayStats = monthStats[dayIndex];

    if (!dayStats) continue;

    result.weekDays.push(
      date.toLocaleDateString("en-US", { weekday: "short" })
    );
    result.timeSpent.push(dayStats.totalTimeSpent);
  }

  return result;
};

export const modifyForNonTop3 = ({
  docs,
  userId,
}: {
  docs: rankedUserType[];
  userId: string;
}) => {
  const tail = docs.slice(3); 
  const userDoc = docs.find((d)=> d.userId === userId)
  const tailWithoutUser = tail.filter((d) => d.userId !== userId);
  return [userDoc, ...tailWithoutUser];
};
