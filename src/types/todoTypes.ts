export type todoType = {
    todoId: string;
    goalId: string;
    title: string;
    description: string;
    dueDate: string; 
    status: string;
    priority: string;
    createdAt: string; 
    type: string
};

export type formTodoType = Omit<todoType, "todoId"| "createdAt" | "goalId">
export type updateTodoType = Partial<todoType>