import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDocs,
  increment,
  runTransaction,
  updateDoc,
} from "firebase/firestore";
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from "date-fns";
import { db } from "../lib/firebase";
import { DailyStats, MonthStats } from "../types/progressTypes";

export const getConsistencyData = async ({
  userId,
  year,
  month,
}: {
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
        totalTimeSpent: 0,
      };
    }
  }

  return monthStats;
};

export const addConsistencyDateData = async ({
  date,
  userId,
  totalTasks,
  taskIds,
}: {
  date: string;
  userId: string;
  totalTasks: number;
  taskIds: string[];
}) => {
  try {
    const docRef = doc(db, `users/${userId}/dailyStats/${date}`);
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(docRef);
      if (!snap.exists()) {
        tx.set(docRef, {
          date,
          doneCount: 0,
          notDoneCount: totalTasks,
          taskIdsDone: [],
          taskIdsMissed: taskIds,
          timeSpentByCategory: {},
          timeSpentPerTimeOfDay: {},
          totalTimeSpent: 0,
        });
        return;
      }
      const data = snap.data() as {
        taskIdsMissed?: string[];
        taskIdsDone?: string[];
      };

      const alreadySeen = new Set([
        ...(data.taskIdsMissed ?? []),
        ...(data.taskIdsDone ?? []),
      ]);

      const newIds = taskIds.filter((id) => !alreadySeen.has(id));

      if (newIds.length === 0) {
        // Every id was already counted – nothing to do
        return;
      }

      tx.update(docRef, {
        notDoneCount: increment(newIds.length),
        taskIdsMissed: arrayUnion(...newIds),
      });
    });
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export const updateDailyStat = async ({
  date,
  taskId,
  userId,
  timeRequired,
  status,
}: {
  date: string;
  taskId: string;
  userId: string;
  timeRequired: number;
  status: boolean;
}) => {
  try {
    const docRef = doc(db, `users/${userId}/dailyStats/${date}`);
    const delta = status ? 1 : -1;
    await updateDoc(docRef, {
      doneCount: increment(delta),
      taskIdsDone: status ? arrayUnion(taskId) : arrayRemove(taskId),
      notDoneCount: increment(-delta),
      totalTimeSpent: increment(status ? timeRequired : -timeRequired),
      taskIdsMissed: status ? arrayRemove(taskId) : arrayUnion(taskId),
    });
  } catch (e) {
    console.error(e);
    throw e;
  }
};
