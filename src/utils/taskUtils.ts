import { goalOutputType } from "../types/goalTypes";
import { habitOutputType } from "../types/habitTypes";
import { todoOutputType } from "../types/todoTypes";

export const getTodayProgress = (
  habits: Array<habitOutputType>,
  todos: Array<todoOutputType>
) => {
  const totalTasks = habits.length + todos.length;
  let doneTasks = 0;
  habits.forEach((doc) => {
    if (doc.status) {
      doneTasks++;
    }
  });
  todos.forEach((doc) => {
    if (doc.status) {
      doneTasks++;
    }
  });
  const progress = Math.round((doneTasks / totalTasks) * 100);
  return { totalTasks, doneTasks, progress };
};

export const getProfileStats = (data: goalOutputType[]) => {
  let timeSpentInHours = 0
  let tasksCompleted = 0;
  data.forEach((doc) => {
    timeSpentInHours += doc.timeSpent;
    tasksCompleted += doc.doneTodos;
  });
  timeSpentInHours = Math.round((timeSpentInHours/60 + Number.EPSILON) * 100) / 100

  return {timeSpentInHours , tasksCompleted };
};
