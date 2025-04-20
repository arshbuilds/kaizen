import { kebabCase } from "lodash";
import { habitType, partialHabitType } from "../types/habitTypes";
import {
  addUserHabit,
  deleteUserHabit,
  getUserHabitsData,
  updateUserHabit,
} from "../repositories/habitRepos";
import { serverTimestamp } from "firebase/firestore";

export const addHabitByUser = async (
  formData: partialHabitType,
  userId: string
) => {
  try {
    if (formData.title) {
      if (!formData.title.trim()) throw new Error("Title cannot be empty");

      const data: habitType = {
        habitId: kebabCase(formData.title),
        title: formData.title,
        status: false,
        streak: 0,
        lastCompleted: serverTimestamp(),
        createdAt: serverTimestamp(),
      };
      await addUserHabit({ data, userId });
    }
  } catch (e) {
    console.error("Login failed:", e);
    throw e;
  }
};

export const getHabitsByUser = async (userId: string) => {
  const docData = await getUserHabitsData({ userId });
  const completed = docData
    .filter((doc) => doc.status === true)
    .sort((a, b) => b.streak - a.streak);
  const pending = docData
    .filter((doc) => doc.status === false)
    .sort((a, b) => b.streak - a.streak);
  return pending.concat(completed);
};

export const updateHabitByUser = async (
  data: partialHabitType,
  userId: string,
  habitId: string
) => {
  try {
    await updateUserHabit({ data, userId, habitId });
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
