import { kebabCase } from "lodash";
import { habitInputType } from "../types/habitTypes";
import {
  addUserHabit,
  deleteUserHabit,
  getUserHabitsData,
} from "../repositories/habitRepos";
import {
  collection,
  doc,
  orderBy,
  getDocs,
  limit,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import {
  differenceInCalendarDays,
  isSameDay,
  parseISO,
  subDays,
} from "date-fns";
import { updateDailyStat } from "./progressServices";

export const addHabitByUser = async ({
  formData,
  userId,
}: {
  formData: { title: string; category: string; timeRequired: number };
  userId: string;
}) => {
  try {
    const data: habitInputType = {
      habitId: kebabCase(formData.title),
      title: formData.title,
      streak: 0,
      lastCompleted: null,
      createdAt: serverTimestamp(),
      category: formData.category,
      timeRequired: formData.timeRequired,
    };
    await addUserHabit({ data, userId });
  } catch (e) {
    console.error("Couldn't add habit:", e);
    throw e;
  }
};

export const getHabitsByUser = async (userId: string) => {
  const docData = await getUserHabitsData({ userId });
  // const completed = docData
  //   .filter((doc) => doc.status === true)
  //   .sort((a, b) => b.streak - a.streak);
  // const pending = docData
  //   .filter((doc) => doc.status === false)
  //   .sort((a, b) => b.streak - a.streak);
  return docData;
};

export const updateHabitByUser = async ({
  userId,
  habitId,
  todayDateKey,
  status,
  timeRequired,
  streak,
  lastCompleted,
}: {
  status: boolean;
  userId: string;
  habitId: string;
  timeRequired: number;
  todayDateKey: string;
  streak: number;
  lastCompleted: string | null;
}) => {
  try {
    const habitRef = doc(db, `users/${userId}/habits/${habitId}`);
    const compRef = doc(collection(habitRef, "completions"), todayDateKey);
    return runTransaction(db, async (tx) => {
      if (status) {
        if (lastCompleted === todayDateKey) return;
        const continues =
          lastCompleted &&
          differenceInCalendarDays(
            parseISO(todayDateKey),
            parseISO(lastCompleted)
          ) === 1;
        const newStreak = continues ? streak + 1 : 1;
        tx.set(compRef, { done: true, at: serverTimestamp() });
        tx.update(habitRef, {
          streak: newStreak,
          lastCompleted: todayDateKey,
        });
        await updateDailyStat({
          date: todayDateKey,
          taskId: habitId,
          userId,
          timeRequired,
          status: status,
        });
        return;
      } else {
        if (lastCompleted !== todayDateKey) {
          tx.delete(compRef);
          return;
        }
        const prevSnap = await getDocs(
          query(
            collection(habitRef, "completions"),
            orderBy("__name__", "desc"),
            where("__name__", "<", todayDateKey),
            limit(1) // docId == dateKey so orderBy works
          )
        );
        const prevDate = prevSnap.empty ? null : prevSnap.docs[0].id;
        tx.delete(compRef);
        let newStreak = 0;
        if (prevDate) {
          let cursor = parseISO(prevDate);
          newStreak = 1;
          const batch = await getDocs(
            query(
              collection(habitRef, "completions"),
              orderBy("__name__", "desc"),
              where("__name__", "<", todayDateKey),
              limit(31)
            )
          );
          for (const d of batch.docs) {
            if (d.id === prevDate) continue;
            if (isSameDay(parseISO(d.id), subDays(cursor, 1))) {
              newStreak += 1;
              cursor = subDays(cursor, 1);
            } else break;
          }
        }
        tx.update(habitRef, {
          streak: newStreak,
          lastCompleted: prevDate,
          updatedAt: serverTimestamp(),
        });

        await updateDailyStat({
          date: todayDateKey,
          taskId: habitId,
          userId,
          timeRequired,
          status: status,
        });
      }
    });
    // if (!data.status) return;
    // await updateUserHabit({ data, userId, habitId });
  } catch (e) {
    console.error("Login failed:", e);
    throw e;
  }
};

export const deletehabitByUser = async (userId: string, habitId: string) => {
  try {
    await deleteUserHabit({ userId, habitId });
  } catch (e) {
    console.error("Login failed:", e);
    throw e;
  }
};
