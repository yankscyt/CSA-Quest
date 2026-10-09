import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Dashboard } from './components/dashboard/Dashboard';
import { StudyPlanner } from './components/planner/StudyPlanner';
import { QuizEngine } from './components/quiz/QuizEngine';
import { MockExam } from './components/mock/MockExam';
import { MistakeNotebook } from './components/mistakes/MistakeNotebook';
import { KnowledgeBase } from './components/notes/KnowledgeBase';
import { StudyTimerView } from './components/tracker/StudyTimerView';
import { StudySessionModal } from './components/tracker/StudySessionModal';
import { DataSettingsModal } from './components/settings/DataSettingsModal';
import { DomainId } from './types';

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  const [quizInitialDomain, setQuizInitialDomain] = useState<DomainId | undefined>(undefined);

  const { startStudySession, theme } = useApp();
  const isDark = theme === 'pastel-noir';

  const handleStartSession = (domainId: DomainId, topic: string) => {
    startStudySession(domainId, topic);
    setIsTimerModalOpen(true);
  };

  const handleOpenQuickQuiz = () => {
    setQuizInitialDomain(undefined);
    setActiveTab('quiz');
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isDark
          ? 'bg-[#160b18] text-pink-50'
          : 'bg-[#fff0f5] text-slate-800'
      }`}
    >
      {/* Top Header */}
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenTimerModal={() => setIsTimerModalOpen(true)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Persistent Desktop Sidebar & Mobile Drawer */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <Dashboard
              onNavigate={setActiveTab}
              onStartSession={handleStartSession}
              onOpenQuickQuiz={handleOpenQuickQuiz}
            />
          )}

          {activeTab === 'planner' && (
            <StudyPlanner onStartSession={handleStartSession} />
          )}

          {activeTab === 'quiz' && (
            <QuizEngine initialDomainId={quizInitialDomain} />
          )}

          {activeTab === 'mock' && (
            <MockExam />
          )}

          {activeTab === 'mistakes' && (
            <MistakeNotebook />
          )}

          {activeTab === 'notes' && (
            <KnowledgeBase />
          )}

          {activeTab === 'timer' && (
            <StudyTimerView />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <StudySessionModal
        isOpen={isTimerModalOpen}
        onClose={() => setIsTimerModalOpen(false)}
      />

      <DataSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
