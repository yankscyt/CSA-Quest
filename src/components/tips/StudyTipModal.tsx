import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Copy,
  Check,
  BookOpen,
  AlertTriangle,
  Terminal,
  Lightbulb,
  Play,
  Loader2,
  BookmarkPlus,
  ShieldAlert,
} from 'lucide-react';
import { StudyTipData } from '../../data/curatedStudyTips';
import { useApp } from '../../context/AppContext';
import { DomainId } from '../../types';

interface StudyTipModalProps {
  isOpen: boolean;
  onClose: () => void;
  tipData: StudyTipData | null;
  isLoading: boolean;
  onStartSessionForTopic?: (domainId: DomainId, topic: string) => void;
}

export const StudyTipModal: React.FC<StudyTipModalProps> = ({
  isOpen,
  onClose,
  tipData,
  isLoading,
  onStartSessionForTopic,
}) => {
  const { addNote } = useApp();
  const [copied, setCopied] = useState(false);
  const [savedToNotes, setSavedToNotes] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!tipData) return;
    const text = `ServiceNow CSA Exam Tip: ${tipData.topic} (Domain ${tipData.domainId})
Summary: ${tipData.coreSummary}
Rules:
${tipData.highYieldRules.map((r) => `• ${r}`).join('\n')}
Exam Trap: ${tipData.examTrap}
Hands-on PDI Exercise: ${tipData.recommendedHandsOn}
${tipData.mnemonic ? `Mnemonic: ${tipData.mnemonic}` : ''}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToNotes = () => {
    if (!tipData) return;
    addNote({
      domainId: (tipData.domainId as DomainId) || 5,
      topic: tipData.topic,
      title: `Gemini Study Tip: ${tipData.topic}`,
      content: `### Core Exam Summary
${tipData.coreSummary}

### High-Yield Exam Rules:
${tipData.highYieldRules.map((r) => `* **${r}**`).join('\n')}

### Common Exam Trap:
> ⚠️ **Warning:** ${tipData.examTrap}

### Recommended 3-Minute PDI Practice:
\`\`\`
${tipData.recommendedHandsOn}
\`\`\`
${tipData.mnemonic ? `\n### Memory Rule of Thumb:\n💡 ${tipData.mnemonic}` : ''}`,
      isBookmarked: true,
    });
    setSavedToNotes(true);
    setTimeout(() => setSavedToNotes(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-950/40 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl border border-pink-200 bg-white p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 dark:border-pink-900/70 dark:bg-[#201022]">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-pink-100 dark:border-pink-900/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-100 text-pink-600 border border-pink-200 dark:bg-pink-950/60 dark:text-pink-300 dark:border-pink-800">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-pink-950 dark:text-pink-100">
                  Gemini CSA Study Tip
                </h3>
                <span className="rounded-full bg-pink-100 px-2.5 py-0.5 text-[10px] font-bold text-pink-700 border border-pink-200 dark:bg-pink-950/60 dark:text-pink-300 dark:border-pink-800">
                  AI COACH
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-pink-300/70 font-medium">
                Actionable advice for the January 2026 CSA exam blueprint
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-pink-400 hover:text-pink-700 dark:hover:text-pink-200 transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
            <Loader2 className="h-8 w-8 text-pink-500 animate-spin" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-pink-950 dark:text-pink-100">
                Generating Exam Study Tip...
              </h4>
              <p className="text-xs text-slate-500 dark:text-pink-300/70 max-w-xs font-medium">
                Synthesizing high-yield rules, common exam traps, and hands-on PDI exercises.
              </p>
            </div>
          </div>
        ) : tipData ? (
          <div className="space-y-4">
            {/* Topic & Domain Badge */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-pink-50/70 p-3 border border-pink-200 dark:bg-[#1a0b1c] dark:border-pink-900/60">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-pink-700 dark:text-pink-400">
                  Domain {tipData.domainId} • {tipData.domainTitle}
                </span>
                <div className="text-sm font-bold text-pink-950 dark:text-pink-100">{tipData.topic}</div>
              </div>

              {tipData.source && (
                <span className="rounded-lg bg-pink-100 px-2 py-0.5 text-[10px] font-mono text-pink-800 border border-pink-200 dark:bg-pink-950/60 dark:text-pink-300 dark:border-pink-800">
                  {tipData.source}
                </span>
              )}
            </div>

            {/* 1. Core Concept Summary */}
            <div className="rounded-xl border border-pink-200 bg-pink-50/50 p-3.5 space-y-1 dark:border-pink-900/60 dark:bg-[#1a0b1c]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-pink-700 dark:text-pink-400 flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-pink-500" /> Core Exam Concept
              </span>
              <p className="text-xs text-slate-700 dark:text-pink-100/90 leading-relaxed font-medium">
                {tipData.coreSummary}
              </p>
            </div>

            {/* 2. High-Yield Rules */}
            <div className="rounded-xl border border-pink-200 bg-white p-4 space-y-2 dark:border-pink-900/60 dark:bg-[#1e0e20]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-pink-950 dark:text-pink-200">
                High-Yield Blueprint Rules (Testable Facts):
              </span>
              <ul className="space-y-1.5">
                {tipData.highYieldRules.map((rule, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-xs text-slate-700 dark:text-pink-100/90 leading-relaxed font-medium"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-pink-500 mt-1.5 flex-shrink-0" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. Exam Trap / Distractor Alert */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 space-y-1 dark:border-amber-900/50 dark:bg-amber-950/20">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600" /> Common Exam Trap / Distractor
              </span>
              <p className="text-xs text-amber-950 dark:text-amber-200 leading-relaxed font-medium">
                {tipData.examTrap}
              </p>
            </div>

            {/* 4. Recommended 3-Minute PDI Hands-on */}
            <div className="rounded-xl border border-pink-200 bg-white p-3.5 space-y-1.5 dark:border-pink-900/60 dark:bg-[#1a0b1c]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-pink-700 dark:text-pink-300 flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-pink-500" /> 3-Minute PDI Hands-on Exercise
              </span>
              <p className="text-xs text-slate-700 dark:text-pink-100/90 leading-relaxed font-mono text-[11px] bg-pink-50/50 p-2.5 rounded-lg border border-pink-200/80 dark:border-pink-900/50 dark:bg-[#140816]">
                {tipData.recommendedHandsOn}
              </p>
            </div>

            {/* 5. Mnemonic (if present) */}
            {tipData.mnemonic && (
              <div className="rounded-xl border border-pink-200 bg-pink-50/60 p-3 flex items-start gap-2 dark:border-pink-900/60 dark:bg-pink-950/30">
                <Lightbulb className="h-4 w-4 text-pink-500 mt-0.5 flex-shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-pink-800 dark:text-pink-300">Memory Rule of Thumb: </span>
                  <span className="text-slate-700 dark:text-pink-200 font-medium">{tipData.mnemonic}</span>
                </div>
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-pink-100 dark:border-pink-900/60">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-xl border border-pink-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-pink-50 transition dark:border-pink-800 dark:bg-[#241326] dark:text-pink-200"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-pink-500" />
                      <span>Copy Advice</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleSaveToNotes}
                  className="flex items-center gap-1.5 rounded-xl border border-pink-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-pink-50 transition dark:border-pink-800 dark:bg-[#241326] dark:text-pink-200"
                >
                  {savedToNotes ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">Saved to Notes!</span>
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="h-3.5 w-3.5 text-pink-500" />
                      <span>Save to Notes</span>
                    </>
                  )}
                </button>
              </div>

              {onStartSessionForTopic && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onStartSessionForTopic(
                      (tipData.domainId as DomainId) || 5,
                      tipData.topic
                    );
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-pink-500 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-pink-600 transition shadow-xs active:scale-95"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Start Study Session</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500 dark:text-pink-300/70 py-6 text-center font-medium">
            No study tip data available.
          </p>
        )}
      </div>
    </div>
  );
};
