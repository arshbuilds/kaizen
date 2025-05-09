export type DailyStats = {
  doneCount: number;
  notDoneCount: number;
  taskIdsDone: string[];
  taskIdsMissed: string[];            
  timeSpentByCategory: Record<string, number>; 
  rating: "low" | "good" | "great";  
};

export type MonthStats = {
  [day: string]: DailyStats; 
};

export type AllCalendarStats = {
  [monthId: string]: MonthStats; 
};

export type Rating = "low" | "good" | "great" | "missed";