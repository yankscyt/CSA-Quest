import React from 'react';
import { X, Clock } from 'lucide-react';
import { StudySessionTimer } from './StudySessionTimer';
import { StudySession } from '../../types';

interface StudySessionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudySessionModal: React.FC<StudySessionModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleSessionLogged = (_sess: StudySession) => {
    // Session is saved and metrics update automatically in AppContext
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-950/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-pink-200 bg-white p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 dark:border-pink-900/70 dark:bg-[#201022]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-pink-100 dark:border-pink-900/60">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-pink-500" />
            <h2 className="text-base font-bold text-pink-950 dark:text-pink-100">Study Session Timer</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-pink-400 hover:text-pink-700 dark:hover:text-pink-200 transition"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Unified Study Session Timer with Start, Pause, Resume, End, and Domain Association */}
        <StudySessionTimer onSessionLogged={handleSessionLogged} />
      </div>
    </div>
  );
};
