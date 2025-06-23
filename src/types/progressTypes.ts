export type DailyStats = {
  date: string;
  doneCount: number;
  notDoneCount: number;
  taskIdsDone: string[];
  taskIdsMissed: string[];            
  timeSpentByCategory: Record<string, number>; 
  timeSpentPerTimeOfDay: Record<string, number>;
  totalTimeSpent: number;
};

export type MonthStats = {
  [day: string]: DailyStats; 
};

export type AllCalendarStats = {
  [monthId: string]: MonthStats; 
};
