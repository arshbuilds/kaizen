import {
  addUserTodo,
  deleteUserTodo,
  getUserTodosData,
  updateUserTodo,
} from "../repositories/todoRepos";
import { partialtodoOutputType, todoInputType } from "../types/todoTypes";
import { formatDate } from "../utils/dateTimeUtils";
import { incrementAndDecrementGoalValues } from "./goalServices";
import { updateDailyStat } from "./progressServices";

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
    if(data.status === undefined) return
    await incrementAndDecrementGoalValues({
      userId,
      goalId,
      timeTaken: timeRequired,
      status: data.status,
    });
    await updateDailyStat({
      date: formatDate(new Date()),
      taskId: todoId,
      userId,
      timeRequired,
      status: data.status,
    });
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
