import {
  collection,
  doc,
  serverTimestamp,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { getUserGoalsData } from "../repositories/goalRepos";
import { db } from "../lib/firebase";
import { kebabCase } from "lodash";
import { goalType } from "../types/goalTypes";
import { todoOutputType } from "../types/todoTypes";

export const getGoalsByUser = async (userId: string) => {
  const docData = await getUserGoalsData(userId);
  //TODO:- filter by priority
  return docData;
};

export const addGoalByUser = async ({
  userId,
  title,
  tags,
  description,
  weeks,
}: {
  userId: string;
  title: string;
  tags: string;
  description: string;
  weeks: number;
}) => {
  try {
    const goalId = kebabCase(title);
    const docRef = doc(db, `users/${userId}/goals/${goalId}`);
    const data: goalType = {
      goalId,
      title,
      description,
      createdAt: serverTimestamp(),
      weeks,
      tags: tags.split(","),
    };
    await setDoc(docRef, data);
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export const uploadTasksForGoals = async (
  data: Record<string, unknown[]>[], // your array of weekly objects
  userId: string,
  goalId: string
) => {
  const batch = writeBatch(db);

  for (const week of data) {
    for (const [dateStr, todos] of Object.entries(week)) {
      // Parent document
      const taskDocRef = doc(
        db,
        `users/${userId}/goals/${goalId}/tasks/${dateStr}`
      );
      batch.set(taskDocRef, {
        dueDate: new Date(dateStr),
        createdAt: serverTimestamp(),
      });

      // Todos subcollection
      const todosColRef = collection(taskDocRef, "todos");

      for (const todo of todos as todoOutputType[]) {
        const todoId = kebabCase(todo.title);
        const todoRef = doc(todosColRef, todoId);
        batch.set(todoRef, {
          title: todo.title,
          description: todo.description,
          status: todo.status,
          priority: todo.priority,
        });
      }
    }
  }

  await batch.commit();
};
