export type DomainId = 1 | 2 | 3 | 4 | 5 | 6;

export interface DomainInfo {
  id: DomainId;
  title: string;
  weight: number; // percentage, e.g. 7, 10, 20, 20, 30, 13
  description: string;
  topics: string[];
  mockQuestionTarget: number; // 4, 6, 12, 12, 18, 8
  isHighPriority?: boolean; // Domain 5 is 30%
  color: string;
}

export type TopicStatus = 'Not Started' | 'In Progress' | 'Needs Review' | 'Mastered';

export interface StudyTask {
  id: string;
  date: string; // 'YYYY-MM-DD'
  title: string;
  description: string;
  domainId: DomainId | null;
  topic: string;
  estimatedMinutes: number;
  actualMinutes: number;
  completed: boolean;
  topicStatus: TopicStatus;
  personalNotes?: string;
  weekNumber: number; // 1, 2, or 3
}

export interface StudySession {
  id: string;
  date: string; // 'YYYY-MM-DD'
  timestamp: number;
  domainId: DomainId;
  topic: string;
  durationMinutes: number;
  notes: string;
}

export interface QuizQuestion {
  id: string;
  domainId: DomainId;
  domainTitle: string;
  topic: string;
  type: 'single' | 'multiple';
  prompt: string;
  options: { id: string; text: string }[];
  correctAnswerIds: string[]; // e.g. ['A'] or ['A', 'C']
  explanation: string;
  optionExplanations?: Record<string, string>;
  source: 'built-in' | 'ai-generated' | 'user';
  referenceUrl?: string;
}

export interface MistakeRecord {
  id: string;
  questionId: string;
  question: QuizQuestion;
  selectedAnswerIds: string[];
  dateLogged: string;
  lastReviewedDate?: string;
  userNote?: string;
  status: 'Needs Review' | 'Reviewing' | 'Mastered';
  timesIncorrect: number;
}

export interface QuizAttempt {
  id: string;
  date: string;
  timestamp: number;
  type: 'quick' | 'domain' | 'mock' | 'mistakes';
  domainId?: DomainId;
  totalQuestions: number;
  score: number; // correct count
  percentage: number;
  timeSpentSeconds: number;
  domainBreakdown?: Record<number, { total: number; correct: number }>;
}

export interface MockExamRecord {
  id: string;
  date: string;
  timestamp: number;
  timeSpentSeconds: number;
  score: number;
  percentage: number;
  domainScores: Record<number, { total: number; correct: number; percentage: number }>;
  flaggedQuestionIds: string[];
  userAnswers: Record<string, string[]>;
  questions: QuizQuestion[];
}

export interface StudyNote {
  id: string;
  domainId: DomainId;
  topic: string;
  title: string;
  content: string;
  keyTerms?: { term: string; definition: string }[];
  isBookmarked: boolean;
  lastUpdated: string;
}

export interface AppState {
  tasks: StudyTask[];
  sessions: StudySession[];
  mistakes: MistakeRecord[];
  quizAttempts: QuizAttempt[];
  mockAttempts: MockExamRecord[];
  notes: StudyNote[];
  customQuestions: QuizQuestion[];
  targetReadinessScore: number; // default 85
  simulatedDate: string; // default '2026-10-08'
  useSimulatedDate: boolean;
  bookmarkedTopics: string[];
}
