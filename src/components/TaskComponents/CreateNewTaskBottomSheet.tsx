"use client"
import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import BottomSheet from "../ui/bottomSheet";
import CreateNewHabitForm from "../Habits/CreateNewHabitForm";
import CreateNewTodoForm from "../Todos/CreateNewTodoForm";

const CreateNewTaskBottomSheet = () => {
  const [open, setOpen] = useState(false);
  const [isHabitOpen, setIsHabitOpen] = useState(true);
  const onClose = () => {
    setOpen(false);
  };
  return (
    <main className="flex flex-col items-center justify-center">
      <button
        onClick={() => setOpen(true)}
        className="p-4 absolute bottom-5 right-5 bg-[#616ae9] text-white rounded-full shadow"
      >
        <FiPlus />
      </button>
      <BottomSheet isOpen={open} onClose={onClose}>
        <div className="flex w-full bg-[#1e293b] rounded-lg p-1 mb-4">
          <button
            onClick={() => setIsHabitOpen(false)}
            className={`w-1/2 py-2 text-sm   ${
              !isHabitOpen
                ? "bg-purple-600 text-white rounded-lg"
                : "text-gray-300 hover:text-white"
            }`}
          >
            Todo
          </button>
          <button
            onClick={() => setIsHabitOpen(true)}
            className={`w-1/2 py-2 text-sm  ${
              isHabitOpen
                ? "bg-purple-600 text-white rounded-lg"
                : "text-gray-300 hover:text-white"
            }`}
          >
            Habit
          </button>
        </div>
        {isHabitOpen ? (
          <CreateNewHabitForm onClose={onClose} />
        ) : (
          <CreateNewTodoForm onClose={onClose} />
        )}
      </BottomSheet>
    </main>
  );
};

export default CreateNewTaskBottomSheet;
