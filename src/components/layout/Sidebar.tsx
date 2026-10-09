import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  HelpCircle,
  FileCheck2,
  BookOpen,
  Timer,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { OFFICIAL_DOMAINS } from '../../data/domains';

export type NavTab = 'dashboard' | 'planner' | 'quiz' | 'mock' | 'mistakes' | 'notes' | 'timer';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const {
    mistakes,
    domainMastery,
    overallMasteryPercentage,
    targetReadinessScore,
    todayTasks,
    isWeekend,
  } = useApp();

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string | number; badgeColor?: string }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      id: 'planner',
      label: 'Study Planner',
      icon: <CalendarDays className="h-4 w-4" />,
      badge: isWeekend ? 'Rest' : todayTasks.filter((t) => !t.completed).length || undefined,
      badgeColor: isWeekend ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300' : 'bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-950/80 dark:text-pink-300',
    },
    {
      id: 'quiz',
      label: 'Practice Quizzes',
      icon: <HelpCircle className="h-4 w-4" />,
    },
    {
      id: 'mock',
      label: '60Q Mock Exam',
      icon: <FileCheck2 className="h-4 w-4" />,
      badge: '90m',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300',
    },
    {
      id: 'mistakes',
      label: 'Mistake Notebook',
      icon: <AlertTriangle className="h-4 w-4" />,
      badge: mistakes.length > 0 ? mistakes.length : undefined,
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300',
    },
    {
      id: 'notes',
      label: 'Knowledge Base',
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      id: 'timer',
      label: 'Study Timer',
      icon: <Timer className="h-4 w-4" />,
    },
  ];

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  const content = (
    <div className="flex h-full flex-col justify-between overflow-y-auto bg-[#fff8fa] dark:bg-[#1a0c1c] p-4">
      <div>
        {/* Navigation Section */}
        <div className="mb-6">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-pink-800/70 dark:text-pink-300/70 mb-2">
            Navigation
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                    isActive
                      ? 'bg-pink-100 text-pink-700 border border-pink-300 shadow-xs dark:bg-pink-950/70 dark:text-pink-300 dark:border-pink-800'
                      : 'text-slate-700 hover:bg-pink-100/60 hover:text-pink-900 dark:text-pink-200/80 dark:hover:bg-pink-950/50 dark:hover:text-pink-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-pink-600 dark:text-pink-400' : 'text-pink-500/70 group-hover:text-pink-700 dark:text-pink-400/70'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${item.badgeColor || 'bg-pink-50 text-pink-700 border-pink-200'}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Official CSA Blueprint Overview */}
        <div className="mb-6 rounded-2xl border border-pink-200 bg-white/90 p-3.5 shadow-xs dark:border-pink-900/60 dark:bg-[#221224]">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-pink-950 dark:text-pink-100">
              Exam Blueprint Weights
            </span>
            <span className="text-[10px] font-mono text-pink-600 font-bold dark:text-pink-400">Jan 2026</span>
          </div>

          <div className="space-y-2">
            {domainMastery.map((dm) => (
              <div key={dm.domainId} className="group cursor-pointer" onClick={() => handleNavClick('quiz')}>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="truncate max-w-[130px] text-slate-700 dark:text-pink-200 font-medium flex items-center gap-1">
                    {dm.isHighPriority && (
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" title="High Priority (30%)" />
                    )}
                    D{dm.domainId}: {dm.title.split(' ')[0]}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`font-mono text-[10px] font-bold ${dm.isHighPriority ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-pink-300'}`}>
                      {dm.weight}%
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-pink-400/80">
                      ({dm.masteryPercentage}%)
                    </span>
                  </div>
                </div>

                {/* Micro progress bar */}
                <div className="h-1.5 w-full rounded-full bg-pink-100 dark:bg-pink-950/80 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${dm.masteryPercentage}%`,
                      backgroundColor: dm.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-2.5 border-t border-pink-100 dark:border-pink-900/60 flex items-center justify-between text-[11px]">
            <span className="text-slate-600 dark:text-pink-300/80 font-medium">Readiness:</span>
            <span className={`font-mono font-bold ${overallMasteryPercentage >= targetReadinessScore ? 'text-emerald-600 dark:text-emerald-400' : 'text-pink-600 dark:text-pink-400'}`}>
              {overallMasteryPercentage}% / {targetReadinessScore}% Target
            </span>
          </div>
        </div>
      </div>

      {/* Footer Info & Official Documentation Links */}
      <div className="space-y-1.5 pt-2 border-t border-pink-100 dark:border-pink-900/60">
        <a
          href="https://docs.servicenow.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-pink-800/80 hover:bg-pink-100 hover:text-pink-950 dark:text-pink-300/80 dark:hover:bg-pink-950/60 transition"
        >
          <span>ServiceNow Docs</span>
          <ExternalLink className="h-3 w-3 text-pink-400" />
        </a>
        <a
          href="https://learning.servicenow.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-pink-800/80 hover:bg-pink-100 hover:text-pink-950 dark:text-pink-300/80 dark:hover:bg-pink-950/60 transition"
        >
          <span>ServiceNow Learning</span>
          <ExternalLink className="h-3 w-3 text-pink-400" />
        </a>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-pink-200/80 lg:block bg-[#fff8fa] dark:border-pink-900/60 dark:bg-[#1a0c1c]">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-pink-950/40 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-full border-r border-pink-200 bg-[#fff8fa] dark:border-pink-900/70 dark:bg-[#1a0c1c] shadow-2xl z-10">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
