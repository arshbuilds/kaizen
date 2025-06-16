import {
  arrayUnion,
  collection,
  doc,
  serverTimestamp,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { getUserGoalsData } from "../repositories/goalRepos";
import { db } from "../lib/firebase";
import { kebabCase } from "lodash";
import { goalOutputType } from "../types/goalTypes";
import { todoOutputType } from "../types/todoTypes";
import { getTodosByUser } from "./todoServices";

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
  totalTodos,
}: {
  userId: string;
  title: string;
  tags: string;
  description: string;
  weeks: number;
  totalTodos: number;
}) => {
  try {
    const goalId = kebabCase(title);
    const docRef = doc(db, `users/${userId}/goals/${goalId}`);
    const data: goalOutputType = {
      goalId,
      title,
      description,
      createdAt: serverTimestamp(),
      weeks,
      tags: tags.split(","),
      totalTodos,
      doneTodos: 0,
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
  goalTitle: string,
  tags: string,
  description: string,
  weeks: number
) => {
  const batch = writeBatch(db);
  const goalId = kebabCase(goalTitle);
  let totalTodos = 0;
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
        totalTodos = totalTodos + 1;
      }
    }
  }

  batch.update(doc(db, `users/${userId}`), {
    goals: arrayUnion(goalTitle),
  });
  await addGoalByUser({
    userId,
    title: goalTitle,
    tags,
    description,
    weeks,
    totalTodos,
  });
  await batch.commit();
};

export const getTodaysTasks = async (userId: string, dueBy: string) => {
  try {
    const goals = await getGoalsByUser(userId);
    const todos: todoOutputType[] = [];
    for (const goalDoc of goals) {
      const data = await getTodosByUser(userId, goalDoc.goalId, dueBy);
      todos.push(...data);
    }
    return todos;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
