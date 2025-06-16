export type DailyStats = {
  date: string;
  doneCount: number;
  notDoneCount: number;
  productivityScore: number;
  rating: Rating;  
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

export type Rating = "low" | "good" | "great" | "missed";