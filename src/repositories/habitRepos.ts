import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import {
  habitInputType,
  habitOutputType,
  partialHabitType,
} from "../types/habitTypes";
import { isToday } from "date-fns";
import { convertToDate } from "../utils/dateTimeUtils";

//CREATE a new user Habit
type addUserHabitParams = {
  data: habitInputType;
  userId: string;
};

export const addUserHabit = async (params: addUserHabitParams) => {
  const docRef = doc(
    db,
    `users/${params.userId}/habits/${params.data.habitId}`
  );
  await setDoc(docRef, params.data);
};

//GET all user Habits
type getUserHabitParams = {
  userId: string;
};

export const getUserHabitsData = async (params: getUserHabitParams) => {
  const data: Array<habitOutputType> = [];
  const collectionRef = collection(db, `/users/${params.userId}/habits`);

  const querySnapshot = await getDocs(collectionRef);
  querySnapshot.forEach((doc) => {
    let status;
    const date = convertToDate(doc.data().lastCompleted);
    if (date !== null) {
      status = isToday(date);
    }
    data.push({ habitId: doc.id, status, ...doc.data() } as habitOutputType);
  });
  return data;
};

//UPDATE a user Habit
type updateUserHabitType = {
  data: partialHabitType;
  userId: string;
  habitId: string;
};

export const updateUserHabit = async (params: updateUserHabitType) => {
  const docRef = doc(db, `users/${params.userId}/habits/${params.habitId}`);
  await updateDoc(docRef, params.data);
};

//DELETE a user Habit
type deleteUserHabitParams = {
  userId: string;
  habitId: string;
};

export const deleteUserHabit = async (params: deleteUserHabitParams) => {
  const docRef = doc(db, `users/${params.userId}/habits/${params.habitId}`);
  await deleteDoc(docRef);
};
