import { habitType } from "../types/habitTypes";
import { todoOutputType } from "../types/todoTypes";

export const getHabitProgress = (data: Array<habitType>) => {
    const total = data.length;
    let done = 0;
    data.forEach((doc)=> {
        if(doc.status){
            done++;
        }
    })

    return { total , done}
}

export const getTodayProgress = (habits: Array<habitType>, todos: Array<todoOutputType>) => {
    const totalTasks = habits.length + todos.length;
    let doneTasks = 0;
    habits.forEach((doc)=> {
        if(doc.status){
            doneTasks++;
        }
    })
    todos.forEach((doc)=> {
        if(doc.status){
            doneTasks++;
        }
    })

    return (doneTasks/totalTasks)*100;
}

