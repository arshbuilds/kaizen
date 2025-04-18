import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { habitType, partialHabitType } from "../types/habitTypes";

//CREATE a new user Habit
type addUserHabitParams = {
  data: habitType;
  userId: string;
};

export const addUserHabit = async (params: addUserHabitParams) => {
  const docRef = doc(db, `users/${params.userId}/habits/${params.data.habitId}`);
  await setDoc(docRef, params.data);
};

//GET all user Habits
type getUserHabitParams = {
  userId: string;
};

export const getUserHabitsData = async (params: getUserHabitParams) => {
  const data: Array<habitType> = [];
  const collectionRef = collection(
    db,
    `/users/${params.userId}/habits`
  );

  const querySnapshot = await getDocs(collectionRef);
  querySnapshot.forEach((doc) => {
    data.push({ habitId: doc.id, ...doc.data() } as habitType);
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
  const docRef = doc(
    db,
    `users/${params.userId}/habits/${params.habitId}`
  );
  await updateDoc(docRef, params.data);
};

//DELETE a user Habit
type deleteUserHabitParams = {
  userId: string;
  habitId: string;
};

export const deleteUserHabit = async (params: deleteUserHabitParams) => {
  const docRef = doc(
    db,
    `users/${params.userId}/habits/${params.habitId}`
  );
  await deleteDoc(docRef);
};
