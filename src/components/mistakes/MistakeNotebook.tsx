import React, { useState } from 'react';
import {
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Trash2,
  Edit3,
  Search,
  Filter,
  Check,
  ChevronRight,
  BookOpen,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { OFFICIAL_DOMAINS } from '../../data/domains';
import { DomainId, MistakeRecord } from '../../types';

export const MistakeNotebook: React.FC = () => {
  const {
    mistakes,
    updateMistakeNote,
    updateMistakeStatus,
    removeMistake,
  } = useApp();

  const [domainFilter, setDomainFilter] = useState<DomainId | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Needs Review' | 'Reviewing' | 'Mastered'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Editing note modal
  const [editingMistake, setEditingMistake] = useState<MistakeRecord | null>(null);
  const [noteDraft, setNoteDraft] = useState('');

  // Drill Mode State
  const [isDrillMode, setIsDrillMode] = useState(false);
  const [drillIndex, setDrillIndex] = useState(0);
  const [drillAnswer, setDrillAnswer] = useState<string[]>([]);
  const [showDrillResult, setShowDrillResult] = useState(false);

  // Filtered mistakes
  const filteredMistakes = mistakes.filter((m) => {
    if (domainFilter !== 'all' && m.question.domainId !== domainFilter) return false;
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const promptMatch = m.question.prompt.toLowerCase().includes(q);
      const topicMatch = m.question.topic.toLowerCase().includes(q);
      const noteMatch = (m.userNote || '').toLowerCase().includes(q);
      if (!promptMatch && !topicMatch && !noteMatch) return false;
    }
    return true;
  });

  // Start drill mode
  const handleStartDrill = () => {
    if (filteredMistakes.length === 0) return;
    setIsDrillMode(true);
    setDrillIndex(0);
    setDrillAnswer([]);
    setShowDrillResult(false);
  };

  const currentDrillMistake = filteredMistakes[drillIndex];

  const handleOpenEditNote = (mistake: MistakeRecord) => {
    setEditingMistake(mistake);
    setNoteDraft(mistake.userNote || '');
  };

  const handleSaveNote = () => {
    if (!editingMistake) return;
    updateMistakeNote(editingMistake.id, noteDraft);
    setEditingMistake(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pink-200/80 dark:border-pink-900/60 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-pink-950 dark:text-pink-100 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-pink-500" />
            Mistake Notebook & Error Analysis
          </h1>
          <p className="text-xs text-slate-500 dark:text-pink-300/70 mt-1 font-medium">
            Questions you answered incorrectly in practice quizzes and mock exams are logged here with reflections.
          </p>
        </div>

        {filteredMistakes.length > 0 && !isDrillMode && (
          <button
            type="button"
            onClick={handleStartDrill}
            className="flex items-center gap-2 rounded-xl bg-pink-500 px-4 py-2 text-xs font-bold text-white hover:bg-pink-600 transition shadow-sm shadow-pink-300/40 active:scale-95"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Drill Mistakes ({filteredMistakes.length})</span>
          </button>
        )}
      </div>

      {/* DRILL MODE VIEW */}
      {isDrillMode && currentDrillMistake && (
        <div className="rounded-2xl border border-pink-200 bg-white/95 p-6 space-y-6 max-w-2xl mx-auto shadow-sm shadow-pink-100/50 dark:border-pink-900/60 dark:bg-[#221224]">
          <div className="flex items-center justify-between border-b border-pink-100 dark:border-pink-900/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-pink-100 px-2.5 py-1 text-xs font-bold text-pink-700 border border-pink-200 dark:bg-pink-950/60 dark:text-pink-300 dark:border-pink-800">
                Drill {drillIndex + 1} of {filteredMistakes.length}
              </span>
              <span className="text-xs text-slate-500 dark:text-pink-300/70 font-medium">
                Domain {currentDrillMistake.question.domainId} • Times missed: {currentDrillMistake.timesIncorrect}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsDrillMode(false)}
              className="text-xs font-bold text-pink-600 hover:text-pink-700 dark:text-pink-300"
            >
              Exit Drill
            </button>
          </div>

          <div>
            <h2 className="text-base font-bold text-pink-950 dark:text-pink-100 leading-relaxed">
              {currentDrillMistake.question.prompt}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {currentDrillMistake.question.options.map((opt) => {
              const isSelected = drillAnswer.includes(opt.id);
              const isCorrect = currentDrillMistake.question.correctAnswerIds.includes(opt.id);

              let style = 'border-pink-200/80 bg-white text-slate-800 hover:border-pink-300 hover:bg-pink-50/50 dark:border-pink-900/60 dark:bg-[#28152a] dark:text-pink-100';
              if (showDrillResult) {
                if (isCorrect) {
                  style = 'border-emerald-400 bg-emerald-50 text-emerald-950 font-medium dark:bg-emerald-950/40 dark:text-emerald-100 dark:border-emerald-800';
                } else if (isSelected) {
                  style = 'border-rose-400 bg-rose-50 text-rose-950 dark:bg-rose-950/40 dark:text-rose-100 dark:border-rose-800';
                }
              } else if (isSelected) {
                style = 'border-pink-400 bg-pink-100/80 text-pink-950 font-semibold ring-2 ring-pink-400/40 dark:border-pink-500 dark:bg-pink-950/70 dark:text-pink-100';
              }

              return (
                <div
                  key={opt.id}
                  onClick={() => {
                    if (showDrillResult) return;
                    if (currentDrillMistake.question.type === 'single') {
                      setDrillAnswer([opt.id]);
                    } else {
                      setDrillAnswer((prev) =>
                        prev.includes(opt.id) ? prev.filter((x) => x !== opt.id) : [...prev, opt.id]
                      );
                    }
                  }}
                  className={`flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition text-xs ${style}`}
                >
                  <div className="font-mono font-bold mt-0.5">[{opt.id}]</div>
                  <div>{opt.text}</div>
                </div>
              );
            })}
          </div>

          {showDrillResult && (
            <div className="rounded-xl border border-pink-200 bg-pink-50/70 p-4 space-y-2 text-xs dark:border-pink-900/60 dark:bg-[#1c0d1e]">
              <div className="font-bold text-pink-950 dark:text-pink-100">Explanation:</div>
              <p className="text-slate-700 dark:text-pink-200/90 leading-relaxed font-medium">
                {currentDrillMistake.question.explanation}
              </p>
              {currentDrillMistake.userNote && (
                <div className="pt-2 border-t border-pink-200/70 dark:border-pink-900/60 text-amber-800 dark:text-amber-300 font-medium">
                  <strong>Your previous reflection:</strong> {currentDrillMistake.userNote}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-pink-100 dark:border-pink-900/60">
            {!showDrillResult ? (
              <button
                type="button"
                disabled={drillAnswer.length === 0}
                onClick={() => setShowDrillResult(true)}
                className="rounded-xl bg-pink-500 px-5 py-2 text-xs font-bold text-white hover:bg-pink-600 disabled:opacity-40 transition shadow-xs active:scale-95"
              >
                Reveal Answer
              </button>
            ) : (
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => {
                    updateMistakeStatus(currentDrillMistake.id, 'Mastered');
                    if (drillIndex + 1 < filteredMistakes.length) {
                      setDrillIndex((prev) => prev + 1);
                      setDrillAnswer([]);
                      setShowDrillResult(false);
                    } else {
                      setIsDrillMode(false);
                    }
                  }}
                  className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-xs active:scale-95"
                >
                  Mark Mastered
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (drillIndex + 1 < filteredMistakes.length) {
                      setDrillIndex((prev) => prev + 1);
                      setDrillAnswer([]);
                      setShowDrillResult(false);
                    } else {
                      setIsDrillMode(false);
                    }
                  }}
                  className="rounded-xl bg-pink-500 px-4 py-2 text-xs font-bold text-white hover:bg-pink-600 transition shadow-xs active:scale-95"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* REGULAR LIST VIEW */}
      {!isDrillMode && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-pink-200 bg-white/95 p-4 shadow-sm shadow-pink-100/50 dark:border-pink-900/60 dark:bg-[#221224]">
            <div className="flex flex-wrap items-center gap-2">
              {/* Domain Filter */}
              <select
                value={domainFilter}
                onChange={(e) => setDomainFilter(e.target.value === 'all' ? 'all' : (Number(e.target.value) as DomainId))}
                className="rounded-xl border border-pink-200 bg-pink-50/50 px-3 py-1.5 text-xs text-pink-950 font-medium dark:border-pink-800 dark:bg-pink-950/40 dark:text-pink-100"
              >
                <option value="all">All Domains</option>
                {OFFICIAL_DOMAINS.map((d) => (
                  <option key={d.id} value={d.id}>
                    Domain {d.id} ({d.weight}%)
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="rounded-xl border border-pink-200 bg-pink-50/50 px-3 py-1.5 text-xs text-pink-950 font-medium dark:border-pink-800 dark:bg-pink-950/40 dark:text-pink-100"
              >
                <option value="all">All Statuses</option>
                <option value="Needs Review">Needs Review</option>
                <option value="Reviewing">Reviewing</option>
                <option value="Mastered">Mastered</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-pink-400" />
              <input
                type="text"
                placeholder="Search mistakes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-pink-200 bg-pink-50/50 pl-8 pr-3 py-1.5 text-xs text-pink-950 placeholder-slate-400 focus:outline-none dark:border-pink-800 dark:bg-pink-950/40 dark:text-pink-100"
              />
            </div>
          </div>

          {/* List of Mistakes */}
          {filteredMistakes.length === 0 ? (
            <div className="rounded-2xl border border-pink-200 bg-white/95 p-12 text-center space-y-3 shadow-sm shadow-pink-100/50 dark:border-pink-900/60 dark:bg-[#221224]">
              <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-pink-950 dark:text-pink-100">No Mistakes Found</h3>
              <p className="text-xs text-slate-500 dark:text-pink-300/70 max-w-sm mx-auto font-medium">
                {mistakes.length === 0
                  ? 'Great job! Any questions you miss in practice quizzes or mock exams will automatically appear here for focused review.'
                  : 'No mistakes match your current filter criteria.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMistakes.map((m) => (
                <div
                  key={m.id}
                  className="rounded-2xl border border-pink-200 bg-white/95 p-5 space-y-4 shadow-sm shadow-pink-100/50 hover:border-pink-300 transition dark:border-pink-900/60 dark:bg-[#221224]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-pink-100 dark:border-pink-900/60 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-pink-100 px-2 py-0.5 text-xs font-mono font-bold text-pink-700 border border-pink-200 dark:bg-pink-950/60 dark:text-pink-300 dark:border-pink-800">
                        Domain {m.question.domainId}
                      </span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-pink-200">
                        {m.question.topic}
                      </span>
                      <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50">
                        Missed {m.timesIncorrect}x
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Status Dropdown */}
                      <select
                        value={m.status}
                        onChange={(e) => updateMistakeStatus(m.id, e.target.value as any)}
                        className={`rounded-lg border px-2 py-1 text-xs font-semibold ${
                          m.status === 'Mastered'
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                            : m.status === 'Reviewing'
                            ? 'border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                            : 'border-rose-300 bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                        }`}
                      >
                        <option value="Needs Review">Needs Review</option>
                        <option value="Reviewing">Reviewing</option>
                        <option value="Mastered">Mastered</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => removeMistake(m.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 transition"
                        title="Delete from Mistake Notebook"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-pink-950 dark:text-pink-100 leading-relaxed">
                    {m.question.prompt}
                  </p>

                  {/* Answers Display */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3 dark:border-rose-900/40 dark:bg-rose-950/20">
                      <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300 block mb-1">
                        Your Selected Answer:
                      </span>
                      <div className="space-y-1">
                        {m.selectedAnswerIds.map((id) => (
                          <div key={id} className="text-rose-900 dark:text-rose-200">
                            [{id}] {m.question.options.find((o) => o.id === id)?.text}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                      <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block mb-1">
                        Verified Correct Answer:
                      </span>
                      <div className="space-y-1">
                        {m.question.correctAnswerIds.map((id) => (
                          <div key={id} className="text-emerald-900 dark:text-emerald-200">
                            [{id}] {m.question.options.find((o) => o.id === id)?.text}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-700 dark:text-pink-200/90 leading-relaxed bg-pink-50/50 p-3 rounded-xl border border-pink-200/80 dark:border-pink-900/50 dark:bg-[#1a0b1c] font-medium">
                    <strong className="text-pink-950 dark:text-pink-100 block mb-0.5">Why this is correct:</strong>
                    {m.question.explanation}
                  </div>

                  {/* User's Personal Reflection Note */}
                  <div className="flex items-center justify-between pt-2 border-t border-pink-100 dark:border-pink-900/60 text-xs">
                    <div className="text-slate-500 dark:text-pink-300/70 font-medium">
                      {m.userNote ? (
                        <span className="text-amber-800 dark:text-amber-300">
                          <strong>My Note:</strong> {m.userNote}
                        </span>
                      ) : (
                        <span className="italic">No reflection note added yet.</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenEditNote(m)}
                      className="flex items-center gap-1 text-pink-600 hover:text-pink-700 dark:text-pink-400 font-bold"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>{m.userNote ? 'Edit Note' : 'Add Note'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* EDIT NOTE MODAL */}
      {editingMistake && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-950/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-pink-200 bg-white p-5 shadow-2xl space-y-4 dark:border-pink-900/70 dark:bg-[#201022]">
            <h3 className="text-sm font-bold text-pink-950 dark:text-pink-100 flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-pink-500" /> Explain Why You Missed It
            </h3>

            <div>
              <p className="text-xs text-slate-600 dark:text-pink-200/80 mb-2 line-clamp-2 font-medium">
                {editingMistake.question.prompt}
              </p>
              <textarea
                rows={4}
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="e.g., I confused Table-level ACL with Field-level ACL precedence, or I didn't notice 'Choose two' in the question."
                className="w-full rounded-xl border border-pink-200 bg-pink-50/50 p-3 text-xs text-pink-950 focus:outline-none focus:border-pink-400 dark:border-pink-800 dark:bg-pink-950/40 dark:text-pink-100"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingMistake(null)}
                className="rounded-lg border border-pink-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-pink-50 dark:border-pink-800 dark:text-pink-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNote}
                className="rounded-lg bg-pink-500 px-4 py-1.5 text-xs font-bold text-white hover:bg-pink-600 shadow-xs active:scale-95"
              >
                Save Reflection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
