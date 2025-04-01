import { kebabCase } from "lodash";
import {
  addUserTodo,
  deleteUserTodo,
  getUserTodosData,
  updateUserTodo,
} from "../repositories/todoRepos";
import { formTodoType, todoType, updateTodoType } from "../types/todoTypes";

export const addTodoByUser = async (
  formData: formTodoType,
  userId: string,
  goalId: string
) => {
  try {
    if (!formData.title.trim()) throw new Error("Title cannot be empty");

    const data: todoType = {
      todoId: kebabCase(formData.title),
      goalId: goalId,
      title: formData.title,
      description: formData.description,
      dueDate: formData.dueDate,
      status: "pending",
      priority: formData.priority,
      createdAt: "//TODO:- Make use of server timeStamp",
      type: formData.type,
    };
    await addUserTodo({ data, userId });
  } catch (e) {
    if (typeof e === "string") {
      e.toUpperCase();
    } else if (e instanceof Error) {
      console.error(e.message);
    }
  }
};

export const getTodosByUser = async (
  userId: string,
  goalId: string,
  type: string
) => {
  const docData = await getUserTodosData({ userId, goalId, type });
  //TODO:- filter by priority
  return docData;
};

export const updateTodoByUser = async (
  data: updateTodoType,
  userId: string,
  goalId: string,
  todoType: string,
  todoId: string
) => {
  try {
    await updateUserTodo({ data, userId, goalId, todoType, todoId });
  } catch (e) {
    if (typeof e === "string") {
      e.toUpperCase();
    } else if (e instanceof Error) {
      console.error(e.message);
    }
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
    if (typeof e === "string") {
      e.toUpperCase();
    } else if (e instanceof Error) {
      console.error(e.message);
    }
  }
};
