import React from "react";
import {
  HabitTaskItemMapper,
  // TodoTaskItemMapper,
} from "../components/TaskComponents/TaskItemMapper";
import CreateNewHabitPopup from "../components/Habits/CreateNewHabitPopup";
import { AuthGate } from "../components/Auth/AuthGate";
import LogoutButton from "../components/Auth/LogoutButton";
import { StatCard } from "../components/ui/cards";
import { FaBrain } from "react-icons/fa";
import { ProfileTag, ProfileTags } from "../components/ui/tags";


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
        <LogoutButton/>
        <StatCard title="shithead" info="5.5 hours" icon={FaBrain}/>
        <ProfileTag title={"lazy prick"}/>
      </AuthGate>
    </div>
  );
}
