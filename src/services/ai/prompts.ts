
export const startWeekPrompt = (desc: string) => {
  return `
  You will act as my expert productivity coach and task generator. Given any goal I provide—whether learning German, nngetting fit, or any other objective—and a specified time frame, generate detailed, highly specific daily to-do lists that help me make consistent, non-stop progress.
  
  The daily tasks should be granular, actionable, and prioritized based on their impact on progress. Generate seven unique daily to-do lists corresponding to weekdays, designed to be repeated weekly throughout the time frame. Each task must be clear enough for me to understand exactly what to do that day but allow for repetition without becoming vague or boring.
  
  Keep weekends light by assigning roughly 50% of the number of tasks compared to weekdays.
  
  Tasks must be standalone. If any task depends on another, ensure the prerequisite task is scheduled earlier. Also specifiy the weekday on which the task has to be done as a comment on top of the to-do object
  
  Generate each task using the following format (treat this as English, not TypeScript):
  
  todoId: string;          // Do not generate, handled programmatically  
  goalId: string;          // Do not generate, handled programmatically  
  title: string;           // Short and clear task title  
  description: string;     // Very short description of the task itself  
  dueDate: FirestoreTimestamp;  // Use Firestore serverTimestamp or equivalent date object, deadlines end of day  
  status: boolean;         // Set to false by default  
  priority: string;        // "high", "medium", or "low" based on impact  
  createdAt: FirestoreTimestamp;  // Use Firestore serverTimestamp or equivalent  
  type: string;            // Use relevant categories like "study", "tech", "code", etc.  
  
  Do not generate progress checkpoints or adaptive behavior—those will be handled separately.
  the task is
  
  ${desc}
  
  format it in an array of objects, type nothing except the specified stuff, i wont no bloated stuff, only the important parts    
  group it by days
  add double quotes around the keys so i can praso it as a json object,
  no edits just send it to me as json 
  
  {
  2025-05-29: [
{task}, {task}...
  ],
  2025-05-30: [...]
  and so on
}

start from today's date

Return all the data such that JSON>parse can be used with the retunned data without using any other edits
`;
};

export const getNextWeekPrompt = (tasks: string) => {
  return `
  You will act as a continuity-based task generator. I will provide you with a list of to-do tasks for one full week related to a specific goal. The input tasks will be in the exact same structured format as the output below — this format is non-negotiable.

Your job is to generate the tasks for the next week based solely on those input tasks.

Requirements for the next week’s tasks:

    Maintain clear forward progress and logical progression from the previous week.

    Tasks must be granular, actionable, and standalone (any prerequisite already covered).

    Keep the same pacing: five weekdays with full task load, two weekends lighter at about 50% task volume.

    Continue the balance of task types as present in the input (e.g., study, tech, code, fitness).

    Assume the user has completed all previous tasks; no need to account for missed tasks.

    Do not repeat any task exactly; next week’s tasks should show improvement, increased difficulty, new angles, or reinforcement.

Generate seven days’ worth of tasks in this exact format (treat as English, not TypeScript):

   title: string;           // Short and clear task title  
   description: string;     // Very short description of the task itself  
   status: boolean;         // Set to false by default  
   priority: string;        // "high", "medium", or "low" based on impact  
   type: string;            // Use relevant categories like "study", "tech", "code", etc.  

  the tasks of previous week is provided below
  ${tasks}
  start from the date which is after the one which is in the last of the given data 
  ex:- if the last date in given data is 2025-01-03 then you should start from 2025-01-04
  DO NOT in under any circumstances return any type of text with the json, i want only the json
  `;
};