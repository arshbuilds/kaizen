import React from "react";
import {
  HabitTaskItemMapper,
  // TodoTaskItemMapper,
} from "../components/TaskComponents/TaskItemMapper";

export default function Home() {
  return (
    <div>
      {/* <TodoTaskItemMapper
        goalId="learn-german"
        type="daily"
        userId="CFOsu6H7SS6Y5MlLBJf3"
      /> */}
      <HabitTaskItemMapper userId="CFOsu6H7SS6Y5MlLBJf3" />
    </div>
  );
}
