import React, { useState, useEffect, useMemo } from 'react';
import {
  FileCheck2,
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Award,
  TrendingUp,
  X,
  BookOpen,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { OFFICIAL_DOMAINS } from '../../data/domains';
import { DomainId, MockExamRecord, QuizQuestion } from '../../types';

export const MockExam: React.FC = () => {
  const {
    questionBank,
    mockAttempts,
    recordMockAttempt,
    logMistake,
    targetReadinessScore,
    currentDate,
  } = useApp();

  // Exam States
  const [examActive, setExamActive] = useState<boolean>(false);
  const [examQuestions, setExamQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string[]>>({});
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(new Set());
  const [secondsRemaining, setSecondsRemaining] = useState<number>(5400); // 90 minutes
  const [examStartTime, setExamStartTime] = useState<number>(0);

  // Modals & Results
  const [showSubmitConfirm, setShowSubmitConfirm] = useState<boolean>(false);
  const [lastExamResult, setLastExamResult] = useState<MockExamRecord | null>(null);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'missed' | 'flagged'>('all');

  // Assembly of the 60 questions based on blueprint distribution:
  // D1: 4, D2: 6, D3: 12, D4: 12, D5: 18, D6: 8 = 60 questions!
  const generateMockQuestions = (): QuizQuestion[] => {
    const targetCounts: Record<number, number> = {
      1: 4,
      2: 6,
      3: 12,
      4: 12,
      5: 18,
      6: 8,
    };

    const selected: QuizQuestion[] = [];

    OFFICIAL_DOMAINS.forEach((domain) => {
      const count = targetCounts[domain.id] || 4;
      const domainQuestions = questionBank.filter((q) => q.domainId === domain.id);
      const shuffled = [...domainQuestions].sort(() => 0.5 - Math.random());

      // If bank has enough, take exact amount. If not, repeat to reach target.
      let taken = shuffled.slice(0, count);
      while (taken.length < count && domainQuestions.length > 0) {
        taken.push(domainQuestions[Math.floor(Math.random() * domainQuestions.length)]);
      }
      selected.push(...taken);
    });

    // Final shuffle so questions from different domains are interspersed across the 60
    return selected.sort(() => 0.5 - Math.random()).slice(0, 60);
  };

  const startMockExam = () => {
    const questions = generateMockQuestions();
    setExamQuestions(questions);
    setCurrentIdx(0);
    setUserAnswers({});
    setFlaggedIds(new Set());
    setSecondsRemaining(5400); // 90 mins
    setExamStartTime(Date.now());
    setExamActive(true);
    setLastExamResult(null);
  };

  // 90-minute countdown timer with auto-submit
  useEffect(() => {
    if (!examActive || lastExamResult) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examActive, lastExamResult]);

  const currentQ = examQuestions[currentIdx];

  // Option selection
  const handleToggleOption = (optId: string) => {
    if (!currentQ) return;
    const current = userAnswers[currentQ.id] || [];

    if (currentQ.type === 'single') {
      setUserAnswers((prev) => ({ ...prev, [currentQ.id]: [optId] }));
    } else {
      if (current.includes(optId)) {
        setUserAnswers((prev) => ({
          ...prev,
          [currentQ.id]: current.filter((id) => id !== optId),
        }));
      } else {
        setUserAnswers((prev) => ({
          ...prev,
          [currentQ.id]: [...current, optId],
        }));
      }
    }
  };

  // Flag toggle
  const handleToggleFlag = () => {
    if (!currentQ) return;
    setFlaggedIds((prev) => {
      const next = new Set(prev);
      if (next.has(currentQ.id)) {
        next.delete(currentQ.id);
      } else {
        next.add(currentQ.id);
      }
      return next;
    });
  };

  // Calculate & Submit Mock Exam
  const handleSubmitExam = () => {
    setShowSubmitConfirm(false);

    let correctCount = 0;
    const domainBreakdown: Record<number, { total: number; correct: number; percentage: number }> = {};

    OFFICIAL_DOMAINS.forEach((d) => {
      domainBreakdown[d.id] = { total: 0, correct: 0, percentage: 0 };
    });

    examQuestions.forEach((q) => {
      const selected = userAnswers[q.id] || [];
      const isCorrect =
        selected.length === q.correctAnswerIds.length &&
        selected.every((id) => q.correctAnswerIds.includes(id));

      if (isCorrect) correctCount++;
      else {
        // Automatically send missed question to Mistake Notebook
        logMistake(q, selected);
      }

      if (!domainBreakdown[q.domainId]) {
        domainBreakdown[q.domainId] = { total: 0, correct: 0, percentage: 0 };
      }
      domainBreakdown[q.domainId].total += 1;
      if (isCorrect) {
        domainBreakdown[q.domainId].correct += 1;
      }
    });

    // Compute percentages
    Object.keys(domainBreakdown).forEach((domId) => {
      const d = domainBreakdown[Number(domId)];
      if (d.total > 0) {
        d.percentage = Math.round((d.correct / d.total) * 100);
      }
    });

    const scorePercentage = Math.round((correctCount / examQuestions.length) * 100);
    const timeSpent = Math.round((Date.now() - examStartTime) / 1000);

    const examRecord: MockExamRecord = {
      id: `mock-${Date.now()}`,
      date: currentDate,
      timestamp: Date.now(),
      timeSpentSeconds: timeSpent,
      score: correctCount,
      percentage: scorePercentage,
      domainScores: domainBreakdown,
      flaggedQuestionIds: Array.from(flaggedIds),
      userAnswers,
      questions: examQuestions,
    };

    recordMockAttempt(examRecord);
    setLastExamResult(examRecord);
    setExamActive(false);

    if (scorePercentage >= targetReadinessScore) {
      try {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      } catch (e) {
        // ignore
      }
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(userAnswers).filter(
    (k) => (userAnswers[k] || []).length > 0
  ).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pink-200/80 dark:border-pink-900/60 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-pink-950 dark:text-pink-100 flex items-center gap-2">
            <FileCheck2 className="h-6 w-6 text-pink-500" />
            Full 60-Question Mock Exam
          </h1>
          <p className="text-xs text-slate-500 dark:text-pink-300/70 mt-1 font-medium">
            Official format: 60 questions, 90 minutes. Domain distribution reflects the official January 2026 blueprint.
          </p>
        </div>

        {!examActive && (
          <button
            type="button"
            onClick={startMockExam}
            className="rounded-xl bg-pink-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-pink-600 transition shadow-sm shadow-pink-300/40 active:scale-95"
          >
            Start 60-Question Simulation
          </button>
        )}
      </div>

      {/* STATE A: NOT STARTED / LANDING OVERVIEW */}
      {!examActive && !lastExamResult && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="lg:col-span-2 rounded-2xl border border-pink-200 bg-white/95 p-6 space-y-5 shadow-sm shadow-pink-100/50 dark:border-pink-900/60 dark:bg-[#221224]">
            <h2 className="text-base font-bold text-pink-950 dark:text-pink-100">Official CSA Exam Simulation Blueprint</h2>
            <p className="text-xs text-slate-600 dark:text-pink-200/80 leading-relaxed font-medium">
              This mock exam replicates the exact time conditions and question volume of the official ServiceNow Certified System Administrator exam.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-pink-200 bg-pink-50/50 p-3 text-center dark:border-pink-900/60 dark:bg-[#1a0b1c]">
                <div className="font-mono text-2xl font-black text-pink-950 dark:text-pink-100">60</div>
                <div className="text-[11px] text-slate-500 dark:text-pink-300/70 font-medium">Total Questions</div>
              </div>
              <div className="rounded-xl border border-pink-200 bg-pink-50/50 p-3 text-center dark:border-pink-900/60 dark:bg-[#1a0b1c]">
                <div className="font-mono text-2xl font-black text-pink-600 dark:text-pink-400">90</div>
                <div className="text-[11px] text-slate-500 dark:text-pink-300/70 font-medium">Minutes Limit</div>
              </div>
              <div className="rounded-xl border border-pink-200 bg-pink-50/50 p-3 text-center dark:border-pink-900/60 dark:bg-[#1a0b1c]">
                <div className="font-mono text-2xl font-black text-emerald-600 dark:text-emerald-400">{targetReadinessScore}%</div>
                <div className="text-[11px] text-slate-500 dark:text-pink-300/70 font-medium">Personal Target</div>
              </div>
            </div>

            <div className="border-t border-pink-100 dark:border-pink-900/60 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-pink-800/80 dark:text-pink-300/80 mb-2.5">
                Practice Domain Distribution (60 Questions Total)
              </h3>
              <div className="space-y-2">
                {OFFICIAL_DOMAINS.map((dom) => (
                  <div key={dom.id} className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-pink-50/60 border border-pink-200/80 dark:bg-[#1a0b1c] dark:border-pink-900/50">
                    <span className="text-slate-700 dark:text-pink-200 truncate max-w-xs font-medium">
                      Domain {dom.id}: {dom.title}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 dark:text-pink-300/70">{dom.weight}%</span>
                      <span className="font-mono font-bold text-pink-600 dark:text-pink-400">
                        {dom.mockQuestionTarget} Questions
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={startMockExam}
              className="w-full rounded-xl bg-pink-500 py-3.5 text-xs sm:text-sm font-bold text-white hover:bg-pink-600 transition shadow-sm shadow-pink-300/40 active:scale-95"
            >
              Begin Timed 90-Minute Exam
            </button>
          </div>

          {/* Previous Attempts Sidebar */}
          <div className="rounded-2xl border border-pink-200 bg-white/95 p-5 space-y-4 shadow-sm shadow-pink-100/50 dark:border-pink-900/60 dark:bg-[#221224]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-pink-800/80 dark:text-pink-300/80">
              Mock Exam History ({mockAttempts.length})
            </h3>
            {mockAttempts.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-pink-300/70 italic py-6 text-center">
                No mock exam attempts recorded yet.
              </p>
            ) : (
              <div className="space-y-3">
                {mockAttempts.map((attempt, i) => (
                  <div key={attempt.id} className="rounded-xl border border-pink-200 bg-pink-50/50 p-3 text-xs space-y-1.5 dark:border-pink-900/60 dark:bg-[#1a0b1c]">
                    <div className="flex justify-between items-center font-semibold">
                      <span className="text-pink-950 dark:text-pink-100">Attempt #{mockAttempts.length - i}</span>
                      <span className={attempt.percentage >= targetReadinessScore ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-pink-600 dark:text-pink-400 font-bold'}>
                        {attempt.score}/60 ({attempt.percentage}%)
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500 dark:text-pink-300/70 text-[11px]">
                      <span>{attempt.date}</span>
                      <span>{Math.round(attempt.timeSpentSeconds / 60)} mins used</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* STATE B: ACTIVE MOCK EXAM INTERFACE */}
      {examActive && currentQ && (
        <div className="space-y-4 max-w-5xl mx-auto">
          {/* Top Exam Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-pink-200 bg-white/95 p-4 shadow-sm shadow-pink-100/50 dark:border-pink-900/60 dark:bg-[#221224]">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-pink-100 px-3 py-1 text-xs font-mono font-bold text-pink-700 border border-pink-200 dark:bg-pink-950/60 dark:text-pink-300 dark:border-pink-800">
                Question {currentIdx + 1} of 60
              </span>
              <span className="text-xs text-slate-500 dark:text-pink-300/70 hidden sm:inline font-medium">
                Domain {currentQ.domainId}: {currentQ.topic}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Flag for review button */}
              <button
                type="button"
                onClick={handleToggleFlag}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold border transition ${
                  flaggedIds.has(currentQ.id)
                    ? 'border-amber-400 bg-amber-50 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                    : 'border-pink-200 bg-white text-slate-700 hover:bg-pink-50 dark:border-pink-800 dark:bg-[#201022] dark:text-pink-300'
                }`}
              >
                <Flag className="h-3.5 w-3.5 fill-current" />
                <span>{flaggedIds.has(currentQ.id) ? 'Flagged' : 'Mark for Review'}</span>
              </button>

              {/* 90-Minute Timer Badge */}
              <div
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-mono font-bold border ${
                  secondsRemaining <= 600
                    ? 'border-rose-300 bg-rose-50 text-rose-700 animate-pulse dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                    : 'border-pink-200 bg-pink-50 text-pink-900 dark:border-pink-800 dark:bg-pink-950/60 dark:text-pink-200'
                }`}
              >
                <Clock className="h-3.5 w-3.5 text-pink-500" />
                <span>{formatTimer(secondsRemaining)}</span>
              </div>

              {/* Submit Exam Button */}
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(true)}
                className="rounded-lg bg-pink-500 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-pink-600 transition shadow-xs active:scale-95"
              >
                Submit Exam
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Main Question Column */}
            <div className="lg:col-span-3 rounded-2xl border border-pink-200 bg-white/95 p-6 space-y-6 shadow-sm shadow-pink-100/50 dark:border-pink-900/60 dark:bg-[#221224]">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-pink-800/80 dark:text-pink-300/80">
                  {currentQ.type === 'multiple'
                    ? `Multiple-Select (${currentQ.correctAnswerIds.length} answers required)`
                    : 'Single-Choice'}
                </span>
                <h2 className="text-base sm:text-lg font-bold text-pink-950 dark:text-pink-100 mt-1 leading-relaxed">
                  {currentQ.prompt}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options.map((opt) => {
                  const selected = userAnswers[currentQ.id] || [];
                  const isSelected = selected.includes(opt.id);

                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleToggleOption(opt.id)}
                      className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition ${
                        isSelected
                          ? 'border-pink-400 bg-pink-100/80 text-pink-950 font-semibold ring-2 ring-pink-400/40 dark:border-pink-500 dark:bg-pink-950/70 dark:text-pink-100'
                          : 'border-pink-200/80 bg-white text-slate-800 hover:border-pink-300 hover:bg-pink-50/50 dark:border-pink-900/60 dark:bg-[#28152a] dark:text-pink-100'
                      }`}
                    >
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-lg border text-xs font-mono font-bold mt-0.5 flex-shrink-0 ${
                          isSelected
                            ? 'border-pink-500 bg-pink-500 text-white shadow-xs'
                            : 'border-pink-200 bg-pink-50 text-pink-700 dark:border-pink-800 dark:bg-pink-950/60 dark:text-pink-300'
                        }`}
                      >
                        {opt.id}
                      </div>
                      <div className="text-xs sm:text-sm leading-relaxed">{opt.text}</div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Nav Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-pink-100 dark:border-pink-900/60">
                <button
                  type="button"
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                  className="flex items-center gap-1 rounded-xl border border-pink-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-pink-50 disabled:opacity-30 disabled:cursor-not-allowed transition dark:border-pink-800 dark:bg-[#201022] dark:text-pink-200"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>

                <div className="text-xs text-slate-500 dark:text-pink-300/70 font-mono font-medium">
                  {answeredCount} / 60 Answered
                </div>

                <button
                  type="button"
                  disabled={currentIdx === 59}
                  onClick={() => setCurrentIdx((prev) => Math.min(59, prev + 1))}
                  className="flex items-center gap-1 rounded-xl bg-pink-500 px-4 py-2 text-xs font-semibold text-white hover:bg-pink-600 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-xs active:scale-95"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Question Navigator Grid (1 to 60) */}
            <div className="rounded-2xl border border-pink-200 bg-white/95 p-4 space-y-4 shadow-sm shadow-pink-100/50 dark:border-pink-900/60 dark:bg-[#221224]">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-pink-800/80 dark:text-pink-300/80">
                  Question Navigator
                </h3>
                <span className="text-[11px] text-slate-500 dark:text-pink-300/70 font-mono">
                  {answeredCount}/60
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1.5 max-h-80 overflow-y-auto pr-1">
                {examQuestions.map((q, idx) => {
                  const isCurrent = idx === currentIdx;
                  const isAnswered = (userAnswers[q.id] || []).length > 0;
                  const isFlagged = flaggedIds.has(q.id);

                  let bg = 'bg-pink-50/70 text-slate-700 border-pink-200 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-800/60';
                  if (isCurrent) {
                    bg = 'bg-pink-500 text-white font-bold ring-2 ring-pink-400 shadow-xs';
                  } else if (isFlagged) {
                    bg = 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-700';
                  } else if (isAnswered) {
                    bg = 'bg-pink-200/80 text-pink-950 font-semibold border-pink-300 dark:bg-pink-900/60 dark:text-pink-100';
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIdx(idx)}
                      className={`h-8 rounded-lg border text-xs font-mono transition flex items-center justify-center relative ${bg}`}
                    >
                      <span>{idx + 1}</span>
                      {isFlagged && (
                        <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-pink-100 dark:border-pink-900/60 pt-3 text-[11px] text-slate-500 dark:text-pink-300/70 space-y-1.5 font-medium">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded bg-pink-500" /> Current Question
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded bg-pink-200 border border-pink-300" /> Answered
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded bg-amber-400" /> Marked for Review
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM FINAL SUBMISSION MODAL */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-950/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-pink-200 bg-white p-6 shadow-2xl space-y-4 dark:border-pink-900/70 dark:bg-[#201022]">
            <h3 className="text-base font-bold text-pink-950 dark:text-pink-100">Submit Mock Exam?</h3>
            <p className="text-xs text-slate-600 dark:text-pink-200/80 leading-relaxed font-medium">
              Are you sure you want to finalize your exam submission?
            </p>

            <div className="rounded-xl border border-pink-200 bg-pink-50/50 p-3 space-y-1 text-xs dark:border-pink-900/60 dark:bg-[#1a0b1c]">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-pink-300/70 font-medium">Answered Questions:</span>
                <span className="text-pink-950 dark:text-pink-100 font-bold">{answeredCount} / 60</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-pink-300/70 font-medium">Unanswered Questions:</span>
                <span className={60 - answeredCount > 0 ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-emerald-600 dark:text-emerald-400 font-bold'}>
                  {60 - answeredCount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-pink-300/70 font-medium">Marked for Review:</span>
                <span className="text-pink-950 dark:text-pink-200 font-medium">{flaggedIds.size}</span>
              </div>
            </div>

            {60 - answeredCount > 0 && (
              <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800 font-medium">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-600" />
                <span>You have unanswered questions. Unanswered questions receive 0 points.</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(false)}
                className="rounded-xl border border-pink-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-pink-50 transition dark:border-pink-800 dark:text-pink-300"
              >
                Return to Exam
              </button>
              <button
                type="button"
                onClick={handleSubmitExam}
                className="rounded-xl bg-pink-500 px-4 py-1.5 text-xs font-bold text-white hover:bg-pink-600 transition shadow-xs active:scale-95"
              >
                Confirm & Grade
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATE C: EXAM RESULTS & DEEP REVIEW */}
      {lastExamResult && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Summary Banner */}
          <div className="rounded-2xl border border-pink-200 bg-white/95 p-6 shadow-sm shadow-pink-100/50 space-y-6 dark:border-pink-900/60 dark:bg-[#221224]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pink-100 dark:border-pink-900/60 pb-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-pink-800/80 dark:text-pink-300/80">
                  Mock Exam Results
                </span>
                <h2 className="text-2xl font-black text-pink-950 dark:text-pink-100 mt-0.5">
                  Score: {lastExamResult.score} / 60 ({lastExamResult.percentage}%)
                </h2>
                <p className="text-xs text-slate-500 dark:text-pink-300/70 mt-1 font-medium">
                  Time Used: {Math.floor(lastExamResult.timeSpentSeconds / 60)}m {lastExamResult.timeSpentSeconds % 60}s
                  of 90 minutes.
                </p>
              </div>

              <div className="text-right">
                <div
                  className={`inline-block px-3 py-1.5 rounded-xl text-xs font-bold border ${
                    lastExamResult.percentage >= targetReadinessScore
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                  }`}
                >
                  {lastExamResult.percentage >= targetReadinessScore
                    ? `Met Target (${targetReadinessScore}%)`
                    : `Below Target (${targetReadinessScore}%)`}
                </div>
              </div>
            </div>

            {/* Performance by Domain */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-pink-800/80 dark:text-pink-300/80">
                Performance by Domain
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {OFFICIAL_DOMAINS.map((domain) => {
                  const score = lastExamResult.domainScores[domain.id] || {
                    total: 0,
                    correct: 0,
                    percentage: 0,
                  };
                  return (
                    <div
                      key={domain.id}
                      className="rounded-xl border border-pink-200 bg-pink-50/50 p-3.5 space-y-2 dark:border-pink-900/60 dark:bg-[#1a0b1c]"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-pink-950 dark:text-pink-100 truncate max-w-[200px]">
                          D{domain.id}: {domain.title}
                        </span>
                        <span className="font-mono font-bold text-pink-600 dark:text-pink-400">
                          {score.correct}/{score.total} ({score.percentage}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-pink-100 dark:bg-pink-950/80 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-pink-500"
                          style={{ width: `${score.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-pink-100 dark:border-pink-900/60">
              <button
                type="button"
                onClick={startMockExam}
                className="rounded-xl bg-pink-500 px-4 py-2 text-xs font-bold text-white hover:bg-pink-600 transition shadow-xs active:scale-95"
              >
                Retake 60-Question Mock
              </button>
            </div>
          </div>

          {/* Question Review List */}
          <div className="rounded-2xl border border-pink-200 bg-white/95 p-6 space-y-4 shadow-sm shadow-pink-100/50 dark:border-pink-900/60 dark:bg-[#221224]">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-pink-950 dark:text-pink-100">Review All 60 Questions</h3>
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setReviewFilter('all')}
                  className={`px-3 py-1 rounded-lg transition ${
                    reviewFilter === 'all'
                      ? 'bg-pink-500 text-white font-bold'
                      : 'text-slate-600 hover:bg-pink-50 dark:text-pink-300'
                  }`}
                >
                  All (60)
                </button>
                <button
                  type="button"
                  onClick={() => setReviewFilter('missed')}
                  className={`px-3 py-1 rounded-lg transition ${
                    reviewFilter === 'missed'
                      ? 'bg-rose-500 text-white font-bold'
                      : 'text-slate-600 hover:bg-pink-50 dark:text-pink-300'
                  }`}
                >
                  Missed ({60 - lastExamResult.score})
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {lastExamResult.questions.map((q, idx) => {
                const userSelected = lastExamResult.userAnswers[q.id] || [];
                const isCorrect =
                  userSelected.length === q.correctAnswerIds.length &&
                  userSelected.every((id) => q.correctAnswerIds.includes(id));

                if (reviewFilter === 'missed' && isCorrect) return null;

                return (
                  <div
                    key={q.id}
                    className={`rounded-xl border p-4 space-y-3 ${
                      isCorrect
                        ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                        : 'border-rose-200 bg-rose-50/50 dark:border-rose-900/40 dark:bg-rose-950/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-slate-600 dark:text-pink-300/80">
                        Q{idx + 1} • Domain {q.domainId} ({q.topic})
                      </span>
                      {isCorrect ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-4 w-4" /> Correct
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                          <XCircle className="h-4 w-4" /> Incorrect
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-pink-950 dark:text-pink-100">{q.prompt}</p>

                    <div className="space-y-1.5 text-xs">
                      {q.options.map((opt) => (
                        <div
                          key={opt.id}
                          className={`p-2 rounded-lg border ${
                            q.correctAnswerIds.includes(opt.id)
                              ? 'border-emerald-300 bg-emerald-100/70 text-emerald-950 font-medium dark:bg-emerald-950/50 dark:text-emerald-200 dark:border-emerald-800'
                              : userSelected.includes(opt.id)
                              ? 'border-rose-300 bg-rose-100/70 text-rose-950 dark:bg-rose-950/50 dark:text-rose-200 dark:border-rose-800'
                              : 'border-pink-200/60 bg-white text-slate-600 dark:border-pink-900/40 dark:bg-[#1a0b1c] dark:text-pink-200/80'
                          }`}
                        >
                          [{opt.id}] {opt.text}
                          {userSelected.includes(opt.id) && ' (Your answer)'}
                        </div>
                      ))}
                    </div>

                    <div className="text-xs text-slate-600 dark:text-pink-200/80 pt-2 border-t border-pink-100 dark:border-pink-900/60 font-medium">
                      <strong className="text-pink-950 dark:text-pink-100">Explanation: </strong>
                      {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
