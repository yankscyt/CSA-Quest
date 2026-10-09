import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  BookOpen,
  Filter,
  Check,
  ChevronRight,
  ExternalLink,
  Plus,
  Loader2,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { OFFICIAL_DOMAINS } from '../../data/domains';
import { INITIAL_20_PRACTICE_QUESTIONS } from '../../data/questionBank';
import { DomainId, QuizQuestion } from '../../types';

interface QuizEngineProps {
  initialDomainId?: DomainId;
}

export const QuizEngine: React.FC<QuizEngineProps> = ({ initialDomainId }) => {
  const {
    questionBank,
    recordQuizAttempt,
    logMistake,
    addCustomQuestion,
    currentDate,
    targetReadinessScore,
  } = useApp();

  // Mode & Setup state
  const [selectedDomainFilter, setSelectedDomainFilter] = useState<DomainId | 'all'>(
    initialDomainId || 'all'
  );
  const [isTimed, setIsTimed] = useState<boolean>(true);
  const [questionCount, setQuestionCount] = useState<number>(10);

  // Active Quiz State
  const [quizActive, setQuizActive] = useState<boolean>(false);
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userSelections, setUserSelections] = useState<Record<string, string[]>>({});
  const [hasSubmittedCurrent, setHasSubmittedCurrent] = useState<boolean>(false);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(600); // 10 mins default
  const [quizStartTime, setQuizStartTime] = useState<number>(0);

  // Quiz Finished State
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  // AI Generator Modal State
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [aiDomainId, setAiDomainId] = useState<DomainId>(5);
  const [aiTopic, setAiTopic] = useState<string>('Data Schema');
  const [aiCount, setAiCount] = useState<number>(2);
  const [aiQuestionType, setAiQuestionType] = useState<'single' | 'multiple'>('single');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [aiGeneratedQuestions, setAiGeneratedQuestions] = useState<QuizQuestion[]>([]);
  const [aiStatusMessage, setAiStatusMessage] = useState<string>('');

  // Start Quiz
  const startQuiz = (customList?: QuizQuestion[]) => {
    let pool = customList || questionBank;
    if (selectedDomainFilter !== 'all' && !customList) {
      pool = pool.filter((q) => q.domainId === selectedDomainFilter);
    }

    if (pool.length === 0) return;

    // Shuffle and slice
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));

    setActiveQuestions(selected);
    setCurrentIndex(0);
    setUserSelections({});
    setHasSubmittedCurrent(false);
    setQuizScore(0);
    setIsFinished(false);
    setQuizActive(true);
    setQuizStartTime(Date.now());
    setTimeRemainingSeconds(selected.length * 90); // 1.5 minutes per question
  };

  // Timer countdown if timed
  useEffect(() => {
    if (!quizActive || !isTimed || isFinished) return;

    const timer = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizActive, isTimed, isFinished]);

  const currentQ = activeQuestions[currentIndex];

  // Option selection
  const handleToggleOption = (optionId: string) => {
    if (hasSubmittedCurrent) return;
    if (!currentQ) return;

    const currentSelected = userSelections[currentQ.id] || [];

    if (currentQ.type === 'single') {
      setUserSelections((prev) => ({ ...prev, [currentQ.id]: [optionId] }));
    } else {
      // Multiple selection toggle
      if (currentSelected.includes(optionId)) {
        setUserSelections((prev) => ({
          ...prev,
          [currentQ.id]: currentSelected.filter((id) => id !== optionId),
        }));
      } else {
        setUserSelections((prev) => ({
          ...prev,
          [currentQ.id]: [...currentSelected, optionId],
        }));
      }
    }
  };

  // Check answers and reveal explanation
  const handleSubmitCurrentQuestion = () => {
    if (!currentQ) return;
    const selected = userSelections[currentQ.id] || [];

    // Multiple select rule: No partial credit. Must match correct answers exactly!
    const isCorrect =
      selected.length === currentQ.correctAnswerIds.length &&
      selected.every((id) => currentQ.correctAnswerIds.includes(id));

    if (!isCorrect) {
      // Automatically log to persistent mistake notebook
      logMistake(currentQ, selected);
    }

    setHasSubmittedCurrent(true);
  };

  // Move to next question
  const handleNextQuestion = () => {
    if (currentIndex + 1 < activeQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      setHasSubmittedCurrent(false);
    } else {
      finishQuiz();
    }
  };

  // Finish quiz and record attempt
  const finishQuiz = () => {
    let correctCount = 0;
    const domainBreakdown: Record<number, { total: number; correct: number }> = {};

    activeQuestions.forEach((q) => {
      const selected = userSelections[q.id] || [];
      const isCorrect =
        selected.length === q.correctAnswerIds.length &&
        selected.every((id) => q.correctAnswerIds.includes(id));

      if (isCorrect) correctCount++;

      if (!domainBreakdown[q.domainId]) {
        domainBreakdown[q.domainId] = { total: 0, correct: 0 };
      }
      domainBreakdown[q.domainId].total += 1;
      if (isCorrect) {
        domainBreakdown[q.domainId].correct += 1;
      }
    });

    const percentage = Math.round((correctCount / activeQuestions.length) * 100);
    const timeSpent = Math.round((Date.now() - quizStartTime) / 1000);

    setQuizScore(correctCount);
    setIsFinished(true);

    recordQuizAttempt({
      date: currentDate,
      type: selectedDomainFilter === 'all' ? 'quick' : 'domain',
      domainId: selectedDomainFilter === 'all' ? undefined : (selectedDomainFilter as DomainId),
      totalQuestions: activeQuestions.length,
      score: correctCount,
      percentage,
      timeSpentSeconds: timeSpent,
      domainBreakdown,
    });

    if (percentage >= 80) {
      try {
        confetti({ particleCount: 40, spread: 60 });
      } catch (e) {
        // ignore
      }
    }
  };

  // Retry only missed questions
  const handleRetryMissed = () => {
    const missed = activeQuestions.filter((q) => {
      const selected = userSelections[q.id] || [];
      return !(
        selected.length === q.correctAnswerIds.length &&
        selected.every((id) => q.correctAnswerIds.includes(id))
      );
    });

    if (missed.length > 0) {
      startQuiz(missed);
    }
  };

  // AI Question Generation
  const handleGenerateAI = async () => {
    setIsGeneratingAi(true);
    setAiStatusMessage('');

    try {
      const domain = OFFICIAL_DOMAINS.find((d) => d.id === aiDomainId);
      const res = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domainId: aiDomainId,
          domainTitle: domain?.title || 'ServiceNow Platform',
          topic: aiTopic,
          count: aiCount,
          questionType: aiQuestionType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate practice questions');
      }

      setAiGeneratedQuestions(data.questions || []);
      setAiStatusMessage(`Generated ${data.questions?.length || 0} practice questions. Review and add them below!`);
    } catch (err: any) {
      console.error(err);
      setAiStatusMessage(`Notice: ${err.message || 'Gemini server generation unavailable. Built-in practice question bank is active.'}`);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleAddAiQuestionToBank = (q: QuizQuestion) => {
    addCustomQuestion(q);
    setAiGeneratedQuestions((prev) => prev.filter((item) => item.id !== q.id));
  };

  // Format MM:SS
  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pink-200/80 dark:border-pink-900/60 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-pink-950 dark:text-pink-100 flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-pink-500" />
            Practice Quiz Engine
          </h1>
          <p className="text-xs text-slate-500 dark:text-pink-300/70 mt-1 font-medium">
            Carefully written practice questions across all 6 domains. No partial credit on multiple-select (matching official CSA exam rules).
          </p>
        </div>

        {/* AI Question Generator Button */}
        <button
          type="button"
          onClick={() => setShowAiModal(true)}
          className="flex items-center gap-2 rounded-xl bg-pink-100 text-pink-700 px-3.5 py-2 text-xs font-bold border border-pink-200 hover:bg-pink-200/70 dark:bg-pink-950/60 dark:text-pink-300 dark:border-pink-800 transition shadow-sm"
        >
          <Sparkles className="h-4 w-4 text-pink-500" />
          <span>AI Question Generator</span>
        </button>
      </div>

      {/* QUIZ SETUP SCREEN */}
      {!quizActive && !isFinished && (
        <div className="rounded-2xl border border-pink-200 bg-white/95 p-6 space-y-6 max-w-2xl mx-auto shadow-sm shadow-pink-100/50 dark:border-pink-900/60 dark:bg-[#221224]">
          <h2 className="text-base font-bold text-pink-950 dark:text-pink-100">Configure Practice Quiz</h2>

          {/* Domain Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-pink-200 mb-2">
              Select Exam Domain
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedDomainFilter('all')}
                className={`p-3 rounded-xl border text-left transition ${
                  selectedDomainFilter === 'all'
                    ? 'border-pink-400 bg-pink-100/80 text-pink-950 font-bold dark:border-pink-500 dark:bg-pink-950/60 dark:text-pink-100 ring-1 ring-pink-400/40'
                    : 'border-pink-200/80 bg-white text-slate-700 hover:border-pink-300 hover:bg-pink-50/50 dark:border-pink-900/60 dark:bg-[#28152a] dark:text-pink-200'
                }`}
              >
                <div className="text-xs font-bold">All Domains (Mixed Practice)</div>
                <div className="text-[11px] text-slate-500 dark:text-pink-300/70 mt-0.5">
                  Questions selected across all 6 blueprint areas
                </div>
              </button>

              {OFFICIAL_DOMAINS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedDomainFilter(d.id)}
                  className={`p-3 rounded-xl border text-left transition ${
                    selectedDomainFilter === d.id
                      ? 'border-pink-400 bg-pink-100/80 text-pink-950 font-bold dark:border-pink-500 dark:bg-pink-950/60 dark:text-pink-100 ring-1 ring-pink-400/40'
                      : 'border-pink-200/80 bg-white text-slate-700 hover:border-pink-300 hover:bg-pink-50/50 dark:border-pink-900/60 dark:bg-[#28152a] dark:text-pink-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>D{d.id}: {d.title.split(' ')[0]}</span>
                    <span className={d.isHighPriority ? 'text-rose-600 dark:text-rose-400' : 'text-pink-600 dark:text-pink-400'}>
                      {d.weight}% {d.isHighPriority ? '★ Priority' : ''}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-pink-300/70 mt-0.5 truncate">
                    {d.title}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Question Count & Timer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-pink-200 mb-1.5">
                Number of Questions
              </label>
              <div className="flex items-center gap-2">
                {[5, 10, 15, 20].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setQuestionCount(num)}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition ${
                      questionCount === num
                        ? 'border-pink-500 bg-pink-500 text-white font-bold shadow-xs'
                        : 'border-pink-200 bg-white text-slate-700 hover:bg-pink-50 dark:border-pink-900/60 dark:bg-[#28152a] dark:text-pink-200'
                    }`}
                  >
                    {num}Q
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-pink-200 mb-1.5">
                Timing Mode
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsTimed(true)}
                  className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition ${
                    isTimed
                      ? 'border-pink-500 bg-pink-500 text-white font-bold shadow-xs'
                      : 'border-pink-200 bg-white text-slate-700 hover:bg-pink-50 dark:border-pink-900/60 dark:bg-[#28152a] dark:text-pink-200'
                  }`}
                >
                  Timed (1.5m / Q)
                </button>
                <button
                  type="button"
                  onClick={() => setIsTimed(false)}
                  className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition ${
                    !isTimed
                      ? 'border-pink-500 bg-pink-500 text-white font-bold shadow-xs'
                      : 'border-pink-200 bg-white text-slate-700 hover:bg-pink-50 dark:border-pink-900/60 dark:bg-[#28152a] dark:text-pink-200'
                  }`}
                >
                  Untimed
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={() => startQuiz()}
              className="flex-1 w-full rounded-xl bg-pink-500 py-3 text-xs sm:text-sm font-bold text-white hover:bg-pink-600 transition shadow-sm shadow-pink-300/40 active:scale-95"
            >
              Start Practice Quiz ({questionCount}Q)
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedDomainFilter('all');
                startQuiz(INITIAL_20_PRACTICE_QUESTIONS);
              }}
              className="flex-1 w-full rounded-xl border border-pink-300 bg-pink-50 py-3 text-xs sm:text-sm font-bold text-pink-800 hover:bg-pink-100/80 transition dark:border-pink-800 dark:bg-pink-950/40 dark:text-pink-200"
            >
              Test All 20 Core Blueprint Questions
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE QUIZ SCREEN */}
      {quizActive && !isFinished && currentQ && (
        <div className="rounded-2xl border border-pink-200 bg-white/95 p-6 space-y-6 max-w-3xl mx-auto shadow-sm shadow-pink-100/50 dark:border-pink-900/60 dark:bg-[#221224]">
          {/* Top Progress & Timer Bar */}
          <div className="flex items-center justify-between border-b border-pink-100 dark:border-pink-900/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-pink-100 px-2.5 py-0.5 text-xs font-mono font-bold text-pink-700 border border-pink-200 dark:bg-pink-950/60 dark:text-pink-300 dark:border-pink-800">
                Question {currentIndex + 1} of {activeQuestions.length}
              </span>
              <span className="text-xs text-slate-500 dark:text-pink-300/70 font-medium">
                Domain {currentQ.domainId}: {currentQ.topic}
              </span>
            </div>

            {isTimed && (
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-pink-700 bg-pink-100/80 px-2.5 py-1 rounded-lg border border-pink-200 dark:bg-pink-950/50 dark:text-pink-300 dark:border-pink-800">
                <Clock className="h-3.5 w-3.5 text-pink-500" />
                <span>{formatTimer(timeRemainingSeconds)}</span>
              </div>
            )}
          </div>

          {/* Question Prompt */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-pink-800/70 dark:text-pink-300/70">
                {currentQ.type === 'multiple'
                  ? `Multiple-Select (${currentQ.correctAnswerIds.length} answers required)`
                  : 'Single-Choice'}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-pink-950 dark:text-pink-100 leading-relaxed">
              {currentQ.prompt}
            </h2>
          </div>

          {/* Options List */}
          <div className="space-y-2.5">
            {currentQ.options.map((opt) => {
              const selectedList = userSelections[currentQ.id] || [];
              const isSelected = selectedList.includes(opt.id);
              const isCorrectAnswer = currentQ.correctAnswerIds.includes(opt.id);

              let optionStyle =
                'border-pink-200/80 bg-white text-slate-800 hover:border-pink-300 hover:bg-pink-50/50 dark:border-pink-900/60 dark:bg-[#28152a] dark:text-pink-100';

              if (hasSubmittedCurrent) {
                if (isCorrectAnswer) {
                  optionStyle = 'border-emerald-400 bg-emerald-50 text-emerald-950 font-medium dark:bg-emerald-950/40 dark:text-emerald-100 dark:border-emerald-800';
                } else if (isSelected && !isCorrectAnswer) {
                  optionStyle = 'border-rose-400 bg-rose-50 text-rose-950 dark:bg-rose-950/40 dark:text-rose-100 dark:border-rose-800';
                } else {
                  optionStyle = 'border-pink-200/40 bg-pink-50/20 text-slate-400 opacity-60 dark:border-pink-950/40 dark:bg-[#1a0b1c]/40';
                }
              } else if (isSelected) {
                optionStyle = 'border-pink-400 bg-pink-100/80 text-pink-950 font-semibold ring-2 ring-pink-400/40 dark:border-pink-500 dark:bg-pink-950/70 dark:text-pink-100';
              }

              return (
                <div
                  key={opt.id}
                  onClick={() => handleToggleOption(opt.id)}
                  className={`flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition ${optionStyle}`}
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
                  <div className="flex-1 text-xs sm:text-sm leading-relaxed">
                    {opt.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Feedback & Explanation Box (Shown after submitting answer) */}
          {hasSubmittedCurrent && (
            <div className="rounded-xl border border-pink-200 bg-pink-50/70 p-4 space-y-3 dark:border-pink-900/60 dark:bg-[#1c0d1e]">
              <div className="flex items-center gap-2">
                {(() => {
                  const selected = userSelections[currentQ.id] || [];
                  const isCorrect =
                    selected.length === currentQ.correctAnswerIds.length &&
                    selected.every((id) => currentQ.correctAnswerIds.includes(id));
                  return isCorrect ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" /> Correct Answer!
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                      <XCircle className="h-4 w-4" /> Incorrect (Added to Mistake Notebook)
                    </div>
                  );
                })()}
              </div>

              <div className="text-xs text-slate-700 dark:text-pink-200/90 leading-relaxed space-y-1 font-medium">
                <span className="font-bold text-pink-950 dark:text-pink-100 block">Explanation:</span>
                <p>{currentQ.explanation}</p>
              </div>

              {/* Option Explanations Breakdown */}
              {currentQ.optionExplanations && (
                <div className="pt-2 border-t border-pink-200/70 dark:border-pink-900/60 space-y-1 text-[11px]">
                  <span className="font-bold text-pink-800/80 dark:text-pink-300/80 block mb-1">Options Breakdown:</span>
                  {Object.entries(currentQ.optionExplanations).map(([optId, expl]) => (
                    <div key={optId} className="text-slate-600 dark:text-pink-200/80">
                      <strong className="text-pink-900 dark:text-pink-100 font-mono">[{optId}]:</strong> {expl}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-pink-100 dark:border-pink-900/60">
            <span className="text-xs text-slate-500 dark:text-pink-300/70 font-medium">
              {currentQ.type === 'multiple' && (
                <span>
                  Selected: {(userSelections[currentQ.id] || []).length} /{' '}
                  {currentQ.correctAnswerIds.length} required
                </span>
              )}
            </span>

            <div className="flex items-center gap-2">
              {!hasSubmittedCurrent ? (
                <button
                  type="button"
                  disabled={(userSelections[currentQ.id] || []).length === 0}
                  onClick={handleSubmitCurrentQuestion}
                  className="rounded-xl bg-pink-500 px-5 py-2 text-xs font-bold text-white hover:bg-pink-600 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm shadow-pink-300/40 active:scale-95"
                >
                  Check Answer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="flex items-center gap-1.5 rounded-xl bg-pink-500 px-5 py-2 text-xs font-bold text-white hover:bg-pink-600 transition shadow-sm shadow-pink-300/40 active:scale-95"
                >
                  <span>
                    {currentIndex + 1 < activeQuestions.length ? 'Next Question' : 'Complete Quiz'}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* QUIZ FINISHED RESULTS SCREEN */}
      {isFinished && (
        <div className="rounded-2xl border border-pink-200 bg-white/95 p-6 space-y-6 max-w-2xl mx-auto shadow-sm shadow-pink-100/50 dark:border-pink-900/60 dark:bg-[#221224]">
          <div className="flex flex-col items-center text-center p-6 rounded-2xl border border-pink-200 bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100/50 dark:border-pink-900/50 dark:from-pink-950/30 dark:to-rose-950/20">
            <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-pink-500 border border-pink-200 shadow-sm dark:bg-[#1a0b1c] dark:border-pink-800">
              <Award className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-extrabold text-pink-950 dark:text-pink-100">Quiz Completed!</h2>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-4xl font-extrabold text-pink-950 dark:text-pink-100">
                {quizScore} / {activeQuestions.length}
              </span>
              <span className="font-mono text-xl font-bold text-pink-600 dark:text-pink-400">
                ({Math.round((quizScore / activeQuestions.length) * 100)}%)
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-600 dark:text-pink-200/80 font-medium">
              Personal Readiness Target: {targetReadinessScore}%.
              Missed questions have been automatically logged to your Mistake Notebook.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setQuizActive(false);
                setIsFinished(false);
              }}
              className="w-full rounded-xl bg-pink-500 py-2.5 text-xs font-bold text-white hover:bg-pink-600 transition shadow-sm shadow-pink-300/40 active:scale-95"
            >
              Take Another Quiz
            </button>

            {quizScore < activeQuestions.length && (
              <button
                type="button"
                onClick={handleRetryMissed}
                className="w-full rounded-xl border border-rose-300 bg-rose-50 py-2.5 text-xs font-bold text-rose-800 hover:bg-rose-100 transition dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300"
              >
                Retry Missed Questions ({activeQuestions.length - quizScore})
              </button>
            )}
          </div>
        </div>
      )}

      {/* AI PRACTICE QUESTION GENERATOR MODAL */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-950/40 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-pink-200 bg-white p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto dark:border-pink-900/70 dark:bg-[#201022]">
            <div className="flex items-center justify-between pb-3 border-b border-pink-100 dark:border-pink-900/60">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-pink-500" />
                <h3 className="text-base font-bold text-pink-950 dark:text-pink-100">
                  Gemini Practice Question Generator
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="text-pink-400 hover:text-pink-700 dark:hover:text-pink-200"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-pink-200/80 leading-relaxed font-medium">
              Generates targeted practice questions grounded in the official January 2026 CSA Exam blueprint.
              All generated items include verified correct answers, full explanations, and distractor breakdowns.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-pink-200 mb-1">
                  Target Domain
                </label>
                <select
                  value={aiDomainId}
                  onChange={(e) => {
                    const newId = Number(e.target.value) as DomainId;
                    setAiDomainId(newId);
                    const dom = OFFICIAL_DOMAINS.find((d) => d.id === newId);
                    if (dom && dom.topics.length > 0) setAiTopic(dom.topics[0]);
                  }}
                  className="w-full rounded-xl border border-pink-200 bg-pink-50/50 px-3 py-2 text-xs text-pink-950 dark:border-pink-800 dark:bg-pink-950/40 dark:text-pink-100 font-medium"
                >
                  {OFFICIAL_DOMAINS.map((d) => (
                    <option key={d.id} value={d.id}>
                      D{d.id}: {d.title} ({d.weight}%)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-pink-200 mb-1">
                  Target Topic
                </label>
                <select
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  className="w-full rounded-xl border border-pink-200 bg-pink-50/50 px-3 py-2 text-xs text-pink-950 dark:border-pink-800 dark:bg-pink-950/40 dark:text-pink-100 font-medium"
                >
                  {OFFICIAL_DOMAINS.find((d) => d.id === aiDomainId)?.topics.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-pink-200 mb-1">
                  Question Format
                </label>
                <select
                  value={aiQuestionType}
                  onChange={(e) => setAiQuestionType(e.target.value as any)}
                  className="w-full rounded-xl border border-pink-200 bg-pink-50/50 px-3 py-2 text-xs text-pink-950 dark:border-pink-800 dark:bg-pink-950/40 dark:text-pink-100 font-medium"
                >
                  <option value="single">Single-choice (4 options)</option>
                  <option value="multiple">Multiple-select (Choose 2/3)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-pink-200 mb-1">
                  Quantity
                </label>
                <select
                  value={aiCount}
                  onChange={(e) => setAiCount(Number(e.target.value))}
                  className="w-full rounded-xl border border-pink-200 bg-pink-50/50 px-3 py-2 text-xs text-pink-950 dark:border-pink-800 dark:bg-pink-950/40 dark:text-pink-100 font-medium"
                >
                  <option value={1}>1 Question</option>
                  <option value={2}>2 Questions</option>
                  <option value={3}>3 Questions</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              disabled={isGeneratingAi}
              onClick={handleGenerateAI}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-pink-500 py-2.5 text-xs font-bold text-white hover:bg-pink-600 disabled:opacity-50 transition shadow-sm shadow-pink-300/40 active:scale-95"
            >
              {isGeneratingAi ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating Aligned Practice Questions...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Practice Content</span>
                </>
              )}
            </button>

            {aiStatusMessage && (
              <div className="rounded-xl bg-pink-50 p-2.5 text-xs text-pink-900 border border-pink-200 dark:bg-pink-950/50 dark:text-pink-200 dark:border-pink-800 font-medium">
                {aiStatusMessage}
              </div>
            )}

            {/* Generated Questions List for Review */}
            {aiGeneratedQuestions.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-pink-100 dark:border-pink-900/60">
                <h4 className="text-xs font-bold uppercase tracking-wider text-pink-800 dark:text-pink-300">
                  Review & Add to Bank ({aiGeneratedQuestions.length})
                </h4>

                {aiGeneratedQuestions.map((q) => (
                  <div key={q.id} className="rounded-xl border border-pink-200 bg-pink-50/50 p-3.5 space-y-2 text-xs dark:border-pink-900/60 dark:bg-[#1a0b1c]">
                    <p className="font-bold text-pink-950 dark:text-pink-100">{q.prompt}</p>
                    <div className="space-y-1">
                      {q.options.map((opt) => (
                        <div
                          key={opt.id}
                          className={`p-1.5 rounded-lg ${
                            q.correctAnswerIds.includes(opt.id)
                              ? 'bg-emerald-100 text-emerald-900 font-semibold dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'text-slate-600 dark:text-pink-200/80'
                          }`}
                        >
                          [{opt.id}] {opt.text}
                        </div>
                      ))}
                    </div>
                    <p className="text-slate-600 dark:text-pink-300/80 text-[11px] italic pt-1 border-t border-pink-200/60 dark:border-pink-900/60 font-medium">
                      {q.explanation}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleAddAiQuestionToBank(q)}
                      className="flex items-center gap-1 rounded-lg bg-pink-500 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-pink-600 transition shadow-xs"
                    >
                      <Plus className="h-3 w-3" /> Add to Question Bank
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
