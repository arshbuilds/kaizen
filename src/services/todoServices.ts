import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  addUserTodo,
  deleteUserTodo,
  getUserTodosData,
  updateUserTodo,
} from "../repositories/todoRepos";
import { partialtodoOutputType, todoInputType } from "../types/todoTypes";
import { db } from "../lib/firebase";
import { formatDate } from "../utils/dateTimeUtils";
import { incrementAndDecrementGoalValues} from "./goalServices";

export const addTodoByUser = async (
  formData: Omit<todoInputType, "status">,
  userId: string,
  goalId: string,
  dueBy: string
) => {
  try {
    if (formData.title && formData.description && formData.priority) {
      if (!formData.title.trim()) throw new Error("Title cannot be empty");

      const data: todoInputType = {
        title: formData?.title,
        description: formData.description,
        status: false,
        priority: formData.priority,
        xp: formData.xp,
        coins: formData.coins,
        timeRequired: 0,
      };
      await addUserTodo({ data, userId, goalId, dueBy });
    }
  } catch (e) {
    console.error("Login failed:", e);
    throw e;
  }
};

export const getTodosByUser = async (
  userId: string,
  goalId: string,
  dueBy: string
) => {
  const docData = await getUserTodosData({ userId, goalId, dueBy });
  //TODO:- filter by priority
  return docData;
};

export const updateTodoByUser = async (
  data: partialtodoOutputType,
  userId: string,
  goalId: string,
  dueBy: string,
  todoId: string,
  timeRequired: number
) => {
  try {
    const dailyStatRef = doc(
      db,
      `users/${userId}/dailyStats/${formatDate(new Date())}`
    );
    const docSnapshot = await getDoc(dailyStatRef);
    if (docSnapshot.exists()) {
      if (data.status) {
        await incrementAndDecrementGoalValues({userId, goalId, timeTaken: timeRequired, status: true})
        await updateDoc(dailyStatRef, {
          doneCount: docSnapshot.data().doneCount + 1,
          taskIdsDone: arrayUnion(todoId),
          notDoneCount: docSnapshot.data().notDoneCount - 1,
          totalTimeSpent: docSnapshot.data().totalTimeSpent + timeRequired,
          taskIdsMissed: arrayRemove(todoId),
        });
      } else {
 
        await incrementAndDecrementGoalValues({userId, goalId, timeTaken: timeRequired, status: false})
        await updateDoc(dailyStatRef, {
          doneCount: docSnapshot.data().doneCount - 1,
          taskIdsDone: arrayRemove(todoId),
          notDoneCount: docSnapshot.data().notDoneCount + 1,
          totalTimeSpent: docSnapshot.data().totalTimeSpent - timeRequired,
          taskIdsMissed: arrayUnion(todoId),
        });
      }
    } else {
      await setDoc(dailyStatRef, {
        date: formatDate(new Date()),
        doneCount: 0,
        notDoneCount: 0,
        taskIdsDone: [],
        taskIdsMissed: [],
        timeSpentByCategory: {},
        timeSpentPerTimeOfDay: {},
        totalTimeSpent: 0,
      });
    }
    await updateUserTodo({ data, userId, goalId, dueBy, todoId });
  } catch (e) {
    console.error("Some error occured:", e);
    throw e;
  }
};

export const deleteTodoByUser = async (
  userId: string,
  goalId: string,
  dueBy: string,
  todoId: string
) => {
  try {
    await deleteUserTodo({ userId, goalId, dueBy, todoId });
  } catch (e) {
    console.error("Login failed:", e);
    throw e;
  }
};
