import {
  partialtodoOutputType,
  todoInputType,
  todoOutputType,
} from "../types/todoTypes";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { kebabCase } from "lodash";

//CREATE a new user todo
type addUserTodoParams = {
  data: todoInputType;
  userId: string;
  goalId: string;
  dueBy: string;
};

export const addUserTodo = async (params: addUserTodoParams) => {
  const docRef = doc(
    db,
    `users/${params.userId}/goals/${params.goalId}/tasks/${
      params.dueBy
    }/todos/${kebabCase(params.data.title)}`
  );
  await setDoc(docRef, params.data);
};

//GET all user todos
type getUserTodoParams = {
  userId: string;
  goalId: string;
  dueBy: string;
};

export const getUserTodosData = async (params: getUserTodoParams) => {
  const data: Array<todoOutputType> = [];
  const collectionRef = collection(
    db,
    `users/${params.userId}/goals/${params.goalId}/tasks/${params.dueBy}/todos`
  );

  const snapshot = await getDocs(collectionRef);
  snapshot.forEach((doc) => {
    data.push({
      todoId: doc.id,
      goalId: params.goalId,
      ...doc.data(),
    } as todoOutputType);
  });
  return data;
};

//UPDATE a user todo
type updateUserTodoType = {
  data: partialtodoOutputType;
  userId: string;
  goalId: string;
  dueBy: string;
  todoId: string;
};

export const updateUserTodo = async (params: updateUserTodoType) => {
  const docRef = doc(
    db,
    `users/${params.userId}/goals/${params.goalId}/tasks/${params.dueBy}/todos/${params.todoId}`
  );
  await updateDoc(docRef, params.data);
};

//DELETE a user todo
type deleteUserTodoParams = {
  userId: string;
  goalId: string;
  todoId: string;
  dueBy: string;
};

export const deleteUserTodo = async (params: deleteUserTodoParams) => {
  const docRef = doc(
    db,
    `users/${params.userId}/goals/${params.goalId}/tasks/${params.dueBy}/todos/${params.todoId}`
  );
  await deleteDoc(docRef);
};
