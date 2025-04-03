import React from "react";
import { TodoTaskItem } from "../components/TaskComponents/TaskItem";

export default function Home() {
  return (
    <div>
      hello world
      <TodoTaskItem
        data={{
          todoId: "read-books",
          goalId: "learn-german",
          title: "Finish AI model prototype",
          description:
            "Complete the first working version of the AI model for goal planning.",
          dueDate: "2025-04-10",
          status: false,
          priority: "low",
          createdAt: "2025-04-02T10:00:00Z",
          type: "daily",
        }}
      />
    </div>
  );
}
