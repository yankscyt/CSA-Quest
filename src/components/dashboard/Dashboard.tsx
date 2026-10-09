import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Play,
  ArrowRight,
  TrendingUp,
  Award,
  AlertTriangle,
  Flame,
  BookOpen,
  Sparkles,
  HelpCircle,
  FileCheck2,
  Coffee,
  Check,
  ChevronRight,
  ShieldCheck,
  Zap,
  Timer,
} from 'lucide-react';
import { useApp, parseDateString } from '../../context/AppContext';
import { NavTab } from '../layout/Sidebar';
import { DomainId } from '../../types';
import { StudySessionTimer } from '../tracker/StudySessionTimer';

interface DashboardProps {
  onNavigate: (tab: NavTab) => void;
  onStartSession: (domainId: DomainId, topic: string) => void;
  onOpenQuickQuiz: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  onStartSession,
  onOpenQuickQuiz,
}) => {
  const {
    currentDate,
    daysUntilExam,
    isWeekend,
    isExamDay,
    todayTasks,
    toggleTaskComplete,
    updateTaskStatus,
    domainMastery,
    overallMasteryPercentage,
    totalStudyMinutes,
    totalSessionsCompleted,
    totalQuestionsAnswered,
    overallAccuracyPercentage,
    masteredTopicsCount,
    weekdayStreak,
    targetReadinessScore,
    mistakes,
  } = useApp();

  const parsedCurrent = parseDateString(currentDate);
  const formattedDayTitle = parsedCurrent.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Calculate today's completion percentage
  const todayTasksCount = todayTasks.length;
  const completedTodayTasksCount = todayTasks.filter((t) => t.completed).length;
  const todayCompletionPercentage =
    todayTasksCount > 0 ? Math.round((completedTodayTasksCount / todayTasksCount) * 100) : 0;

  // Upcoming study milestone text
  const getUpcomingMilestone = () => {
    if (daysUntilExam <= 0) return 'Official Exam Day!';
    if (daysUntilExam <= 2) return 'Final Review & Mental Readiness (Oct 29)';
    if (daysUntilExam <= 4) return 'Full 60-Question Mock Exam Simulation (Oct 28)';
    if (daysUntilExam <= 11) return 'Week 2 Core Functionality (Catalog & Workflows)';
    return 'Week 1 Foundation Kickoff (Oct 12)';
  };

  // Format study minutes into "Xh Ym"
  const formatStudyTime = (mins: number) => {
    const hours = Math.floor(mins / 60);
    const remainder = mins % 60;
    if (hours === 0) return `${remainder}m`;
    return `${hours}h ${remainder}m`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. HERO / EXAM COUNTDOWN BANNER */}
      <div className="relative overflow-hidden rounded-2xl border border-pink-200/90 bg-gradient-to-br from-pink-100/90 via-white to-pink-50 p-6 shadow-sm shadow-pink-100/60 dark:from-[#241326] dark:via-[#1c0f1e] dark:to-[#2e1430] dark:border-pink-900/60">
        <div className="absolute -right-10 -top-10 h-60 w-60 rounded-full bg-pink-300/25 blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-10 h-40 w-40 rounded-full bg-rose-300/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-bold tracking-wider text-pink-700 border border-pink-200 dark:bg-pink-950/60 dark:text-pink-300 dark:border-pink-800">
                SERVICENOW CSA CERTIFICATION
              </span>
              <span className="text-xs text-pink-800/80 dark:text-pink-300/80 font-medium">
                Official Exam: <span className="text-pink-950 dark:text-pink-100 font-bold">Friday, October 30, 2026</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-pink-950 dark:text-pink-100">
              {daysUntilExam === 0
                ? 'Today is Exam Day!'
                : daysUntilExam > 0
                ? `${daysUntilExam} Days Remaining Until Your Exam`
                : 'Exam Day Arrived!'}
            </h1>

            <p className="max-w-2xl text-xs sm:text-sm text-slate-600 dark:text-pink-200/80 leading-relaxed font-medium">
              Target study pace: 60–90 min/weekday. Weekends are protected rest days.
              Official blueprint: 60 questions, 90 minutes. Target readiness: {targetReadinessScore}%.
            </p>
          </div>

          {/* Readiness Gauge Card */}
          <div className="flex items-center gap-5 rounded-2xl border border-pink-200 bg-white/95 p-4 shadow-sm min-w-[260px] dark:border-pink-900/60 dark:bg-[#1a0b1c]">
            <div className="relative flex h-16 w-16 items-center justify-center">
              <svg className="h-16 w-16 -rotate-90 transform" viewBox="0 0 36 36">
                <path
                  className="text-pink-100 dark:text-pink-950/80"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={`${
                    overallMasteryPercentage >= targetReadinessScore
                      ? 'text-emerald-500'
                      : 'text-pink-500'
                  } transition-all duration-1000`}
                  strokeDasharray={`${overallMasteryPercentage}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-mono text-sm font-bold text-pink-950 dark:text-pink-100">
                {overallMasteryPercentage}%
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-pink-800/70 dark:text-pink-300/70">
                Overall Preparation
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-pink-100">
                {overallMasteryPercentage >= targetReadinessScore ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="h-4 w-4" /> Exam Ready!
                  </span>
                ) : (
                  <span className="text-pink-600 dark:text-pink-400 font-bold">Target: {targetReadinessScore}%</span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-pink-400/70 font-medium">
                6 Domains • Weighted Blueprint
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TODAY'S MISSION vs REST DAY vs EXAM DAY */}
      <div className="rounded-2xl border border-pink-200 bg-white/95 p-5 shadow-sm shadow-pink-100/40 dark:border-pink-900/60 dark:bg-[#221224]">
        {/* Header */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-pink-100 dark:border-pink-900/60 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-pink-950 dark:text-pink-100 tracking-tight">Today's Mission</h2>
              <span className="rounded-full bg-pink-100 px-2.5 py-0.5 text-xs font-bold text-pink-700 border border-pink-200 dark:bg-pink-950/60 dark:text-pink-300 dark:border-pink-800">
                {formattedDayTitle}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-pink-300/70 mt-0.5 font-medium">
              {isWeekend
                ? 'Protected Rest Day — No study tasks scheduled'
                : isExamDay
                ? 'Official Certification Day'
                : `${todayTasksCount} task${todayTasksCount === 1 ? '' : 's'} assigned • ${todayCompletionPercentage}% completed`}
            </p>
          </div>

          {!isWeekend && !isExamDay && todayTasksCount > 0 && (
            <div className="flex items-center gap-3">
              <div className="h-2.5 w-32 rounded-full bg-pink-100 dark:bg-pink-950/80 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-400 to-rose-500 transition-all duration-300"
                  style={{ width: `${todayCompletionPercentage}%` }}
                />
              </div>
              <span className="font-mono text-xs font-bold text-pink-600 dark:text-pink-400">
                {todayCompletionPercentage}%
              </span>
            </div>
          )}
        </div>

        {/* State A: WEEKEND REST DAY */}
        {isWeekend ? (
          <div className="flex flex-col items-center justify-center py-8 text-center px-4 rounded-2xl border border-pink-200 bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100/60 dark:border-pink-900/50 dark:from-pink-950/20 dark:to-rose-950/20">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-pink-500 border border-pink-200 shadow-sm dark:bg-[#1a0b1c] dark:border-pink-800">
              <Coffee className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-pink-950 dark:text-pink-100">Protected Rest Day</h3>
            <p className="mt-1.5 max-w-md text-xs sm:text-sm text-slate-600 dark:text-pink-200/80 leading-relaxed font-medium">
              Saturdays and Sundays are strictly reserved for mental recovery and family time.
              Recharging is a critical part of sustainable certification preparation.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-600 dark:text-pink-300/80">
              <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1 border border-pink-200 font-semibold dark:bg-[#241326] dark:border-pink-800">
                <Check className="h-3.5 w-3.5 text-pink-500" /> No assigned tasks
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1 border border-pink-200 font-semibold dark:bg-[#241326] dark:border-pink-800">
                <Check className="h-3.5 w-3.5 text-pink-500" /> Preserves study streak
              </span>
              <button
                type="button"
                onClick={() => onNavigate('planner')}
                className="text-pink-600 hover:text-pink-700 dark:text-pink-400 font-bold underline underline-offset-2 ml-1"
              >
                View Monday's schedule →
              </button>
            </div>
          </div>
        ) : isExamDay ? (
          /* State B: EXAM DAY SCREEN */
          <div className="rounded-2xl border border-rose-300 bg-rose-50/70 p-6 dark:border-rose-900/60 dark:bg-rose-950/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-600 border border-rose-300">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-rose-950 dark:text-rose-100">It's Official Exam Day!</h3>
                <p className="text-xs text-rose-800/80 dark:text-rose-200/80 font-medium">
                  Take a deep breath. You have systematically covered the official blueprint.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl border border-pink-200 bg-white p-3 space-y-2 dark:border-pink-900/60 dark:bg-[#241326]">
                <div className="text-xs font-bold text-pink-950 dark:text-pink-100">Pre-Exam Checklist:</div>
                <ul className="text-xs text-slate-600 dark:text-pink-200/80 space-y-1.5 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-pink-500" /> Valid government-issued photo ID
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-pink-500" /> Webassessor login credentials ready
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-pink-500" /> Quiet room with testing environment setup
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-pink-500" /> Read every question twice: note "Choose two" or "Choose three"
                  </li>
                </ul>
              </div>

              <div className="rounded-xl border border-pink-200 bg-white p-3 flex flex-col justify-between dark:border-pink-900/60 dark:bg-[#241326]">
                <div>
                  <div className="text-xs font-bold text-pink-950 dark:text-pink-100 mb-1">Time Management Strategy:</div>
                  <p className="text-xs text-slate-600 dark:text-pink-200/80 leading-relaxed font-medium">
                    60 questions in 90 minutes gives you 1.5 minutes per question. Flag difficult questions and return to them during your final 15 minutes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('mock')}
                  className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-pink-500 px-3 py-2 text-xs font-semibold text-white hover:bg-pink-600 transition shadow-sm shadow-pink-300/40"
                >
                  <FileCheck2 className="h-4 w-4" /> Open Exam Interface
                </button>
              </div>
            </div>
          </div>
        ) : todayTasksCount === 0 ? (
          /* State C: PRE-SCHEDULE (e.g. Oct 8-11 before Oct 12 kickoff) */
          <div className="py-6 text-center">
            <div className="mb-2 flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-pink-100 text-pink-600 border border-pink-200">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-pink-950 dark:text-pink-100">Pre-Kickoff Preparation Window</h3>
            <p className="mt-1 max-w-md mx-auto text-xs text-slate-600 dark:text-pink-200/80 font-medium">
              Your structured 3-week study plan begins on <strong className="text-pink-700 dark:text-pink-300">Monday, October 12, 2026</strong>.
              Use this time to review the knowledge base notes or take a preliminary quick diagnostic quiz.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={onOpenQuickQuiz}
                className="rounded-xl bg-pink-500 px-4 py-2 text-xs font-semibold text-white hover:bg-pink-600 transition shadow-sm shadow-pink-300/40"
              >
                Take Diagnostic Quiz
              </button>
              <button
                type="button"
                onClick={() => onNavigate('planner')}
                className="rounded-xl border border-pink-200 bg-white px-4 py-2 text-xs font-semibold text-pink-700 hover:bg-pink-50 transition dark:border-pink-800 dark:bg-[#241326] dark:text-pink-300"
              >
                Inspect Week 1 Schedule
              </button>
            </div>
          </div>
        ) : (
          /* State D: SCHEDULED WEEKDAY TASKS */
          <div className="space-y-3">
            {todayTasks.map((task) => (
              <div
                key={task.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border p-3.5 transition ${
                  task.completed
                    ? 'border-pink-200/50 bg-pink-50/40 text-slate-500 dark:border-pink-900/30 dark:bg-pink-950/20'
                    : 'border-pink-200/80 bg-white text-slate-800 hover:border-pink-300 dark:border-pink-900/60 dark:bg-[#28152a] dark:text-pink-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => toggleTaskComplete(task.id)}
                    className="mt-0.5 flex-shrink-0 text-pink-400 hover:text-pink-600 transition"
                    title={task.completed ? 'Mark incomplete' : 'Mark completed'}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-pink-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-pink-300 hover:text-pink-500" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-sm font-semibold ${
                          task.completed ? 'line-through text-slate-400 dark:text-pink-400/50' : 'text-pink-950 dark:text-pink-100'
                        }`}
                      >
                        {task.title}
                      </span>
                      {task.domainId && (
                        <span className="rounded-full bg-pink-100 px-2 py-0.5 text-[10px] font-bold text-pink-700 border border-pink-200 dark:bg-pink-950/60 dark:text-pink-300 dark:border-pink-800">
                          Domain {task.domainId}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-500 dark:text-pink-300/70 font-medium">
                        • est. {task.estimatedMinutes}m
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-pink-200/80 line-clamp-2">{task.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {/* Status Dropdown */}
                  <select
                    value={task.topicStatus}
                    onChange={(e) => updateTaskStatus(task.id, e.target.value as any)}
                    className="rounded-lg border border-pink-200 bg-pink-50/50 px-2 py-1 text-xs text-pink-900 font-semibold focus:outline-none focus:border-pink-400 dark:border-pink-800 dark:bg-[#1f0f21] dark:text-pink-200"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Needs Review">Needs Review</option>
                    <option value="Mastered">Mastered</option>
                  </select>

                  {/* Start Session / Timer */}
                  <button
                    type="button"
                    onClick={() => onStartSession(task.domainId || 1, task.topic)}
                    className="flex items-center gap-1 rounded-xl bg-pink-500 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-pink-600 transition"
                    title="Start active study session for this task"
                  >
                    <Play className="h-3 w-3 fill-current" />
                    <span>Study</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* STUDY SESSION TIMER COMPONENT */}
      <StudySessionTimer />

      {/* 3. PROGRESS SUMMARY METRICS */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-2xl border border-pink-200/80 bg-white/95 p-3.5 shadow-xs dark:border-pink-900/60 dark:bg-[#221224]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-pink-800/70 dark:text-pink-300/70">
            Sessions Done
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-extrabold text-pink-950 dark:text-pink-100">
              {totalSessionsCompleted}
            </span>
            <span className="text-xs text-slate-500 dark:text-pink-300/70 font-medium">sessions</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-pink-300/70">
            {formatStudyTime(totalStudyMinutes)} total
          </div>
        </div>

        <div className="rounded-2xl border border-pink-200/80 bg-white/95 p-3.5 shadow-xs dark:border-pink-900/60 dark:bg-[#221224]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-pink-800/70 dark:text-pink-300/70">
            Study Minutes
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-extrabold text-pink-600 dark:text-pink-400">
              {totalStudyMinutes}
            </span>
            <span className="text-xs text-slate-500 dark:text-pink-300/70 font-medium">mins</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-pink-300/70">
            Target 60–90m/day
          </div>
        </div>

        <div className="rounded-2xl border border-pink-200/80 bg-white/95 p-3.5 shadow-xs dark:border-pink-900/60 dark:bg-[#221224]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-pink-800/70 dark:text-pink-300/70">
            Questions
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-extrabold text-pink-950 dark:text-pink-100">
              {totalQuestionsAnswered}
            </span>
            <span className="text-xs text-slate-500 dark:text-pink-300/70 font-medium">taken</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-pink-300/70">
            Across 6 domains
          </div>
        </div>

        <div className="rounded-2xl border border-pink-200/80 bg-white/95 p-3.5 shadow-xs dark:border-pink-900/60 dark:bg-[#221224]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-pink-800/70 dark:text-pink-300/70">
            Quiz Accuracy
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-extrabold text-rose-600 dark:text-rose-400">
              {overallAccuracyPercentage}%
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-pink-300/70">
            Target: {targetReadinessScore}%
          </div>
        </div>

        <div className="rounded-2xl border border-pink-200/80 bg-white/95 p-3.5 shadow-xs dark:border-pink-900/60 dark:bg-[#221224]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-pink-800/70 dark:text-pink-300/70">
            Mastered Topics
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-extrabold text-pink-700 dark:text-pink-300">
              {masteredTopicsCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-pink-300/70 font-medium">topics</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-pink-300/70">
            Of 29 blueprint topics
          </div>
        </div>

        <div className="rounded-2xl border border-pink-200/80 bg-white/95 p-3.5 shadow-xs dark:border-pink-900/60 dark:bg-[#221224]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-pink-800/70 dark:text-pink-300/70">
            Weekday Streak
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-extrabold text-rose-500">
              {weekdayStreak}
            </span>
            <span className="text-xs text-slate-500 dark:text-pink-300/70 font-medium">days</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-pink-300/70">
            Weekends rested
          </div>
        </div>
      </div>

      {/* 4. OFFICIAL CSA DOMAIN MASTERY CARDS (6 DOMAINS) */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <h2 className="text-base font-bold text-pink-950 dark:text-pink-100 tracking-tight">
              Official Exam Blueprint Mastery
            </h2>
            <p className="text-xs text-slate-500 dark:text-pink-300/70 font-medium">
              Mastery calculated from recorded quiz scores, practice accuracy, and topic completion.
            </p>
          </div>
          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
            <Zap className="h-3.5 w-3.5" /> Domain 5 is Highest Priority (30% weight)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {domainMastery.map((domain) => (
            <div
              key={domain.domainId}
              className={`rounded-2xl border p-4 transition relative flex flex-col justify-between ${
                domain.isHighPriority
                  ? 'border-rose-300 bg-gradient-to-br from-white via-rose-50/50 to-pink-50 shadow-sm shadow-rose-100/50 dark:border-rose-800 dark:from-[#261328] dark:to-[#381630]'
                  : 'border-pink-200/80 bg-white/95 hover:border-pink-300 shadow-xs dark:border-pink-900/60 dark:bg-[#221224]'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-pink-100 px-2 py-0.5 font-mono text-xs font-bold text-pink-800 border border-pink-200 dark:bg-pink-950/60 dark:text-pink-300 dark:border-pink-800">
                      D{domain.domainId}
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        domain.isHighPriority ? 'text-rose-600 dark:text-rose-400' : 'text-pink-600 dark:text-pink-400'
                      }`}
                    >
                      {domain.weight}% Exam Weight
                    </span>
                  </div>

                  {domain.isHighPriority && (
                    <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-rose-700 border border-rose-300 dark:bg-rose-950/60 dark:text-rose-300">
                      Priority Focus
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-pink-950 dark:text-pink-100 line-clamp-2 leading-snug">
                  {domain.title}
                </h3>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-pink-300/70 font-medium">
                  <span>Mastery Level</span>
                  <span className="font-mono font-bold text-pink-950 dark:text-pink-100">
                    {domain.masteryPercentage}%
                  </span>
                </div>

                <div className="mt-1.5 h-2 w-full rounded-full bg-pink-100 dark:bg-pink-950/80 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${domain.masteryPercentage}%`,
                      backgroundColor: domain.color,
                    }}
                  />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-pink-300/70 border-t border-pink-100 dark:border-pink-900/60 pt-2.5">
                  <div>
                    Tasks: <span className="text-pink-950 dark:text-pink-100 font-bold">{domain.tasksCompleted}/{domain.tasksTotal}</span>
                  </div>
                  <div>
                    Accuracy: <span className="text-pink-950 dark:text-pink-100 font-bold">{domain.quizAccuracy}%</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate('quiz')}
                  className="flex-1 rounded-xl border border-pink-200 bg-pink-50/70 px-2.5 py-1.5 text-xs font-semibold text-pink-700 hover:bg-pink-100 hover:border-pink-300 transition text-center dark:border-pink-800 dark:bg-pink-950/50 dark:text-pink-300"
                >
                  Practice Quiz
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('notes')}
                  className="rounded-xl border border-pink-200 bg-pink-50/70 p-1.5 text-xs font-semibold text-pink-700 hover:bg-pink-100 transition dark:border-pink-800 dark:bg-pink-950/50 dark:text-pink-300"
                  title="View Domain Notes & Terms"
                >
                  <BookOpen className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. QUICK ACTIONS */}
      <div className="rounded-2xl border border-pink-200/80 bg-white/95 p-4 shadow-xs dark:border-pink-900/60 dark:bg-[#221224]">
        <h2 className="text-xs font-bold uppercase tracking-wider text-pink-800/70 dark:text-pink-300/70 mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            type="button"
            onClick={() => {
              const firstIncomplete = todayTasks.find((t) => !t.completed);
              if (firstIncomplete) {
                onStartSession(firstIncomplete.domainId || 1, firstIncomplete.topic);
              } else {
                onStartSession(1, 'ServiceNow Platform Overview');
              }
            }}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-pink-200/70 bg-pink-50/40 p-3.5 text-center hover:bg-pink-100/70 hover:border-pink-300 transition group dark:border-pink-900/50 dark:bg-pink-950/30"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-100 text-pink-600 group-hover:scale-110 transition dark:bg-pink-900/50 dark:text-pink-300">
              <Play className="h-4 w-4 fill-current" />
            </div>
            <span className="text-xs font-bold text-pink-950 dark:text-pink-100">Start Study Timer</span>
          </button>

          <button
            type="button"
            onClick={onOpenQuickQuiz}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-pink-200/70 bg-pink-50/40 p-3.5 text-center hover:bg-pink-100/70 hover:border-pink-300 transition group dark:border-pink-900/50 dark:bg-pink-950/30"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-600 group-hover:scale-110 transition dark:bg-rose-900/50 dark:text-rose-300">
              <HelpCircle className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-pink-950 dark:text-pink-100">Quick Practice Quiz</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('mock')}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-pink-200/70 bg-pink-50/40 p-3.5 text-center hover:bg-pink-100/70 hover:border-pink-300 transition group dark:border-pink-900/50 dark:bg-pink-950/30"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-100 text-pink-600 group-hover:scale-110 transition dark:bg-pink-900/50 dark:text-pink-300">
              <FileCheck2 className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-pink-950 dark:text-pink-100">Full 60Q Mock Exam</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('mistakes')}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-pink-200/70 bg-pink-50/40 p-3.5 text-center hover:bg-pink-100/70 hover:border-pink-300 transition group relative dark:border-pink-900/50 dark:bg-pink-950/30"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-600 group-hover:scale-110 transition dark:bg-rose-900/50 dark:text-rose-300">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-pink-950 dark:text-pink-100">Mistake Notebook</span>
            {mistakes.length > 0 && (
              <span className="absolute top-2 right-2 rounded-full bg-rose-100 text-rose-700 px-1.5 py-0.5 text-[9px] font-bold border border-rose-300">
                {mistakes.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onNavigate('planner')}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-pink-200/70 bg-pink-50/40 p-3.5 text-center hover:bg-pink-100/70 hover:border-pink-300 transition group dark:border-pink-900/50 dark:bg-pink-950/30"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-100 text-pink-600 group-hover:scale-110 transition dark:bg-pink-900/50 dark:text-pink-300">
              <Calendar className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-pink-950 dark:text-pink-100">Open Planner</span>
          </button>
        </div>
      </div>
    </div>
  );
};
