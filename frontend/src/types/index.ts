// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ─── Subject ──────────────────────────────────────────────────────────────────

export interface Subject {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  _count?: { topics: number; sessions: number };
}

// ─── Topic ────────────────────────────────────────────────────────────────────

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  createdAt: string;
  _count?: { sessions: number };
}

// ─── Session ──────────────────────────────────────────────────────────────────

export type SessionType = 'TEORIA' | 'EXERCICIOS' | 'REVISAO';

export interface StudySession {
  id: string;
  userId: string;
  subjectId: string;
  topicId?: string;
  type: SessionType;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  createdAt: string;
  subject?: Subject;
  topic?: Topic;
  note?: Note;
}

// ─── Note ─────────────────────────────────────────────────────────────────────

export interface Note {
  id: string;
  sessionId: string;
  content: string;
  difficulties?: string;
  keyPoints?: string;
  createdAt: string;
}

// ─── Goal ─────────────────────────────────────────────────────────────────────

export type GoalType = 'DAILY_MINUTES' | 'WEEKLY_SESSIONS';
export type GoalPeriod = 'DAILY' | 'WEEKLY';

export interface Goal {
  id: string;
  userId: string;
  type: GoalType;
  targetValue: number;
  period: GoalPeriod;
  createdAt: string;
  // Calculados no backend
  current?: number;
  percentage?: number;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardToday {
  date: string;
  minutesToday: number;
  sessionsToday: number;
  sessions: StudySession[];
  goals: Goal[];
  suggestions: {
    recentTopics: {
      topicId: string;
      topicName?: string;
      subjectName: string;
      lastStudied: string;
    }[];
    subjectsByMinutes: { subjectId: string; totalMinutes: number }[];
  };
}
