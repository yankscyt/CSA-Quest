import React, { useState } from 'react';
import {
  Settings,
  Download,
  Upload,
  RotateCcw,
  AlertTriangle,
  X,
  CheckCircle2,
  Calendar,
  Sliders,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface DataSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataSettingsModal: React.FC<DataSettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    exportDataJSON,
    importDataJSON,
    resetAllData,
    targetReadinessScore,
    setTargetReadinessScore,
    currentDate,
    setSimulatedDate,
    resetToToday,
  } = useApp();

  const [importStatus, setImportStatus] = useState<string>('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [targetSlider, setTargetSlider] = useState<number>(targetReadinessScore);

  if (!isOpen) return null;

  // Handle Export
  const handleExport = () => {
    const jsonString = exportDataJSON();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `csa-quest-backup-${currentDate}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle Import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = importDataJSON(content);
        if (result.success) {
          setImportStatus('Progress imported successfully!');
        } else {
          setImportStatus(`Import error: ${result.error || 'Failed to parse file'}`);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleSaveTarget = () => {
    setTargetReadinessScore(targetSlider);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-950/40 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-pink-200 bg-white p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto dark:border-pink-900/70 dark:bg-[#201022]">
        <div className="flex items-center justify-between pb-3 border-b border-pink-100 dark:border-pink-900/60">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-pink-500" />
            <h2 className="text-base font-bold text-pink-950 dark:text-pink-100">Application Settings & Data</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-pink-400 hover:text-pink-700 dark:hover:text-pink-200 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 1. Readiness Target Slider */}
        <div className="rounded-xl border border-pink-200 bg-pink-50/50 p-4 space-y-3 dark:border-pink-900/60 dark:bg-[#1a0b1c]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-pink-500" />
              <span className="text-xs font-bold text-pink-950 dark:text-pink-100">Personal Readiness Target</span>
            </div>
            <span className="font-mono text-xs font-extrabold text-pink-600 dark:text-pink-400">
              {targetSlider}%
            </span>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-pink-200/80 leading-relaxed font-medium">
            Note: The official CSA exam cut score is not publicly fixed at 70%. Configure your personal readiness goal (default 85%) for mock exams and domain mastery indicators.
          </p>

          <input
            type="range"
            min={65}
            max={95}
            step={5}
            value={targetSlider}
            onChange={(e) => {
              const val = Number(e.target.value);
              setTargetSlider(val);
              setTargetReadinessScore(val);
            }}
            className="w-full accent-pink-500"
          />

          <div className="flex justify-between text-[10px] text-slate-500 dark:text-pink-300/70 font-mono">
            <span>65% (Basic)</span>
            <span>85% (Recommended)</span>
            <span>95% (Mastery)</span>
          </div>
        </div>

        {/* 2. Backup & Restore (JSON) */}
        <div className="rounded-xl border border-pink-200 bg-pink-50/50 p-4 space-y-3 dark:border-pink-900/60 dark:bg-[#1a0b1c]">
          <div className="text-xs font-bold text-pink-950 dark:text-pink-100">Data Backup & Migration</div>
          <p className="text-[11px] text-slate-600 dark:text-pink-200/80 leading-relaxed font-medium">
            All your tasks, sessions, mistakes, and quiz scores are stored in your browser's persistent storage. You can export a portable JSON backup anytime.
          </p>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleExport}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-pink-500 px-3 py-2 text-xs font-bold text-white hover:bg-pink-600 transition shadow-xs active:scale-95"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export JSON Backup</span>
            </button>

            <label className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-pink-200 bg-white px-3 py-2 text-xs font-bold text-pink-700 hover:bg-pink-50 cursor-pointer transition dark:border-pink-800 dark:bg-[#241326] dark:text-pink-200">
              <Upload className="h-3.5 w-3.5 text-pink-500" />
              <span>Import JSON File</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {importStatus && (
            <div className="text-[11px] text-pink-700 bg-pink-100 p-2 rounded-lg border border-pink-200 dark:bg-pink-950/60 dark:text-pink-300 dark:border-pink-800 font-semibold">
              {importStatus}
            </div>
          )}
        </div>

        {/* 3. Reset All Progress */}
        <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 space-y-3 dark:border-rose-900/40 dark:bg-rose-950/20">
          <div className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 text-rose-600" /> Reset Study Progress
          </div>
          <p className="text-[11px] text-slate-600 dark:text-pink-200/80 leading-relaxed font-medium">
            Resets all task completion states, logged study sessions, mistake records, and quiz attempts back to original prepopulated schedule.
          </p>

          {!showResetConfirm ? (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="rounded-xl border border-rose-300 bg-white px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50 transition dark:border-rose-800 dark:bg-[#201022] dark:text-rose-300"
            >
              Reset Data...
            </button>
          ) : (
            <div className="space-y-2 pt-2 border-t border-rose-200 dark:border-rose-900/50">
              <p className="text-xs text-rose-900 dark:text-rose-200 font-semibold">
                Are you sure? This cannot be undone unless you exported a JSON backup.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="rounded-lg border border-pink-200 px-3 py-1 text-xs text-slate-700 hover:bg-pink-50 dark:border-pink-800 dark:text-pink-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetAllData();
                    setShowResetConfirm(false);
                    onClose();
                  }}
                  className="rounded-lg bg-rose-600 px-3.5 py-1 text-xs font-bold text-white hover:bg-rose-500 shadow-xs"
                >
                  Yes, Reset Everything
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-pink-500 px-5 py-2 text-xs font-bold text-white hover:bg-pink-600 transition shadow-xs active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
