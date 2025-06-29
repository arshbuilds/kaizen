import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { getUserGoalsData } from "../repositories/goalRepos";
import { db } from "../lib/firebase";
import { kebabCase } from "lodash";
import { goalInputType, goalOutputType } from "../types/goalTypes";
import { todoInputType, todoOutputType } from "../types/todoTypes";
import { getTodosByUser } from "./todoServices";
import { DailyStats } from "../types/progressTypes";

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
      timeSpent: 0,
      isCompleted: false
    };
    await setDoc(docRef, data);
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export const updateGoal = async ({
  data,
  userId,
  goalId,
}: {
  data: Partial<goalInputType>;
  userId: string;
  goalId: string;
}) => {
  try {
    const docRef = doc(db, `users/${userId}/goals/${goalId}`);
    await updateDoc(docRef, data);
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export const incrementAndDecrementGoalValues = async ({
  userId,
  goalId,
  timeTaken,
  status,
}: {
  userId: string;
  goalId: string;
  timeTaken: number;
  status: boolean;
}) => {
  try {
    if (status) {
      const docRef = doc(db, `users/${userId}/goals/${goalId}`);
      await updateDoc(docRef, {
        doneTodos: increment(1),
        timeSpent: increment(timeTaken),
      });
    } else {
      const docRef = doc(db, `users/${userId}/goals/${goalId}`);
      await updateDoc(docRef, {
        doneTodos: increment(-1),
        timeSpent: increment(-timeTaken),
      });
    }
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
      let dayTodos = 0;
      const todoIds = [];
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
      const dailyStatRef = doc(db, `users/${userId}/dailyStats/${dateStr}`);
      for (const todo of todos as todoOutputType[]) {
        const todoId = kebabCase(todo.title);
        const todoRef = doc(todosColRef, todoId);
        const batchData: todoInputType = {
          title: todo.title,
          description: todo.description,
          status: todo.status,
          priority: todo.priority,
          timeRequired: todo.timeRequired,
          xp: todo.xp,
          coins: todo.coins,
        };
        batch.set(todoRef, batchData);
        totalTodos = totalTodos + 1;
        dayTodos = dayTodos + 1;
        todoIds.push(todoId);
      }
      const dailyStatData: DailyStats = {
        date: dateStr,
        doneCount: 0,
        notDoneCount: dayTodos,
        taskIdsDone: [],
        taskIdsMissed: todoIds,
        timeSpentByCategory: {},
        timeSpentPerTimeOfDay: {},
        totalTimeSpent: 0,
      };
      batch.set(dailyStatRef, dailyStatData);
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

export const getGoalByUser = async ({
  userId,
  goalId,
}: {
  userId: string;
  goalId: string;
}): Promise<goalOutputType> => {
  try {
    const goalRef = doc(db, `users/${userId}/goals/${goalId}`);
    const goalData = await getDoc(goalRef);
    return goalData.data() as goalOutputType;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
