import React from "react";
import {
  // HabitTaskItemMapper,
  TodoTaskItemMapper,
} from "../components/TaskComponents/TaskItemMapper";
// import CreateNewHabitPopup from "../components/Habits/CreateNewHabitPopup";
import { AuthGate } from "../components/Auth/AuthGate";
// import LogoutButton from "../components/Auth/LogoutButton";
import Link from "next/link";
import GetTodosFromPrompt from "../components/GoalMaking/GetTodosFromPrompt";


export default function Home() {
  return (
    <div>
      <TodoTaskItemMapper
        goalId="learn-to-act"
      />
      <AuthGate>
        {/* <HabitTaskItemMapper /> */}
        {/* <CreateNewHabitPopup /> */}
        <GetTodosFromPrompt/>
        <Link href={'/profile'}>profile</Link>
        <Link href={'/progress'}>progress</Link>
        {/* <LogoutButton/> */}
      </AuthGate>
    </div>
  );
}
