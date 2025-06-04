import React from "react";
import { AuthGate } from "../components/Auth/AuthGate";
import Link from "next/link";
import CreateNewTaskBottomSheet from "../components/TaskComponents/CreateNewTaskBottomSheet";
import GetTodosFromPrompt from "../components/GoalMaking/GetTodosFromPrompt";


export default function Home() {
  return (
    <div>
      <AuthGate>
        <Link href={'/profile'}>profile</Link>
        <Link href={'/progress'}>progress</Link>
        <GetTodosFromPrompt/>
        <CreateNewTaskBottomSheet/>
      </AuthGate>
    </div>
  );
}
