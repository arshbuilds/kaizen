import { FirestoreTimestamp } from "../lib/firebase";

export type todoType = {
    todoId: string;
    goalId: string;
    title: string;
    description: string;
    dueDate: FirestoreTimestamp; 
    status: boolean;
    priority: string;
    createdAt: FirestoreTimestamp; 
    type: string
};

export type formTodoType = Omit<todoType, "todoId"| "createdAt" | "goalId">
export type updateTodoType = Partial<todoType>