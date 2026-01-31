
export enum UserLevel {
  BEGINNER = 'Beginner (A1-A2)',
  INTERMEDIATE = 'Intermediate (B1-B2)',
  ADVANCED = 'Advanced (C1-C2)'
}

export interface UserStats {
  totalStars: number;
  dayStreak: number;
  totalConversations: number;
}

export interface UserProfile {
  name: string;
  email: string;
  ageGroup: string;
  interests: string[];
  level: UserLevel;
  stats: UserStats;
  onboarded: boolean;
  weakPoints: any[];
  badges: string[];
}

export interface Message {
  role: 'vic' | 'user';
  text: string;
  correction?: string;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
}
