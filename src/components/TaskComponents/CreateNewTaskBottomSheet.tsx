"use client";
import { useState } from "react";
import BottomSheet from "../ui/bottomSheet";
import CreateNewHabitForm from "../Habits/CreateNewHabitForm";
import CreateNewTodoForm from "../Todos/CreateNewTodoForm";
import { Button } from "@/components/ui/button";
import { Plus, Target } from "lucide-react";

export const CreateNewTodoBottomSheet = () => {
  const [open, setOpen] = useState(false);
  const onClose = () => {
    setOpen(false);
  };
  return (
    <>
      <Button
        variant="default"
        className="transition h-20 bg-[#262636] focus:bg-slate-700 border-slate-700 hover:bg-slate-700  flex flex-col items-center gap-2"
        onClick={() => setOpen(true)}
      >
        <Plus className="w-6 h-6 text-green-400" />
        <span className="text-white">Add Task</span>
      </Button>
      <BottomSheet isOpen={open} onClose={onClose}>
        <CreateNewTodoForm onClose={onClose} />
      </BottomSheet>
    </>
  );
};

export const CreateNewHabitBottomSheet = () => {
  const [open, setOpen] = useState(false);
  const onClose = () => {
    setOpen(false);
  };
  return (
    <>
      <Button
        variant="default"
        className="bg-[#262636] transition h-20 border-slate-700 hover:bg-slate-700 focus:bg-slate-700 flex flex-col items-center gap-2"
        onClick={() => setOpen(true)}
      >
        <Target className="w-6 h-6 text-green-400" />
        <span className="text-white">Add Habit</span>
      </Button>
      <BottomSheet isOpen={open} onClose={onClose}>
        <CreateNewHabitForm onClose={onClose} />
      </BottomSheet>
    </>
  );
};
