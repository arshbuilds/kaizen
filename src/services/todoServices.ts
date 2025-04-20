import { kebabCase } from "lodash";
import {
  addUserTodo,
  deleteUserTodo,
  getUserTodosData,
  updateUserTodo,
} from "../repositories/todoRepos";
import { partialTodoType, todoType } from "../types/todoTypes";
import { serverTimestamp, Timestamp } from "firebase/firestore";

export const addTodoByUser = async (
  formData: partialTodoType,
  userId: string,
  goalId: string,
  dueBy: Date
) => {
  try {
    if (
      formData.title &&
      formData.description &&
      formData.priority &&
      formData.type
    ) {
      if (!formData.title.trim()) throw new Error("Title cannot be empty");

      const data: todoType = {
        todoId: kebabCase(formData.title),
        goalId: goalId,
        title: formData?.title,
        description: formData.description,
        dueDate: dueBy ? Timestamp.fromDate(dueBy) : serverTimestamp(),
        status: false,
        priority: formData.priority,
        createdAt: serverTimestamp(),
        type: formData.type,
      };
      await addUserTodo({ data, userId });
    }
  } catch (e) {
    console.error("Login failed:", e);
    throw e;
  }
};

export const getTodosByUser = async (
  userId: string,
  goalId: string,
  type: string,
  timeRange: "today" | "all"
) => {
  const docData = await getUserTodosData({ userId, goalId, type, timeRange });
  //TODO:- filter by priority
  return docData;
};

export const updateTodoByUser = async (
  data: partialTodoType,
  userId: string,
  goalId: string,
  todoType: string,
  todoId: string
) => {
  try {
    await updateUserTodo({ data, userId, goalId, todoType, todoId });
  } catch (e) {
    console.error("Login failed:", e);
    throw e;
  }
};

export const deleteTodoByUser = async (
  userId: string,
  goalId: string,
  todoType: string,
  todoId: string
) => {
  try {
    await deleteUserTodo({ userId, goalId, todoType, todoId });
  } catch (e) {
    console.error("Login failed:", e);
    throw e;
  }
};
