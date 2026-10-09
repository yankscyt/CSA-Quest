import React, { useState } from 'react';
import {
  Play,
  Pause,
  Square,
  Clock,
  BookOpen,
  CheckCircle2,
  X,
  FileText,
  Flame,
  Award,
  Sparkles,
  Sliders,
  Calendar,
  Layers,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { OFFICIAL_DOMAINS } from '../../data/domains';
import { DomainId, StudySession } from '../../types';

interface StudySessionTimerProps {
  onSessionLogged?: (session: StudySession) => void;
  compact?: boolean;
}

export const StudySessionTimer: React.FC<StudySessionTimerProps> = ({
  onSessionLogged,
  compact = false,
}) => {
  const {
    activeTimer,
    startStudySession,
    pauseStudySession,
    resumeStudySession,
    endStudySession,
    discardStudySession,
    sessions,
    totalStudyMinutes,
    totalSessionsCompleted,
    weekdayStreak,
    currentDate,
  } = useApp();

  // Prompt / Association Modal State when user clicks "End"
  const [showAssociationPrompt, setShowAssociationPrompt] = useState(false);
  const [promptElapsedSeconds, setPromptElapsedSeconds] = useState(0);
  const [selectedDomainId, setSelectedDomainId] = useState<DomainId>(5); // defaults to Domain 5 (30% priority)
  const [selectedTopic, setSelectedTopic] = useState<string>('Data Schema');
  const [customTopic, setCustomTopic] = useState<string>('');
  const [manualMinutes, setManualMinutes] = useState<number>(0);
  const [sessionNotes, setSessionNotes] = useState<string>('');
  const [recentlyLoggedSession, setRecentlyLoggedSession] = useState<StudySession | null>(null);

  // Initial domain selection for starting new timer
  const [prepDomainId, setPrepDomainId] = useState<DomainId>(5);
  const [prepTopic, setPrepTopic] = useState<string>('Data Schema');

  // Helper: Format seconds to HH:MM:SS or MM:SS
  const formatTimerDigits = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Button: START
  const handleStart = () => {
    startStudySession(prepDomainId, prepTopic);
  };

  // Button: PAUSE
  const handlePause = () => {
    pauseStudySession();
  };

  // Button: RESUME
  const handleResume = () => {
    resumeStudySession();
  };

  // Button: END -> Triggers prompt to associate domain, topic, and record actual duration!
  const handleTriggerEnd = () => {
    if (!activeTimer) return;

    // Pause first so timer doesn't keep ticking during association prompt
    pauseStudySession();

    const elapsedSecs = activeTimer.elapsedSeconds;
    const computedMins = Math.max(1, Math.round(elapsedSecs / 60));

    setPromptElapsedSeconds(elapsedSecs);
    setManualMinutes(computedMins);
    setSelectedDomainId(activeTimer.domainId || 5);
    setSelectedTopic(activeTimer.topic || 'Data Schema');
    setCustomTopic('');
    setSessionNotes('');
    setShowAssociationPrompt(true);
  };

  // Save the associated session data
  const handleSaveAssociation = (e: React.FormEvent) => {
    e.preventDefault();

    const finalTopic = customTopic.trim() ? customTopic.trim() : selectedTopic;
    const finalDuration = Math.max(1, manualMinutes);

    const logged = endStudySession({
      domainId: selectedDomainId,
      topic: finalTopic,
      durationMinutes: finalDuration,
      notes: sessionNotes.trim(),
    });

    setShowAssociationPrompt(false);

    if (logged) {
      setRecentlyLoggedSession(logged);
      if (onSessionLogged) {
        onSessionLogged(logged);
      }

      // Celebrate session completion with confetti
      try {
        confetti({
          particleCount: 55,
          spread: 70,
          origin: { y: 0.65 },
        });
      } catch (err) {
        // ignore
      }
    }
  };

  const handleCancelPrompt = () => {
    setShowAssociationPrompt(false);
    // User can resume or keep paused
  };

  const currentDomainObj = OFFICIAL_DOMAINS.find((d) => d.id === selectedDomainId);

  return (
    <div className="space-y-6">
      {/* TIMER CARD */}
      <div className="relative overflow-hidden rounded-2xl border border-pink-200 bg-white/95 p-6 shadow-sm shadow-pink-100/50 backdrop-blur-md dark:border-pink-900/60 dark:bg-[#221224]">
        <div className="absolute top-0 right-0 h-48 w-48 bg-pink-300/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-pink-100 dark:border-pink-900/60 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-100 text-pink-600 border border-pink-200 dark:bg-pink-950/60 dark:text-pink-300 dark:border-pink-800">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-pink-950 dark:text-pink-100">
                Study Session Timer
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-pink-300/70 font-medium">
                Weekday study pace: 60–90 min • Paused time excluded
              </p>
            </div>
          </div>

          {activeTimer?.isRunning && (
            <div className="flex items-center gap-2">
              <span
                className={`inline-block h-2.5 w-2.5 rounded-full ${
                  activeTimer.isPaused ? 'bg-amber-400' : 'bg-pink-500 animate-pulse'
                }`}
              />
              <span className="text-xs font-bold uppercase tracking-wider text-pink-800/80 dark:text-pink-300/80">
                {activeTimer.isPaused ? 'Session Paused' : 'Active Study Session'}
              </span>
            </div>
          )}
        </div>

        {/* Stopwatch Display */}
        <div className="flex flex-col items-center justify-center py-8">
          <div className="font-mono text-5xl sm:text-7xl font-black text-pink-950 dark:text-pink-100 tracking-wider tabular-nums drop-shadow-sm">
            {formatTimerDigits(activeTimer?.isRunning ? activeTimer.elapsedSeconds : 0)}
          </div>

          <div className="mt-3 text-xs text-slate-500 dark:text-pink-300/80 text-center flex items-center gap-2 font-medium">
            {activeTimer?.isRunning ? (
              <>
                <span className="rounded-full bg-pink-100 text-pink-800 px-3 py-1 border border-pink-200 font-semibold dark:bg-pink-950/60 dark:text-pink-300 dark:border-pink-800">
                  Domain {activeTimer.domainId}: {activeTimer.topic}
                </span>
                {activeTimer.isPaused && (
                  <span className="text-amber-500 font-bold">(Timer is paused)</span>
                )}
              </>
            ) : (
              <span>Ready to begin your study block. Press Start below.</span>
            )}
          </div>
        </div>

        {/* ACTION BUTTON CONTROLS: START, PAUSE, RESUME, END */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {!activeTimer?.isRunning ? (
            /* START BUTTON */
            <button
              type="button"
              onClick={handleStart}
              className="flex items-center gap-2 rounded-xl bg-pink-500 px-6 py-3 text-xs sm:text-sm font-bold text-white hover:bg-pink-600 transition shadow-md shadow-pink-300/40 active:scale-95"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Start Study Session</span>
            </button>
          ) : (
            <>
              {/* PAUSE or RESUME BUTTON */}
              {activeTimer.isPaused ? (
                <button
                  type="button"
                  onClick={handleResume}
                  className="flex items-center gap-2 rounded-xl bg-pink-500 px-5 py-3 text-xs sm:text-sm font-bold text-white hover:bg-pink-600 transition shadow-md shadow-pink-300/40 active:scale-95"
                  title="Resume active study timer"
                >
                  <Play className="h-4 w-4 fill-current" />
                  <span>Resume</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePause}
                  className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-xs sm:text-sm font-bold text-white hover:bg-amber-600 transition shadow-md shadow-amber-500/20 active:scale-95"
                  title="Pause timer (paused time is not recorded)"
                >
                  <Pause className="h-4 w-4" />
                  <span>Pause</span>
                </button>
              )}

              {/* END BUTTON -> Prompts for domain & topic association */}
              <button
                type="button"
                onClick={handleTriggerEnd}
                className="flex items-center gap-2 rounded-xl bg-rose-500 px-5 py-3 text-xs sm:text-sm font-bold text-white hover:bg-rose-600 transition shadow-md shadow-rose-400/30 active:scale-95"
                title="End session and associate with domain and topic"
              >
                <Square className="h-4 w-4 fill-current" />
                <span>End Session</span>
              </button>

              {/* DISCARD BUTTON */}
              <button
                type="button"
                onClick={discardStudySession}
                className="rounded-xl border border-pink-200 bg-white px-3.5 py-3 text-xs font-semibold text-slate-600 hover:bg-pink-50 hover:text-pink-900 transition dark:border-pink-800 dark:bg-[#201022] dark:text-pink-300"
                title="Cancel timer without logging"
              >
                Discard
              </button>
            </>
          )}
        </div>
      </div>

      {/* METRICS BAR (Updates immediately after logging session) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-pink-200 bg-white/95 p-3.5 shadow-xs dark:border-pink-900/60 dark:bg-[#221224]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-pink-800/70 dark:text-pink-300/70">
            Total Study Minutes
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-black text-pink-600 dark:text-pink-400">
              {totalStudyMinutes}
            </span>
            <span className="text-xs text-slate-500 dark:text-pink-300/70 font-medium">mins</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-pink-300/70 mt-0.5">
            {Math.floor(totalStudyMinutes / 60)}h {totalStudyMinutes % 60}m active
          </div>
        </div>

        <div className="rounded-2xl border border-pink-200 bg-white/95 p-3.5 shadow-xs dark:border-pink-900/60 dark:bg-[#221224]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-pink-800/70 dark:text-pink-300/70">
            Sessions Completed
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-black text-pink-950 dark:text-pink-100">
              {totalSessionsCompleted}
            </span>
            <span className="text-xs text-slate-500 dark:text-pink-300/70 font-medium">logged</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-pink-300/70 mt-0.5">
            Persisted locally
          </div>
        </div>

        <div className="rounded-2xl border border-pink-200 bg-white/95 p-3.5 shadow-xs dark:border-pink-900/60 dark:bg-[#221224]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-pink-800/70 dark:text-pink-300/70">
            Weekday Streak
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-black text-rose-500">
              {weekdayStreak}
            </span>
            <span className="text-xs text-slate-500 dark:text-pink-300/70 font-medium">days</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-pink-300/70 mt-0.5">
            Excludes weekends
          </div>
        </div>

        <div className="rounded-2xl border border-pink-200 bg-white/95 p-3.5 shadow-xs dark:border-pink-900/60 dark:bg-[#221224]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-pink-800/70 dark:text-pink-300/70">
            Daily Target
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-black text-pink-700 dark:text-pink-300">
              60–90
            </span>
            <span className="text-xs text-slate-500 dark:text-pink-300/70 font-medium">mins</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-pink-300/70 mt-0.5">
            Monday through Friday
          </div>
        </div>
      </div>

      {/* SESSION ENDED PROMPT MODAL */}
      {showAssociationPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-950/40 backdrop-blur-md">
          <form
            onSubmit={handleSaveAssociation}
            className="w-full max-w-lg rounded-2xl border border-pink-200 bg-white p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 dark:border-pink-900/70 dark:bg-[#221224]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-pink-100 dark:border-pink-900/60">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-pink-500" />
                <h3 className="text-base font-bold text-pink-950 dark:text-pink-100">
                  Session Complete — Associate & Log
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCancelPrompt}
                className="text-pink-400 hover:text-pink-700 dark:hover:text-pink-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-pink-200/80 leading-relaxed font-medium">
              Confirm the domain, topic, and actual duration to log this study block. This will update your dashboard metrics and mastery progress.
            </p>

            {/* 1. Actual Duration Confirmation */}
            <div className="rounded-xl border border-pink-200 bg-pink-50/70 p-3.5 space-y-2 dark:border-pink-800 dark:bg-pink-950/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-pink-950 dark:text-pink-100">
                  Recorded Active Study Duration:
                </span>
                <span className="font-mono text-sm font-bold text-pink-600 dark:text-pink-300">
                  {formatTimerDigits(promptElapsedSeconds)}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-pink-200/60 dark:border-pink-800">
                <label className="text-[11px] text-slate-600 dark:text-pink-300/80 font-medium whitespace-nowrap">
                  Minutes to record:
                </label>
                <input
                  type="number"
                  min={1}
                  max={480}
                  required
                  value={manualMinutes}
                  onChange={(e) => setManualMinutes(Math.max(1, Number(e.target.value)))}
                  className="w-20 rounded-lg border border-pink-200 bg-white px-2 py-1 font-mono text-xs text-pink-950 font-bold focus:outline-none focus:border-pink-400 dark:border-pink-800 dark:bg-[#1f0f21] dark:text-pink-100"
                />
                <span className="text-[11px] text-slate-500 dark:text-pink-300/70">minutes</span>
              </div>
            </div>

            {/* 2. Official Domain Association */}
            <div>
              <label className="block text-xs font-bold text-pink-950 dark:text-pink-100 mb-1.5">
                Associate Official Exam Domain:
              </label>
              <select
                value={selectedDomainId}
                onChange={(e) => {
                  const newDomId = Number(e.target.value) as DomainId;
                  setSelectedDomainId(newDomId);
                  const domObj = OFFICIAL_DOMAINS.find((d) => d.id === newDomId);
                  if (domObj && domObj.topics.length > 0) {
                    setSelectedTopic(domObj.topics[0]);
                  }
                }}
                className="w-full rounded-xl border border-pink-200 bg-pink-50/40 px-3 py-2 text-xs text-pink-950 font-semibold focus:outline-none focus:border-pink-400 dark:border-pink-800 dark:bg-[#1f0f21] dark:text-pink-100"
              >
                {OFFICIAL_DOMAINS.map((dom) => (
                  <option key={dom.id} value={dom.id}>
                    Domain {dom.id}: {dom.title} ({dom.weight}% Weight){' '}
                    {dom.isHighPriority ? '★ HIGHEST PRIORITY (30%)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Specific Topic Association */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-pink-950 dark:text-pink-100">
                Associate Domain Topic:
              </label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full rounded-xl border border-pink-200 bg-pink-50/40 px-3 py-2 text-xs text-pink-950 font-semibold focus:outline-none focus:border-pink-400 dark:border-pink-800 dark:bg-[#1f0f21] dark:text-pink-100"
              >
                {currentDomainObj?.topics.map((top) => (
                  <option key={top} value={top}>
                    {top}
                  </option>
                ))}
              </select>

              {/* Optional Custom Topic */}
              <input
                type="text"
                placeholder="Or specify custom topic / sub-topic (optional)..."
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                className="w-full rounded-xl border border-pink-200 bg-white px-3 py-1.5 text-xs text-pink-950 placeholder-slate-400 focus:outline-none focus:border-pink-400 dark:border-pink-800 dark:bg-[#1a0b1c] dark:text-pink-100"
              />
            </div>

            {/* 4. Notes & Key Takeaways */}
            <div>
              <label className="block text-xs font-bold text-pink-950 dark:text-pink-100 mb-1">
                Personal Takeaways & Session Notes:
              </label>
              <textarea
                rows={2}
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="Summarize key takeaways, difficult ACL rules, coalesce options, or items to review later..."
                className="w-full rounded-xl border border-pink-200 bg-white p-2.5 text-xs text-pink-950 placeholder-slate-400 focus:outline-none focus:border-pink-400 dark:border-pink-800 dark:bg-[#1a0b1c] dark:text-pink-100"
              />
            </div>

            {/* Modal Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-pink-100 dark:border-pink-900/60">
              <button
                type="button"
                onClick={handleCancelPrompt}
                className="rounded-xl border border-pink-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-pink-50 transition dark:border-pink-800 dark:text-pink-300"
              >
                Back
              </button>
              <button
                type="submit"
                className="rounded-xl bg-pink-500 px-5 py-2 text-xs font-bold text-white hover:bg-pink-600 transition shadow-sm shadow-pink-300/40"
              >
                Save & Update Dashboard
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RECENTLY LOGGED CONFIRMATION CARD */}
      {recentlyLoggedSession && (
        <div className="rounded-2xl border border-pink-200 bg-pink-50 p-4 space-y-2 text-xs dark:border-pink-900/60 dark:bg-pink-950/20">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-bold text-pink-700 dark:text-pink-300">
              <CheckCircle2 className="h-4 w-4 text-pink-500" /> Study Session Successfully Saved
            </span>
            <button
              type="button"
              onClick={() => setRecentlyLoggedSession(null)}
              className="text-pink-400 hover:text-pink-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-slate-600 dark:text-pink-200 font-medium">
            Recorded <strong>{recentlyLoggedSession.durationMinutes} minutes</strong> under{' '}
            <strong>Domain {recentlyLoggedSession.domainId} ({recentlyLoggedSession.topic})</strong>.
            Total study minutes updated to <strong>{totalStudyMinutes} mins</strong>.
          </p>
        </div>
      )}

      {/* RECENT SESSIONS TABLE */}
      <div className="rounded-2xl border border-pink-200 bg-white/95 p-5 space-y-3 shadow-xs dark:border-pink-900/60 dark:bg-[#221224]">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-pink-950 dark:text-pink-100">Study Sessions Log</h3>
          <span className="text-xs text-slate-500 dark:text-pink-300/70 font-medium">
            {sessions.length} session{sessions.length === 1 ? '' : 's'} recorded
          </span>
        </div>

        {sessions.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-6 text-center">
            No study sessions logged yet. Click Start above to begin your first session!
          </p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {sessions.map((sess) => {
              const domObj = OFFICIAL_DOMAINS.find((d) => d.id === sess.domainId);
              return (
                <div
                  key={sess.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-pink-100 bg-pink-50/40 p-3 text-xs dark:border-pink-900/40 dark:bg-[#28152a]"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-pink-950 dark:text-pink-100">{sess.topic}</span>
                      <span className="rounded-full bg-pink-100 px-2 py-0.5 text-[10px] font-mono font-bold text-pink-700 border border-pink-200 dark:bg-pink-950/60 dark:text-pink-300">
                        Domain {sess.domainId} ({domObj?.weight}%)
                      </span>
                    </div>
                    {sess.notes && (
                      <p className="text-slate-500 dark:text-pink-300/70 italic text-[11px] line-clamp-1">
                        "{sess.notes}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center font-mono">
                    <span className="text-slate-500 dark:text-pink-400/80 text-[11px]">{sess.date}</span>
                    <span className="font-bold text-pink-600 dark:text-pink-400">
                      {sess.durationMinutes} min{sess.durationMinutes === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
