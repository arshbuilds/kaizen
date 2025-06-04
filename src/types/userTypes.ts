import { FirestoreTimestamp } from "../lib/firebase";

export type GrowthActivityType = {
  title: string;
  timestamp: FirestoreTimestamp;
  coins: number;
  badge?: string; // optional, only for milestone events
};

export type FollowerType = {
  uid: string;
  followedAt: FirestoreTimestamp;
};

export type FollowingType = {
  uid: string;
  followedAt: FirestoreTimestamp;
};



export type userType = {
  userId: string;
  userName: string;
  email: string;
  pfpUrl: string;
  role: string;
  interests: string[]; // e.g., ["Meditation", "Fitness"]
  createdAt: FirestoreTimestamp;
  goals: string[];
  // Stats
  followingCount: number;
  followersCount: number;
  goalsCount: number;

  // Daily Focus & Wellness
  dailyFocusHours: number;
  dailyFocusDelta: number; // in percent
  wellbeingScore: number;
  wellbeingDelta: number;  // in percent



  // Achievements
  dayStreak: number;
  meditationHours: number; // in hours
  badgesCount: number;
  bestStreak: number;

  // Coins & Ranking
  totalCoins: number;
  weeklyCoins: number;
  todayCoins: number;
  percentileRank: number; // e.g., "Top 5%"

  // Metadata
  lastUpdated?: FirestoreTimestamp;
};


