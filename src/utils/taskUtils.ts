import { habitType } from "../types/habitTypes";
import { todoOutputType } from "../types/todoTypes";

export const getTodayProgress = (
  habits: Array<habitType>,
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
  const progress = (doneTasks / totalTasks) * 100;
  return { totalTasks, doneTasks, progress };
};
