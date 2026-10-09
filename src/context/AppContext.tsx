import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  DomainId,
  StudyTask,
  StudySession,
  QuizQuestion,
  MistakeRecord,
  QuizAttempt,
  MockExamRecord,
  StudyNote,
  TopicStatus,
} from '../types';
import { INITIAL_STUDY_TASKS } from '../data/initialSchedule';
import { INITIAL_QUESTION_BANK } from '../data/questionBank';
import { INITIAL_KNOWLEDGE_NOTES } from '../data/knowledgeNotes';
import { OFFICIAL_DOMAINS } from '../data/domains';

const STORAGE_KEYS = {
  TASKS: 'csa_quest_tasks_v1',
  SESSIONS: 'csa_quest_sessions_v1',
  MISTAKES: 'csa_quest_mistakes_v1',
  QUIZ_ATTEMPTS: 'csa_quest_quiz_attempts_v1',
  MOCK_ATTEMPTS: 'csa_quest_mock_attempts_v1',
  NOTES: 'csa_quest_notes_v1',
  CUSTOM_QUESTIONS: 'csa_quest_custom_questions_v1',
  TARGET_SCORE: 'csa_quest_target_score_v1',
  SIMULATED_DATE: 'csa_quest_simulated_date_v1',
  THEME: 'csa_quest_theme_v1',
};

export type AppTheme = 'pastel-pink' | 'pastel-noir';

export interface ActiveTimerState {
  isRunning: boolean;
  isPaused: boolean;
  elapsedSeconds: number; // strictly counts active (unpaused) study time
  domainId: DomainId;
  topic: string;
}

export interface DomainMasteryScore {
  domainId: DomainId;
  title: string;
  weight: number;
  isHighPriority?: boolean;
  tasksCompleted: number;
  tasksTotal: number;
  questionsAnswered: number;
  questionsCorrect: number;
  quizAccuracy: number;
  masteryPercentage: number; // 0 - 100
  color: string;
}

export interface EndSessionOptions {
  domainId?: DomainId;
  topic?: string;
  durationMinutes?: number;
  notes?: string;
}

interface AppContextType {
  // Theme State
  theme: AppTheme;
  toggleTheme: () => void;
  setTheme: (theme: AppTheme) => void;

  // Date State
  currentDate: string;
  setSimulatedDate: (date: string) => void;
  resetToToday: () => void;
  isWeekend: boolean;
  isExamDay: boolean;

  // Tasks & Planner
  tasks: StudyTask[];
  todayTasks: StudyTask[];
  toggleTaskComplete: (taskId: string, actualMinutes?: number) => void;
  updateTaskStatus: (taskId: string, status: TopicStatus) => void;
  updateTaskNotes: (taskId: string, notes: string) => void;
  rescheduleTask: (taskId: string, newDate: string) => void;
  addNewTask: (task: Omit<StudyTask, 'id' | 'actualMinutes' | 'completed'>) => void;

  // Study Session Tracker
  sessions: StudySession[];
  activeTimer: ActiveTimerState | null;
  startStudySession: (domainId?: DomainId, topic?: string) => void;
  pauseStudySession: () => void;
  resumeStudySession: () => void;
  endStudySession: (options?: EndSessionOptions | string) => StudySession | null;
  recordCompletedSession: (session: { domainId: DomainId; topic: string; durationMinutes: number; notes?: string }) => StudySession;
  discardStudySession: () => void;

  // Quiz Engine & Mock Exam
  questionBank: QuizQuestion[];
  quizAttempts: QuizAttempt[];
  mockAttempts: MockExamRecord[];
  recordQuizAttempt: (attempt: Omit<QuizAttempt, 'id' | 'timestamp'>) => void;
  recordMockAttempt: (mock: Omit<MockExamRecord, 'id' | 'timestamp'>) => void;
  addCustomQuestion: (question: Omit<QuizQuestion, 'id'>) => void;

  // Mistake Notebook
  mistakes: MistakeRecord[];
  logMistake: (question: QuizQuestion, selectedAnswers: string[]) => void;
  updateMistakeNote: (mistakeId: string, note: string) => void;
  updateMistakeStatus: (mistakeId: string, status: 'Needs Review' | 'Reviewing' | 'Mastered') => void;
  removeMistake: (mistakeId: string) => void;

  // Notes & Knowledge Base
  notes: StudyNote[];
  addNote: (note: Omit<StudyNote, 'id' | 'lastUpdated'>) => void;
  updateNote: (id: string, partial: Partial<StudyNote>) => void;
  toggleBookmarkNote: (id: string) => void;
  deleteNote: (id: string) => void;

  // Metrics & Dashboard
  domainMastery: DomainMasteryScore[];
  overallMasteryPercentage: number;
  totalStudyMinutes: number;
  totalSessionsCompleted: number;
  totalQuestionsAnswered: number;
  overallAccuracyPercentage: number;
  masteredTopicsCount: number;
  weekdayStreak: number;
  daysUntilExam: number;
  targetReadinessScore: number;
  setTargetReadinessScore: (score: number) => void;

  // Data import/export
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => { success: boolean; error?: string };
  resetAllData: () => void;

  // Notification / Session Finished Modal State
  finishedSessionSummary: StudySession | null;
  clearFinishedSessionSummary: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper: check if YYYY-MM-DD is a weekend (Sat or Sun)
export function checkIsWeekend(dateStr: string): boolean {
  const parts = dateStr.split('-');
  const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  const day = date.getDay();
  return day === 0 || day === 6; // 0=Sunday, 6=Saturday
}

// Helper: parse local date string without timezone shifts
export function parseDateString(dateStr: string): Date {
  const parts = dateStr.split('-');
  return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
}

// Helper: format Date to YYYY-MM-DD
export function formatDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const EXAM_DATE_STRING = '2026-10-30';
const DEFAULT_SIMULATED_DATE = '2026-10-08'; // initial reference timestamp

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load tasks
  const [tasks, setTasks] = useState<StudyTask[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_STUDY_TASKS;
  });

  // Load study sessions
  const [sessions, setSessions] = useState<StudySession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Load mistake notebook
  const [mistakes, setMistakes] = useState<MistakeRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MISTAKES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Load quiz attempts
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.QUIZ_ATTEMPTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Load mock attempts
  const [mockAttempts, setMockAttempts] = useState<MockExamRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MOCK_ATTEMPTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Load knowledge notes
  const [notes, setNotes] = useState<StudyNote[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_KNOWLEDGE_NOTES;
  });

  // Custom questions
  const [customQuestions, setCustomQuestions] = useState<QuizQuestion[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_QUESTIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Target score (default 85%)
  const [targetReadinessScore, setTargetReadinessScoreState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TARGET_SCORE);
      if (saved) return Number(saved);
    } catch (e) {
      console.error(e);
    }
    return 85;
  });

  // Current date (defaults to Oct 8, 2026 or today)
  const [currentDate, setCurrentDate] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SIMULATED_DATE);
      if (saved) return saved;
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_SIMULATED_DATE;
  });

  // Theme (defaults to pastel-pink)
  const [theme, setThemeState] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      if (saved === 'pastel-noir' || saved === 'pastel-pink') return saved;
    } catch (e) {
      console.error(e);
    }
    return 'pastel-pink';
  });

  const toggleTheme = () => {
    const next = theme === 'pastel-pink' ? 'pastel-noir' : 'pastel-pink';
    setThemeState(next);
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, next);
    } catch {}
  };

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    } catch {}
  };

  useEffect(() => {
    if (theme === 'pastel-noir') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'pastel-noir');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'pastel-pink');
    }
  }, [theme]);

  // Active Timer
  const [activeTimer, setActiveTimer] = useState<ActiveTimerState | null>(null);
  const [finishedSessionSummary, setFinishedSessionSummary] = useState<StudySession | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MISTAKES, JSON.stringify(mistakes));
  }, [mistakes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUIZ_ATTEMPTS, JSON.stringify(quizAttempts));
  }, [quizAttempts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MOCK_ATTEMPTS, JSON.stringify(mockAttempts));
  }, [mockAttempts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_QUESTIONS, JSON.stringify(customQuestions));
  }, [customQuestions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TARGET_SCORE, String(targetReadinessScore));
  }, [targetReadinessScore]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SIMULATED_DATE, currentDate);
  }, [currentDate]);

  // Active study timer interval (counts only unpaused seconds)
  useEffect(() => {
    if (!activeTimer || !activeTimer.isRunning || activeTimer.isPaused) return;

    const interval = setInterval(() => {
      setActiveTimer((prev) => {
        if (!prev || !prev.isRunning || prev.isPaused) return prev;
        return { ...prev, elapsedSeconds: prev.elapsedSeconds + 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer?.isRunning, activeTimer?.isPaused]);

  // Combined Question Bank
  const questionBank = useMemo(() => {
    return [...INITIAL_QUESTION_BANK, ...customQuestions];
  }, [customQuestions]);

  // Current Date derived values
  const isWeekend = useMemo(() => checkIsWeekend(currentDate), [currentDate]);
  const isExamDay = useMemo(() => currentDate === EXAM_DATE_STRING, [currentDate]);

  const daysUntilExam = useMemo(() => {
    const cur = parseDateString(currentDate);
    const exam = parseDateString(EXAM_DATE_STRING);
    const diffTime = exam.getTime() - cur.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, [currentDate]);

  // Tasks for current date
  const todayTasks = useMemo(() => {
    if (isWeekend) return []; // Saturdays and Sundays are protected rest days!
    return tasks.filter((t) => t.date === currentDate);
  }, [tasks, currentDate, isWeekend]);

  // Total study minutes from sessions and completed tasks
  const totalStudyMinutes = useMemo(() => {
    return sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  }, [sessions]);

  const totalSessionsCompleted = useMemo(() => sessions.length, [sessions]);

  // Quiz statistics
  const totalQuestionsAnswered = useMemo(() => {
    const regularQuizQuestions = quizAttempts.reduce((acc, q) => acc + q.totalQuestions, 0);
    const mockQuestions = mockAttempts.reduce((acc, m) => acc + m.questions.length, 0);
    return regularQuizQuestions + mockQuestions;
  }, [quizAttempts, mockAttempts]);

  const overallAccuracyPercentage = useMemo(() => {
    const regularCorrect = quizAttempts.reduce((acc, q) => acc + q.score, 0);
    const regularTotal = quizAttempts.reduce((acc, q) => acc + q.totalQuestions, 0);
    const mockCorrect = mockAttempts.reduce((acc, m) => acc + m.score, 0);
    const mockTotal = mockAttempts.reduce((acc, m) => acc + m.questions.length, 0);

    const total = regularTotal + mockTotal;
    if (total === 0) return 0;
    return Math.round(((regularCorrect + mockCorrect) / total) * 100);
  }, [quizAttempts, mockAttempts]);

  const masteredTopicsCount = useMemo(() => {
    return tasks.filter((t) => t.topicStatus === 'Mastered').length;
  }, [tasks]);

  // Weekday study streak calculation
  const weekdayStreak = useMemo(() => {
    if (sessions.length === 0) return 0;
    // Map unique dates with recorded sessions
    const sessionDates = new Set(sessions.map((s) => s.date));
    let streak = 0;
    let cursor = parseDateString(currentDate);

    // If current date has session, start checking backwards
    // Skip weekends when calculating weekday streak
    for (let i = 0; i < 30; i++) {
      const dateStr = formatDateString(cursor);
      const isWknd = checkIsWeekend(dateStr);

      if (!isWknd) {
        if (sessionDates.has(dateStr)) {
          streak++;
        } else if (i === 0) {
          // Today might not be completed yet, check yesterday
        } else {
          break;
        }
      }

      // Step back one day
      cursor.setDate(cursor.getDate() - 1);
    }

    return streak;
  }, [sessions, currentDate]);

  // Domain Mastery: recorded quiz performance + topic completion + weight
  const domainMastery = useMemo(() => {
    return OFFICIAL_DOMAINS.map((domain) => {
      // Tasks for this domain
      const domainTasks = tasks.filter((t) => t.domainId === domain.id);
      const tasksTotal = domainTasks.length;
      const tasksCompleted = domainTasks.filter((t) => t.completed).length;

      // Quiz answers for this domain
      let questionsAnswered = 0;
      let questionsCorrect = 0;

      // From regular quiz attempts
      quizAttempts.forEach((attempt) => {
        if (attempt.domainBreakdown && attempt.domainBreakdown[domain.id]) {
          questionsAnswered += attempt.domainBreakdown[domain.id].total;
          questionsCorrect += attempt.domainBreakdown[domain.id].correct;
        } else if (attempt.domainId === domain.id) {
          questionsAnswered += attempt.totalQuestions;
          questionsCorrect += attempt.score;
        }
      });

      // From mock exam attempts
      mockAttempts.forEach((mock) => {
        if (mock.domainScores && mock.domainScores[domain.id]) {
          questionsAnswered += mock.domainScores[domain.id].total;
          questionsCorrect += mock.domainScores[domain.id].correct;
        }
      });

      const quizAccuracy = questionsAnswered > 0 ? Math.round((questionsCorrect / questionsAnswered) * 100) : 0;

      // Mastered topics ratio
      const masteredRatio = tasksTotal > 0
        ? domainTasks.filter((t) => t.topicStatus === 'Mastered').length / tasksTotal
        : 0;

      // Task completion ratio
      const taskRatio = tasksTotal > 0 ? tasksCompleted / tasksTotal : 0;

      // Mastery formula:
      // If quiz questions were taken: 60% quiz accuracy + 25% task completion + 15% mastered status
      // If no quiz questions taken yet: 70% task completion + 30% topic mastered status
      let masteryScore = 0;
      if (questionsAnswered > 0) {
        masteryScore = Math.round(quizAccuracy * 0.6 + taskRatio * 25 + masteredRatio * 15);
      } else {
        masteryScore = Math.round(taskRatio * 70 + masteredRatio * 30);
      }
      masteryScore = Math.min(100, Math.max(0, masteryScore));

      return {
        domainId: domain.id,
        title: domain.title,
        weight: domain.weight,
        isHighPriority: domain.isHighPriority,
        tasksCompleted,
        tasksTotal,
        questionsAnswered,
        questionsCorrect,
        quizAccuracy,
        masteryPercentage: masteryScore,
        color: domain.color,
      };
    });
  }, [tasks, quizAttempts, mockAttempts]);

  // Overall Preparation Percentage: weighted sum across all 6 domains
  const overallMasteryPercentage = useMemo(() => {
    let weightedSum = 0;
    domainMastery.forEach((dm) => {
      weightedSum += (dm.masteryPercentage * dm.weight) / 100;
    });

    // Mock exam bonus if completed at least one mock exam
    const mockBonus = mockAttempts.length > 0 ? 5 : 0;
    return Math.min(100, Math.round(weightedSum + mockBonus));
  }, [domainMastery, mockAttempts]);

  // Date controls
  const setSimulatedDate = (newDate: string) => {
    setCurrentDate(newDate);
  };

  const resetToToday = () => {
    setCurrentDate(DEFAULT_SIMULATED_DATE);
  };

  // Task methods
  const toggleTaskComplete = (taskId: string, actualMinutes?: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextCompleted = !t.completed;
          return {
            ...t,
            completed: nextCompleted,
            actualMinutes: actualMinutes !== undefined ? actualMinutes : nextCompleted ? t.estimatedMinutes : t.actualMinutes,
            topicStatus: nextCompleted ? (t.topicStatus === 'Not Started' ? 'In Progress' : t.topicStatus) : t.topicStatus,
          };
        }
        return t;
      })
    );
  };

  const updateTaskStatus = (taskId: string, status: TopicStatus) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            topicStatus: status,
            completed: status === 'Mastered' ? true : t.completed,
          };
        }
        return t;
      })
    );
  };

  const updateTaskNotes = (taskId: string, notesText: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, personalNotes: notesText } : t))
    );
  };

  const rescheduleTask = (taskId: string, newDate: string) => {
    // Ensure new date is a weekday!
    if (checkIsWeekend(newDate)) {
      console.warn('Cannot reschedule to a weekend rest day.');
      return;
    }
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, date: newDate } : t))
    );
  };

  const addNewTask = (taskData: Omit<StudyTask, 'id' | 'actualMinutes' | 'completed'>) => {
    const newTask: StudyTask = {
      ...taskData,
      id: `task-custom-${Date.now()}`,
      actualMinutes: 0,
      completed: false,
    };
    setTasks((prev) => [...prev, newTask]);
  };

  // Study Session Controls
  const startStudySession = (domainId?: DomainId, topic?: string) => {
    setActiveTimer({
      isRunning: true,
      isPaused: false,
      elapsedSeconds: 0,
      domainId: domainId || 5, // Default to highest priority Domain 5 (Database/Security) if not specified
      topic: topic || 'Database & Platform Security',
    });
  };

  const pauseStudySession = () => {
    setActiveTimer((prev) => (prev ? { ...prev, isPaused: true } : null));
  };

  const resumeStudySession = () => {
    setActiveTimer((prev) => (prev ? { ...prev, isPaused: false } : null));
  };

  const endStudySession = (options?: EndSessionOptions | string): StudySession | null => {
    if (!activeTimer) return null;

    let finalDomainId = activeTimer.domainId;
    let finalTopic = activeTimer.topic;
    let finalDurationMinutes = Math.max(1, Math.round(activeTimer.elapsedSeconds / 60));
    let finalNotes = '';

    if (typeof options === 'string') {
      finalNotes = options;
    } else if (options) {
      if (options.domainId) finalDomainId = options.domainId;
      if (options.topic) finalTopic = options.topic;
      if (options.durationMinutes !== undefined && options.durationMinutes > 0) {
        finalDurationMinutes = options.durationMinutes;
      }
      if (options.notes !== undefined) {
        finalNotes = options.notes;
      }
    }

    const newSession: StudySession = {
      id: `session-${Date.now()}`,
      date: currentDate,
      timestamp: Date.now(),
      domainId: finalDomainId,
      topic: finalTopic,
      durationMinutes: finalDurationMinutes,
      notes: finalNotes,
    };

    setSessions((prev) => [newSession, ...prev]);

    // Also update any matching task for this date
    setTasks((prev) =>
      prev.map((t) => {
        if (t.date === currentDate && (t.domainId === finalDomainId || t.topic === finalTopic)) {
          return {
            ...t,
            actualMinutes: (t.actualMinutes || 0) + finalDurationMinutes,
            completed: true,
            topicStatus: t.topicStatus === 'Not Started' ? 'In Progress' : t.topicStatus,
          };
        }
        return t;
      })
    );

    setActiveTimer(null);
    setFinishedSessionSummary(newSession);
    return newSession;
  };

  const recordCompletedSession = (sessionData: {
    domainId: DomainId;
    topic: string;
    durationMinutes: number;
    notes?: string;
  }): StudySession => {
    const newSession: StudySession = {
      id: `session-${Date.now()}`,
      date: currentDate,
      timestamp: Date.now(),
      domainId: sessionData.domainId,
      topic: sessionData.topic,
      durationMinutes: Math.max(1, sessionData.durationMinutes),
      notes: sessionData.notes || '',
    };

    setSessions((prev) => [newSession, ...prev]);

    setTasks((prev) =>
      prev.map((t) => {
        if (t.date === currentDate && (t.domainId === sessionData.domainId || t.topic === sessionData.topic)) {
          return {
            ...t,
            actualMinutes: (t.actualMinutes || 0) + sessionData.durationMinutes,
            completed: true,
            topicStatus: t.topicStatus === 'Not Started' ? 'In Progress' : t.topicStatus,
          };
        }
        return t;
      })
    );

    setActiveTimer(null);
    setFinishedSessionSummary(newSession);
    return newSession;
  };

  const discardStudySession = () => {
    setActiveTimer(null);
  };

  const clearFinishedSessionSummary = () => {
    setFinishedSessionSummary(null);
  };

  // Mistake Notebook
  const logMistake = (question: QuizQuestion, selectedAnswers: string[]) => {
    setMistakes((prev) => {
      const existing = prev.find((m) => m.questionId === question.id);
      if (existing) {
        return prev.map((m) =>
          m.questionId === question.id
            ? {
                ...m,
                selectedAnswerIds: selectedAnswers,
                lastReviewedDate: currentDate,
                timesIncorrect: m.timesIncorrect + 1,
                status: 'Needs Review',
              }
            : m
        );
      }
      const newMistake: MistakeRecord = {
        id: `mistake-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        questionId: question.id,
        question,
        selectedAnswerIds: selectedAnswers,
        dateLogged: currentDate,
        lastReviewedDate: currentDate,
        userNote: '',
        status: 'Needs Review',
        timesIncorrect: 1,
      };
      return [newMistake, ...prev];
    });
  };

  const updateMistakeNote = (mistakeId: string, note: string) => {
    setMistakes((prev) =>
      prev.map((m) => (m.id === mistakeId ? { ...m, userNote: note } : m))
    );
  };

  const updateMistakeStatus = (mistakeId: string, status: 'Needs Review' | 'Reviewing' | 'Mastered') => {
    setMistakes((prev) =>
      prev.map((m) =>
        m.id === mistakeId ? { ...m, status, lastReviewedDate: currentDate } : m
      )
    );
  };

  const removeMistake = (mistakeId: string) => {
    setMistakes((prev) => prev.filter((m) => m.id !== mistakeId));
  };

  // Quiz Attempts
  const recordQuizAttempt = (attempt: Omit<QuizAttempt, 'id' | 'timestamp'>) => {
    const newAttempt: QuizAttempt = {
      ...attempt,
      id: `quiz-attempt-${Date.now()}`,
      timestamp: Date.now(),
    };
    setQuizAttempts((prev) => [newAttempt, ...prev]);
  };

  const recordMockAttempt = (mock: Omit<MockExamRecord, 'id' | 'timestamp'>) => {
    const newMock: MockExamRecord = {
      ...mock,
      id: `mock-exam-${Date.now()}`,
      timestamp: Date.now(),
    };
    setMockAttempts((prev) => [newMock, ...prev]);
  };

  const addCustomQuestion = (questionData: Omit<QuizQuestion, 'id'>) => {
    const newQ: QuizQuestion = {
      ...questionData,
      id: `q-custom-${Date.now()}`,
    };
    setCustomQuestions((prev) => [newQ, ...prev]);
  };

  // Notes
  const addNote = (noteData: Omit<StudyNote, 'id' | 'lastUpdated'>) => {
    const newNote: StudyNote = {
      ...noteData,
      id: `note-${Date.now()}`,
      lastUpdated: currentDate,
    };
    setNotes((prev) => [newNote, ...prev]);
  };

  const updateNote = (id: string, partial: Partial<StudyNote>) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...partial, lastUpdated: currentDate } : n))
    );
  };

  const toggleBookmarkNote = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isBookmarked: !n.isBookmarked } : n))
    );
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  // Settings & Storage
  const setTargetReadinessScore = (score: number) => {
    setTargetReadinessScoreState(score);
  };

  const exportDataJSON = (): string => {
    const exportObject = {
      version: 1,
      appName: 'CSA QUEST',
      exportedAt: new Date().toISOString(),
      tasks,
      sessions,
      mistakes,
      quizAttempts,
      mockAttempts,
      notes,
      customQuestions,
      targetReadinessScore,
      currentDate,
    };
    return JSON.stringify(exportObject, null, 2);
  };

  const importDataJSON = (jsonStr: string): { success: boolean; error?: string } => {
    try {
      const data = JSON.parse(jsonStr);
      if (!data || typeof data !== 'object') {
        return { success: false, error: 'Invalid JSON file format.' };
      }
      if (data.tasks && Array.isArray(data.tasks)) setTasks(data.tasks);
      if (data.sessions && Array.isArray(data.sessions)) setSessions(data.sessions);
      if (data.mistakes && Array.isArray(data.mistakes)) setMistakes(data.mistakes);
      if (data.quizAttempts && Array.isArray(data.quizAttempts)) setQuizAttempts(data.quizAttempts);
      if (data.mockAttempts && Array.isArray(data.mockAttempts)) setMockAttempts(data.mockAttempts);
      if (data.notes && Array.isArray(data.notes)) setNotes(data.notes);
      if (data.customQuestions && Array.isArray(data.customQuestions)) setCustomQuestions(data.customQuestions);
      if (data.targetReadinessScore && typeof data.targetReadinessScore === 'number') {
        setTargetReadinessScoreState(data.targetReadinessScore);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to parse JSON file.' };
    }
  };

  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.MISTAKES);
    localStorage.removeItem(STORAGE_KEYS.QUIZ_ATTEMPTS);
    localStorage.removeItem(STORAGE_KEYS.MOCK_ATTEMPTS);
    localStorage.removeItem(STORAGE_KEYS.NOTES);
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_QUESTIONS);
    localStorage.removeItem(STORAGE_KEYS.TARGET_SCORE);
    localStorage.removeItem(STORAGE_KEYS.SIMULATED_DATE);

    setTasks(INITIAL_STUDY_TASKS);
    setSessions([]);
    setMistakes([]);
    setQuizAttempts([]);
    setMockAttempts([]);
    setNotes(INITIAL_KNOWLEDGE_NOTES);
    setCustomQuestions([]);
    setTargetReadinessScoreState(85);
    setCurrentDate(DEFAULT_SIMULATED_DATE);
    setActiveTimer(null);
    setFinishedSessionSummary(null);
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        currentDate,
        setSimulatedDate,
        resetToToday,
        isWeekend,
        isExamDay,
        tasks,
        todayTasks,
        toggleTaskComplete,
        updateTaskStatus,
        updateTaskNotes,
        rescheduleTask,
        addNewTask,
        sessions,
        activeTimer,
        startStudySession,
        pauseStudySession,
        resumeStudySession,
        endStudySession,
        recordCompletedSession,
        discardStudySession,
        questionBank,
        quizAttempts,
        mockAttempts,
        recordQuizAttempt,
        recordMockAttempt,
        addCustomQuestion,
        mistakes,
        logMistake,
        updateMistakeNote,
        updateMistakeStatus,
        removeMistake,
        notes,
        addNote,
        updateNote,
        toggleBookmarkNote,
        deleteNote,
        domainMastery,
        overallMasteryPercentage,
        totalStudyMinutes,
        totalSessionsCompleted,
        totalQuestionsAnswered,
        overallAccuracyPercentage,
        masteredTopicsCount,
        weekdayStreak,
        daysUntilExam,
        targetReadinessScore,
        setTargetReadinessScore,
        exportDataJSON,
        importDataJSON,
        resetAllData,
        finishedSessionSummary,
        clearFinishedSessionSummary,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
