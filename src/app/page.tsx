import React from "react";
import {
  HabitTaskItemMapper,
  // TodoTaskItemMapper,
} from "../components/TaskComponents/TaskItemMapper";
import CreateNewHabitPopup from "../components/Habits/CreateNewHabitPopup";
import { AuthGate } from "../components/Auth/AuthGate";
import LogoutButton from "../components/Auth/LogoutButton";
import Link from "next/link";


export default function Home() {
  return (
    <div>
      {/* <TodoTaskItemMapper
        goalId="learn-german"
        type="daily"
        userId="CFOsu6H7SS6Y5MlLBJf3"
      /> */}
      <AuthGate>
        <HabitTaskItemMapper />
        <CreateNewHabitPopup />
        <Link href={'/profile'}>profile</Link>
        <Link href={'/progress'}>progress</Link>
        <LogoutButton/>
      </AuthGate>
    </div>
  );
}
