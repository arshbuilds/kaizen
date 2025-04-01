"use client";

import { addTodoByUser, deleteTodoByUser, updateTodoByUser } from "../services/todoServices";


// COMPONENT FOR TESTING CRUD
export const TodoButton = () => {

  const addTodo = () => {
    const data = {
      title: "read books",
      description: "pretty self explainotry",
      dueDate: "now",
      status: "pending",
      priority: "high",
      type: "daily",
    };
    addTodoByUser(data, "CFOsu6H7SS6Y5MlLBJf3", "learn-german");
  };

  const deleteTodo = () => {
    deleteTodoByUser("CFOsu6H7SS6Y5MlLBJf3", "learn-german", "daily", "read-books");
  };

  const updateTodo = () => {
    updateTodoByUser({priority: "low", status: "done"}, "CFOsu6H7SS6Y5MlLBJf3", "learn-german", "daily", "read-books")
  }

  return <button className="bg-white" onClick={updateTodo}>Add Todo</button>;
};
