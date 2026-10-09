import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Play,
  Pause,
  Square,
  Flame,
  Award,
  Settings,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  SunMedium,
  CheckCircle2,
} from 'lucide-react';
import { useApp, parseDateString, formatDateString } from '../../context/AppContext';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenTimerModal: () => void;
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onOpenTimerModal,
  onOpenMobileMenu,
}) => {
  const {
    currentDate,
    setSimulatedDate,
    resetToToday,
    daysUntilExam,
    weekdayStreak,
    activeTimer,
    pauseStudySession,
    resumeStudySession,
    endStudySession,
    isWeekend,
    isExamDay,
    overallMasteryPercentage,
    targetReadinessScore,
    theme,
    toggleTheme,
  } = useApp();

  const [showDatePicker, setShowDatePicker] = useState(false);

  // Format active timer seconds into MM:SS
  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const parsedCurrent = parseDateString(currentDate);
  const formattedDisplayDate = parsedCurrent.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 border-b border-pink-200/80 bg-white/90 backdrop-blur-md dark:border-pink-900/60 dark:bg-[#1a0c1c]/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="rounded-lg p-2 text-pink-600 hover:bg-pink-100 hover:text-pink-900 dark:text-pink-300 dark:hover:bg-pink-950/60 lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 shadow-md shadow-pink-300/40 dark:shadow-pink-950/40">
              <Award className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-pink-950 dark:text-pink-100">CSA QUEST</span>
                <span className="rounded-full bg-pink-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-pink-700 border border-pink-200 dark:bg-pink-950/60 dark:text-pink-300 dark:border-pink-800">
                  OCT 2026
                </span>
              </div>
              <p className="hidden text-xs text-pink-700/70 dark:text-pink-300/70 sm:block font-medium">Your road to ServiceNow CSA</p>
            </div>
          </div>
        </div>

        {/* Center: Active Timer Banner if running */}
        {activeTimer && activeTimer.isRunning ? (
          <div className="hidden md:flex items-center gap-3 rounded-full border border-pink-300 bg-pink-50/90 dark:border-pink-800 dark:bg-pink-950/50 px-4 py-1.5 shadow-sm">
            <div className="flex items-center gap-2">
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${activeTimer.isPaused ? 'bg-amber-400' : 'bg-pink-500 animate-pulse'}`} />
              <span className="text-xs font-semibold text-pink-950 dark:text-pink-200 truncate max-w-[140px]">
                {activeTimer.topic}
              </span>
              <span className="font-mono text-sm font-bold text-pink-600 dark:text-pink-400">
                {formatTimer(activeTimer.elapsedSeconds)}
              </span>
            </div>
            <div className="flex items-center gap-1 border-l border-pink-200 dark:border-pink-800 pl-2">
              {activeTimer.isPaused ? (
                <button
                  type="button"
                  onClick={resumeStudySession}
                  className="rounded p-1 text-pink-700 hover:bg-pink-200/60 dark:text-pink-300"
                  title="Resume study session"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={pauseStudySession}
                  className="rounded p-1 text-pink-700 hover:bg-pink-200/60 dark:text-pink-300"
                  title="Pause study session"
                >
                  <Pause className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => onOpenTimerModal()}
                className="rounded p-1 text-pink-600 hover:bg-pink-200/70 hover:text-pink-800 dark:text-pink-400"
                title="Finish and log session"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
              </button>
            </div>
          </div>
        ) : null}

        {/* Right Info Badges & Date Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Weekday Streak */}
          <div
            className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"
            title="Weekday study streak"
          >
            <Flame className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
            <span>{weekdayStreak}d streak</span>
          </div>

          {/* Exam Countdown Badge */}
          <div
            className={`hidden sm:flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold border ${
              daysUntilExam <= 0
                ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300'
                : daysUntilExam <= 7
                ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300'
                : 'bg-pink-100/90 text-pink-800 border-pink-200 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-800'
            }`}
          >
            <Clock className="h-3.5 w-3.5 text-pink-600 dark:text-pink-400" />
            <span>
              {daysUntilExam === 0
                ? 'EXAM DAY TODAY!'
                : daysUntilExam > 0
                ? `${daysUntilExam} days to Exam`
                : 'Exam Completed'}
            </span>
          </div>

          {/* Date Selector / Simulation Popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-1.5 rounded-lg border border-pink-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-pink-900 hover:border-pink-300 hover:bg-pink-50/60 dark:border-pink-900/60 dark:bg-[#241326] dark:text-pink-200 transition"
              title="Change active study date"
            >
              <Calendar className="h-3.5 w-3.5 text-pink-500" />
              <span>{formattedDisplayDate}</span>
            </button>

            {showDatePicker && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl border border-pink-200 bg-white p-3 shadow-2xl backdrop-blur-xl z-50 dark:border-pink-900/70 dark:bg-[#201022]">
                <div className="mb-2 flex items-center justify-between border-b border-pink-100 dark:border-pink-900/60 pb-2">
                  <span className="text-xs font-bold text-pink-950 dark:text-pink-100">Study Date Navigator</span>
                  <button
                    type="button"
                    onClick={() => setShowDatePicker(false)}
                    className="text-pink-400 hover:text-pink-700 dark:hover:text-pink-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-pink-300/70 mb-2.5 leading-relaxed">
                  Navigate to any day to view scheduled tasks, rest days, mock exam day, or exam day:
                </p>

                {/* Quick Presets */}
                <div className="space-y-1 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSimulatedDate('2026-10-08');
                      setShowDatePicker(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center justify-between ${
                      currentDate === '2026-10-08'
                        ? 'bg-pink-500 text-white font-semibold'
                        : 'text-slate-700 hover:bg-pink-50 dark:text-pink-200 dark:hover:bg-pink-950/50'
                    }`}
                  >
                    <span>Oct 8: Today (Prep Kickoff)</span>
                    <span className="text-[10px] opacity-75">Now</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSimulatedDate('2026-10-10');
                      setShowDatePicker(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center justify-between ${
                      currentDate === '2026-10-10'
                        ? 'bg-pink-500 text-white font-semibold'
                        : 'text-slate-700 hover:bg-pink-50 dark:text-pink-200 dark:hover:bg-pink-950/50'
                    }`}
                  >
                    <span>Oct 10: Saturday (Rest Day)</span>
                    <span className="text-[10px] text-emerald-600 font-bold">Rest</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSimulatedDate('2026-10-12');
                      setShowDatePicker(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center justify-between ${
                      currentDate === '2026-10-12'
                        ? 'bg-pink-500 text-white font-semibold'
                        : 'text-slate-700 hover:bg-pink-50 dark:text-pink-200 dark:hover:bg-pink-950/50'
                    }`}
                  >
                    <span>Oct 12: Week 1 Starts</span>
                    <span className="text-[10px] opacity-75">Platform</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSimulatedDate('2026-10-14');
                      setShowDatePicker(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center justify-between ${
                      currentDate === '2026-10-14'
                        ? 'bg-pink-500 text-white font-semibold'
                        : 'text-slate-700 hover:bg-pink-50 dark:text-pink-200 dark:hover:bg-pink-950/50'
                    }`}
                  >
                    <span>Oct 14: Data Schema (30% Priority)</span>
                    <span className="text-[10px] text-rose-600 font-bold">Domain 5</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSimulatedDate('2026-10-28');
                      setShowDatePicker(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center justify-between ${
                      currentDate === '2026-10-28'
                        ? 'bg-pink-500 text-white font-semibold'
                        : 'text-slate-700 hover:bg-pink-50 dark:text-pink-200 dark:hover:bg-pink-950/50'
                    }`}
                  >
                    <span>Oct 28: Mock Exam Day</span>
                    <span className="text-[10px] text-pink-600 font-bold">60Q</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSimulatedDate('2026-10-30');
                      setShowDatePicker(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center justify-between ${
                      currentDate === '2026-10-30'
                        ? 'bg-pink-500 text-white font-semibold'
                        : 'text-slate-700 hover:bg-pink-50 dark:text-pink-200 dark:hover:bg-pink-950/50'
                    }`}
                  >
                    <span>Oct 30: OFFICIAL EXAM DAY</span>
                    <span className="text-[10px] text-rose-600 font-bold">Exam</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-pink-100 dark:border-pink-900/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 dark:text-pink-300/70 font-medium">Custom date:</span>
                  <input
                    type="date"
                    value={currentDate}
                    onChange={(e) => {
                      if (e.target.value) {
                        setSimulatedDate(e.target.value);
                      }
                    }}
                    className="rounded-lg border border-pink-200 bg-pink-50/50 px-2 py-1 text-xs text-pink-950 dark:border-pink-800 dark:bg-pink-950/40 dark:text-pink-100"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Theme Switcher Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-1.5 rounded-lg border border-pink-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-pink-700 hover:bg-pink-50 hover:border-pink-300 dark:border-pink-900/60 dark:bg-[#241326] dark:text-pink-300 transition"
            title={theme === 'pastel-pink' ? 'Switch to Pastel Velvet Night' : 'Switch to Pastel Blossom Day'}
          >
            <span>{theme === 'pastel-pink' ? '🌸' : '🌙'}</span>
            <span className="hidden md:inline">{theme === 'pastel-pink' ? 'Pastel Day' : 'Pastel Night'}</span>
          </button>

          {/* Settings / Export Data Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="rounded-lg border border-pink-200 bg-white p-2 text-pink-700 hover:border-pink-300 hover:bg-pink-50 dark:border-pink-900/60 dark:bg-[#241326] dark:text-pink-300 transition"
            title="Data backup, export, & settings"
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
