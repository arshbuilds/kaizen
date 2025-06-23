import React from "react";
import {
  CreateNewHabitBottomSheet,
  CreateNewTodoBottomSheet,
} from "../TaskComponents/CreateNewTaskBottomSheet";

const QuickActions = () => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-4">
        <CreateNewTodoBottomSheet />
        <CreateNewHabitBottomSheet />
      </div>
    </div>
  );
};
export default QuickActions;
