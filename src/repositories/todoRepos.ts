import { partialTodoType, todoType } from "../types/todoTypes";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { getStartAndEndOfToday } from "../utils/dateTimeUtils";

//CREATE a new user todo
type addUserTodoParams = {
  data: todoType;
  userId: string;
};

export const addUserTodo = async (params: addUserTodoParams) => {
  const docRef = doc(
    db,
    `users/${params.userId}/goals/${params.data.goalId}/todo-${params.data.type}`,
    params.data.todoId
  );
  await setDoc(docRef, params.data);
};

//GET all user todos
type getUserTodoParams = {
  userId: string;
  goalId: string;
  type: string;
  timeRange: "today" | "all";
};

export const getUserTodosData = async (params: getUserTodoParams) => {
  const data: Array<todoType> = [];
  const collectionRef = collection(
    db,
    `/users/${params.userId}/goals/${params.goalId}/todo-${params.type}`
  );
  let q;

  if (params.timeRange === "today") {
    const { start, end } = getStartAndEndOfToday();
    q = query(
      collectionRef,
      where("dueDate", ">=", Timestamp.fromDate(start)),
      where("dueDate", "<", Timestamp.fromDate(end))
    );
  } else {
    q = query(collectionRef);
  }
  const snapshot = await getDocs(q);
  snapshot.forEach((doc) => {
    data.push({ todoId: doc.id, ...doc.data() } as todoType);
  });
  return data;
};

//UPDATE a user todo
type updateUserTodoType = {
  data: partialTodoType;
  userId: string;
  goalId: string;
  todoType: string;
  todoId: string;
};

export const updateUserTodo = async (params: updateUserTodoType) => {
  const docRef = doc(
    db,
    `users/${params.userId}/goals/${params.goalId}/todo-${params.todoType}/${params.todoId}`
  );
  await updateDoc(docRef, params.data);
};

//DELETE a user todo
type deleteUserTodoParams = {
  userId: string;
  goalId: string;
  todoType: string;
  todoId: string;
};

export const deleteUserTodo = async (params: deleteUserTodoParams) => {
  const docRef = doc(
    db,
    `users/${params.userId}/goals/${params.goalId}/todo-${params.todoType}/${params.todoId}`
  );
  await deleteDoc(docRef);
};
