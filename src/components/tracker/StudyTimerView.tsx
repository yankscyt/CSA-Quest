import React from 'react';
import { Clock, ShieldCheck, Flame, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';
import { StudySessionTimer } from './StudySessionTimer';
import { useApp } from '../../context/AppContext';
import { OFFICIAL_DOMAINS } from '../../data/domains';

export const StudyTimerView: React.FC = () => {
  const { totalStudyMinutes, totalSessionsCompleted, weekdayStreak } = useApp();

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-pink-200/80 dark:border-pink-900/60 pb-4">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-pink-950 dark:text-pink-100 flex items-center gap-2">
          <Clock className="h-6 w-6 text-pink-500" />
          Study Session Timer & Tracker
        </h1>
        <p className="text-xs text-slate-500 dark:text-pink-300/70 mt-1 font-medium">
          Precision weekday study stopwatch with start, pause, resume, and end controls.
          When a session ends, associate it with an official exam domain and topic to persist your actual study minutes.
        </p>
      </div>

      {/* Main Study Session Timer Component */}
      <StudySessionTimer />

      {/* Domain Priority Guidelines */}
      <div className="rounded-2xl border border-pink-200 bg-white/95 p-5 space-y-3 shadow-sm shadow-pink-100/50 dark:border-pink-900/60 dark:bg-[#221224]">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-pink-500" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-pink-800/80 dark:text-pink-300/80">
            Exam Blueprint Priority Recommendations
          </h3>
        </div>

        <p className="text-xs text-slate-600 dark:text-pink-200/80 leading-relaxed font-medium">
          Allocate your daily 60–90 study minutes strategically according to the official January 2026 CSA exam blueprint weightings:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
          {OFFICIAL_DOMAINS.map((dom) => (
            <div
              key={dom.id}
              className={`rounded-xl border p-3 text-xs space-y-1 ${
                dom.isHighPriority
                  ? 'border-rose-200 bg-rose-50/60 dark:border-rose-900/50 dark:bg-rose-950/20'
                  : 'border-pink-200/80 bg-pink-50/40 dark:border-pink-900/50 dark:bg-[#1a0b1c]'
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span className="text-pink-950 dark:text-pink-100">Domain {dom.id}</span>
                <span className={dom.isHighPriority ? 'text-rose-600 dark:text-rose-400 font-extrabold' : 'text-pink-600 dark:text-pink-400'}>
                  {dom.weight}% Weight {dom.isHighPriority ? '★ Priority' : ''}
                </span>
              </div>
              <p className="text-slate-600 dark:text-pink-300/80 text-[11px] line-clamp-2 font-medium">
                {dom.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
