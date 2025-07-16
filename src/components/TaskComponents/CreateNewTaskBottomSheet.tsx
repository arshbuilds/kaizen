"use client";
import { useEffect, useState } from "react";
import BottomSheet from "../ui/bottomSheet";
import CreateNewHabitForm from "../Habits/CreateNewHabitForm";
import CreateNewTodoForm from "../Todos/CreateNewTodoForm";
import { Button } from "@/components/ui/button";
import { Plus, Target } from "lucide-react";
import { App } from "@capacitor/app";

export const CreateNewTodoBottomSheet = () => {
  const [open, setOpen] = useState(false);
  const onClose = () => {
    setOpen(false);
  };
  useEffect(() => {
    App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack && open === true) {
        setOpen(false);
      } else {
        App.exitApp();
      }
    });

    return () => {
      App.removeAllListeners();
    };
  }, [open]);
  return (
    <>
      <Button
        variant="default"
        className="transition h-20 bg-[#262636]/60 focus:bg-slate-700 border-slate-700 hover:bg-slate-700  flex flex-col items-center gap-2 rounded-2xl"
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
  useEffect(() => {
    App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack && open === true) {
        setOpen(false);
      } else {
        App.exitApp();
      }
    });

    return () => {
      App.removeAllListeners();
    };
  }, [open]);

  return (
    <>
      <Button
        variant="default"
        className="bg-[#262636]/60 transition h-20 border-slate-700 hover:bg-slate-700 focus:bg-slate-700 flex flex-col items-center gap-2 rounded-2xl"
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
