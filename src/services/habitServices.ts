import { kebabCase } from "lodash";
import { formHabitType, habitType, updateHabitType } from "../types/habitTypes";
import {
  addUserHabit,
  deleteUserHabit,
  getUserHabitsData,
  updateUserHabit,
} from "../repositories/habitRepos";
import { serverTimestamp } from "firebase/firestore";

export const addhabitByUser = async (
  formData: formHabitType,
  userId: string
) => {
  try {
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
  } catch (e) {
    if (typeof e === "string") {
      e.toUpperCase();
    } else if (e instanceof Error) {
      console.error(e.message);
    }
  }
};

export const getHabitsByUser = async (userId: string) => {
  const docData = await getUserHabitsData({ userId });
  //TODO:- filter by completion and/or streak
  return docData;
};

export const updatehabitByUser = async (
  data: updateHabitType,
  userId: string,
  habitId: string
) => {
  try {
    await updateUserHabit({ data, userId, habitId });
  } catch (e) {
    if (typeof e === "string") {
      e.toUpperCase();
    } else if (e instanceof Error) {
      console.error(e.message);
    }
  }
};

export const deletehabitByUser = async (userId: string, habitId: string) => {
  try {
    await deleteUserHabit({ userId, habitId });
  } catch (e) {
    if (typeof e === "string") {
      e.toUpperCase();
    } else if (e instanceof Error) {
      console.error(e.message);
    }
  }
};
