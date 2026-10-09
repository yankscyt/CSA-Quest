import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Circle,
  Play,
  RotateCcw,
  Edit3,
  CalendarCheck2,
  Coffee,
  Plus,
  X,
  FileText,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useApp, checkIsWeekend, parseDateString, formatDateString } from '../../context/AppContext';
import { DomainId, StudyTask, TopicStatus } from '../../types';
import { OFFICIAL_DOMAINS } from '../../data/domains';
import { useStudyTip } from '../../hooks/useStudyTip';
import { StudyTipModal } from '../tips/StudyTipModal';

interface StudyPlannerProps {
  onStartSession: (domainId: DomainId, topic: string) => void;
}

export const StudyPlanner: React.FC<StudyPlannerProps> = ({ onStartSession }) => {
  const {
    tasks,
    currentDate,
    toggleTaskComplete,
    updateTaskStatus,
    updateTaskNotes,
    rescheduleTask,
    addNewTask,
    setSimulatedDate,
  } = useApp();

  const { tipData, isLoading, isModalOpen, getStudyTip, closeTipModal } = useStudyTip();

  // Active filter tab: All Weeks, Week 1, Week 2, Week 3
  const [activeWeek, setActiveWeek] = useState<number | 'all'>('all');

  // Reschedule Modal State
  const [reschedulingTask, setReschedulingTask] = useState<StudyTask | null>(null);
  const [rescheduleTargetDate, setRescheduleTargetDate] = useState<string>('');
  const [rescheduleError, setRescheduleError] = useState<string>('');

  // Personal Notes Drawer Modal State
  const [editingNotesTask, setEditingNotesTask] = useState<StudyTask | null>(null);
  const [notesDraft, setNotesDraft] = useState<string>('');

  // Add Custom Task Modal State
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDomainId, setNewTaskDomainId] = useState<DomainId>(1);
  const [newTaskTopic, setNewTaskTopic] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('2026-10-14');
  const [newTaskDuration, setNewTaskDuration] = useState(75);
  const [addTaskError, setAddTaskError] = useState('');

  // All distinct calendar dates from Oct 10 through Oct 30, 2026
  const calendarDays = [
    // Weekend 0
    { date: '2026-10-10', label: 'Saturday, Oct 10', week: 0, isWeekend: true },
    { date: '2026-10-11', label: 'Sunday, Oct 11', week: 0, isWeekend: true },
    // Week 1
    { date: '2026-10-12', label: 'Monday, Oct 12', week: 1, isWeekend: false },
    { date: '2026-10-13', label: 'Tuesday, Oct 13', week: 1, isWeekend: false },
    { date: '2026-10-14', label: 'Wednesday, Oct 14', week: 1, isWeekend: false },
    { date: '2026-10-15', label: 'Thursday, Oct 15', week: 1, isWeekend: false },
    { date: '2026-10-16', label: 'Friday, Oct 16', week: 1, isWeekend: false },
    // Weekend 1
    { date: '2026-10-17', label: 'Saturday, Oct 17', week: 1, isWeekend: true },
    { date: '2026-10-18', label: 'Sunday, Oct 18', week: 1, isWeekend: true },
    // Week 2
    { date: '2026-10-19', label: 'Monday, Oct 19', week: 2, isWeekend: false },
    { date: '2026-10-20', label: 'Tuesday, Oct 20', week: 2, isWeekend: false },
    { date: '2026-10-21', label: 'Wednesday, Oct 21', week: 2, isWeekend: false },
    { date: '2026-10-22', label: 'Thursday, Oct 22', week: 2, isWeekend: false },
    { date: '2026-10-23', label: 'Friday, Oct 23', week: 2, isWeekend: false },
    // Weekend 2
    { date: '2026-10-24', label: 'Saturday, Oct 24', week: 2, isWeekend: true },
    { date: '2026-10-25', label: 'Sunday, Oct 25', week: 2, isWeekend: true },
    // Week 3
    { date: '2026-10-26', label: 'Monday, Oct 26', week: 3, isWeekend: false },
    { date: '2026-10-27', label: 'Tuesday, Oct 27', week: 3, isWeekend: false },
    { date: '2026-10-28', label: 'Wednesday, Oct 28', week: 3, isWeekend: false },
    { date: '2026-10-29', label: 'Thursday, Oct 29', week: 3, isWeekend: false },
    { date: '2026-10-30', label: 'Friday, Oct 30 (EXAM DAY)', week: 3, isWeekend: false, isExamDay: true },
  ];

  // Filter calendar days by week
  const filteredDays = calendarDays.filter((day) => {
    if (activeWeek === 'all') return true;
    if (day.week === 0 && activeWeek === 1) return true; // show rest days before week 1
    return day.week === activeWeek;
  });

  // Handle open reschedule modal
  const handleOpenReschedule = (task: StudyTask) => {
    setReschedulingTask(task);
    setRescheduleTargetDate(task.date);
    setRescheduleError('');
  };

  // Submit reschedule
  const handleConfirmReschedule = () => {
    if (!reschedulingTask) return;
    if (!rescheduleTargetDate) {
      setRescheduleError('Please choose a target date.');
      return;
    }
    if (checkIsWeekend(rescheduleTargetDate)) {
      setRescheduleError('Weekends are protected rest days! Please choose a Monday–Friday weekday.');
      return;
    }
    rescheduleTask(reschedulingTask.id, rescheduleTargetDate);
    setReschedulingTask(null);
  };

  // Open Notes Modal
  const handleOpenNotes = (task: StudyTask) => {
    setEditingNotesTask(task);
    setNotesDraft(task.personalNotes || '');
  };

  const handleSaveNotes = () => {
    if (!editingNotesTask) return;
    updateTaskNotes(editingNotesTask.id, notesDraft);
    setEditingNotesTask(null);
  };

  // Add Task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      setAddTaskError('Title is required.');
      return;
    }
    if (checkIsWeekend(newTaskDate)) {
      setAddTaskError('Cannot schedule tasks on weekend rest days.');
      return;
    }

    const domain = OFFICIAL_DOMAINS.find((d) => d.id === newTaskDomainId);
    addNewTask({
      date: newTaskDate,
      title: newTaskTitle,
      description: newTaskDescription,
      domainId: newTaskDomainId,
      topic: newTaskTopic || domain?.topics[0] || 'General Review',
      estimatedMinutes: newTaskDuration,
      topicStatus: 'Not Started',
      weekNumber: newTaskDate <= '2026-10-18' ? 1 : newTaskDate <= '2026-10-25' ? 2 : 3,
    });

    setShowAddTaskModal(false);
    setNewTaskTitle('');
    setNewTaskDescription('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pink-200/80 dark:border-pink-900/60 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-pink-950 dark:text-pink-100 flex items-center gap-2">
            <CalendarCheck2 className="h-6 w-6 text-pink-500" />
            Study Planner & Blueprint Calendar
          </h1>
          <p className="text-xs text-slate-500 dark:text-pink-300/70 mt-1 font-medium">
            Official 3-week study roadmap starting October 12, 2026. Target: 60–90 min/weekday.
            Weekends strictly protected.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Week Filter Pills */}
          <div className="flex items-center rounded-xl border border-pink-200 bg-white p-1 text-xs font-semibold shadow-xs dark:border-pink-900/60 dark:bg-[#201022]">
            <button
              type="button"
              onClick={() => setActiveWeek('all')}
              className={`rounded-lg px-3 py-1 transition ${
                activeWeek === 'all' ? 'bg-pink-500 text-white shadow-xs' : 'text-slate-600 hover:text-pink-700 dark:text-pink-300'
              }`}
            >
              All Weeks
            </button>
            <button
              type="button"
              onClick={() => setActiveWeek(1)}
              className={`rounded-lg px-3 py-1 transition ${
                activeWeek === 1 ? 'bg-pink-500 text-white shadow-xs' : 'text-slate-600 hover:text-pink-700 dark:text-pink-300'
              }`}
            >
              Week 1
            </button>
            <button
              type="button"
              onClick={() => setActiveWeek(2)}
              className={`rounded-lg px-3 py-1 transition ${
                activeWeek === 2 ? 'bg-pink-500 text-white shadow-xs' : 'text-slate-600 hover:text-pink-700 dark:text-pink-300'
              }`}
            >
              Week 2
            </button>
            <button
              type="button"
              onClick={() => setActiveWeek(3)}
              className={`rounded-lg px-3 py-1 transition ${
                activeWeek === 3 ? 'bg-pink-500 text-white shadow-xs' : 'text-slate-600 hover:text-pink-700 dark:text-pink-300'
              }`}
            >
              Week 3
            </button>
          </div>

          {/* Add Custom Task Button */}
          <button
            type="button"
            onClick={() => setShowAddTaskModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-pink-100 px-3.5 py-1.5 text-xs font-bold text-pink-700 border border-pink-200 hover:bg-pink-500 hover:text-white transition shadow-xs dark:bg-pink-950/60 dark:text-pink-300 dark:border-pink-800"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Task</span>
          </button>
        </div>
      </div>

      {/* Week overview alerts / banners */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-pink-200 bg-pink-50/70 p-3.5 dark:border-pink-900/50 dark:bg-pink-950/20">
          <div className="text-xs font-bold text-pink-900 dark:text-pink-300">WEEK 1: FOUNDATION</div>
          <div className="text-[11px] text-pink-700/80 dark:text-pink-400 mt-1 font-semibold">Oct 12 – Oct 16</div>
          <p className="text-xs text-slate-600 dark:text-pink-200/80 mt-1.5 font-medium leading-relaxed">
            Platform Overview, Instance Configuration, and heavy focus on Data Schema & ACLs (Domain 5).
          </p>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-3.5 dark:border-rose-900/50 dark:bg-rose-950/20">
          <div className="text-xs font-bold text-rose-900 dark:text-rose-300">WEEK 2: CORE FUNCTIONALITY</div>
          <div className="text-[11px] text-rose-700/80 dark:text-rose-400 mt-1 font-semibold">Oct 19 – Oct 23</div>
          <p className="text-xs text-slate-600 dark:text-pink-200/80 mt-1.5 font-medium leading-relaxed">
            Lists, Forms, VTBs, Knowledge Bases, Service Catalog, Workflow Studio & CMDB/CSDM.
          </p>
        </div>

        <div className="rounded-2xl border border-pink-300 bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100/60 p-3.5 dark:border-pink-800 dark:bg-[#2b142c]">
          <div className="text-xs font-bold text-pink-900 dark:text-pink-200">WEEK 3: SCRIPTING, MOCK & EXAM</div>
          <div className="text-[11px] text-pink-700/80 dark:text-pink-400 mt-1 font-semibold">Oct 26 – Oct 30</div>
          <p className="text-xs text-slate-600 dark:text-pink-200/80 mt-1.5 font-medium leading-relaxed">
            UI Policies, Business Rules, Update Sets, Full 60Q Timed Simulation, and Exam Day Oct 30!
          </p>
        </div>
      </div>

      {/* Calendar Stream */}
      <div className="space-y-4">
        {filteredDays.map((dayInfo) => {
          const isToday = dayInfo.date === currentDate;
          const dayTasks = tasks.filter((t) => t.date === dayInfo.date);

          if (dayInfo.isWeekend) {
            return (
              <div
                key={dayInfo.date}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border p-4 transition ${
                  isToday
                    ? 'border-pink-300 bg-pink-50/80 shadow-md ring-2 ring-pink-300/40 dark:border-pink-800 dark:bg-pink-950/30'
                    : 'border-pink-200/70 bg-gradient-to-br from-pink-50/50 to-rose-50/40 dark:border-pink-900/40 dark:bg-pink-950/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-pink-500 border border-pink-200 shadow-xs dark:bg-[#1a0b1c] dark:border-pink-800">
                    <Coffee className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-pink-950 dark:text-pink-100">{dayInfo.label}</span>
                      <span className="rounded-full bg-pink-100 px-2.5 py-0.5 text-[10px] font-bold text-pink-700 border border-pink-200 dark:bg-pink-950/60 dark:text-pink-300">
                        PROTECTED REST DAY
                      </span>
                      {isToday && (
                        <span className="rounded-full bg-pink-500 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                          Today
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-pink-300/70 mt-0.5 font-medium">
                      No study tasks assigned. Mental recovery protects retention.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSimulatedDate(dayInfo.date)}
                  className="self-end sm:self-center text-xs font-semibold text-pink-600 hover:text-pink-700 dark:text-pink-400 transition"
                >
                  Set as active date
                </button>
              </div>
            );
          }

          if (dayInfo.isExamDay) {
            return (
              <div
                key={dayInfo.date}
                className={`rounded-2xl border p-5 ${
                  isToday
                    ? 'border-rose-400 bg-rose-50 shadow-md ring-2 ring-rose-400/40 dark:border-rose-800 dark:bg-rose-950/30'
                    : 'border-rose-200 bg-rose-50/70 dark:border-rose-900/60 dark:bg-rose-950/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-rose-600 border border-rose-200 dark:bg-[#1f0f21] dark:border-rose-800">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold text-rose-950 dark:text-rose-100">
                          Friday, October 30, 2026 — OFFICIAL EXAM DAY
                        </span>
                        {isToday && (
                          <span className="rounded-full bg-rose-600 px-2.5 py-0.5 text-[10px] font-extrabold text-white uppercase tracking-wider">
                            TODAY
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-rose-800/80 dark:text-rose-200/80 mt-0.5 font-medium">
                        60 questions • 90 minutes • No regular study tasks assigned.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          // Weekday Schedule Block
          return (
            <div
              key={dayInfo.date}
              className={`rounded-2xl border transition ${
                isToday
                  ? 'border-pink-300 bg-white ring-2 ring-pink-300/40 shadow-sm shadow-pink-100/50 dark:border-pink-700 dark:bg-[#241326]'
                  : 'border-pink-200/80 bg-white/95 dark:border-pink-900/60 dark:bg-[#221224]'
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between border-b border-pink-100 dark:border-pink-900/60 px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-bold text-pink-950 dark:text-pink-100">{dayInfo.label}</span>
                  {isToday && (
                    <span className="rounded-full bg-pink-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                      Today
                    </span>
                  )}
                  <span className="text-xs text-slate-500 dark:text-pink-300/70 font-medium">
                    ({dayTasks.filter((t) => t.completed).length}/{dayTasks.length} completed)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSimulatedDate(dayInfo.date)}
                    className="text-[11px] font-semibold text-pink-600 hover:text-pink-700 dark:text-pink-400 transition"
                  >
                    Set as active date
                  </button>
                </div>
              </div>

              {/* Tasks List */}
              <div className="p-3.5 space-y-3">
                {dayTasks.length === 0 ? (
                  <div className="py-2 text-center text-xs text-slate-500 italic">
                    No tasks assigned for this day.{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setNewTaskDate(dayInfo.date);
                        setShowAddTaskModal(true);
                      }}
                      className="text-pink-600 font-bold underline ml-1"
                    >
                      Add a task
                    </button>
                  </div>
                ) : (
                  dayTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-xl border p-3 transition ${
                        task.completed
                          ? 'border-pink-200/40 bg-pink-50/25'
                          : 'border-pink-200/70 bg-pink-50/30 hover:border-pink-300 dark:border-pink-900/50 dark:bg-[#28152a]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => toggleTaskComplete(task.id)}
                          className="mt-0.5 flex-shrink-0 text-pink-400 hover:text-pink-600 transition"
                        >
                          {task.completed ? (
                            <CheckCircle2 className="h-5 w-5 text-pink-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-pink-300 hover:text-pink-500" />
                          )}
                        </button>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-sm font-semibold ${
                                task.completed ? 'line-through text-slate-400 dark:text-pink-400/50' : 'text-pink-950 dark:text-pink-100'
                              }`}
                            >
                              {task.title}
                            </span>
                            {task.domainId && (
                              <span className="rounded-full bg-pink-100 px-2 py-0.5 text-[10px] font-bold text-pink-700 border border-pink-200 dark:bg-pink-950/60 dark:text-pink-300">
                                D{task.domainId} ({task.domainId === 5 ? '30% Priority' : `${OFFICIAL_DOMAINS.find(d => d.id === task.domainId)?.weight}%`})
                              </span>
                            )}
                            <span className="text-[11px] text-slate-500 dark:text-pink-300/70 font-medium">
                              • est. {task.estimatedMinutes}m
                            </span>
                            {task.actualMinutes > 0 && (
                              <span className="text-[11px] text-pink-600 dark:text-pink-400 font-mono font-bold">
                                ({task.actualMinutes}m logged)
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-pink-200/80">{task.description}</p>
                          {task.personalNotes && (
                            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-pink-900 dark:text-pink-200 bg-pink-100/70 px-2 py-0.5 rounded-lg border border-pink-200 dark:bg-pink-950/40">
                              <FileText className="h-3 w-3 text-pink-500" />
                              <span className="truncate max-w-lg">{task.personalNotes}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
                        {/* Status selector */}
                        <select
                          value={task.topicStatus}
                          onChange={(e) => updateTaskStatus(task.id, e.target.value as TopicStatus)}
                          className="rounded-lg border border-pink-200 bg-white px-2 py-1 text-xs text-pink-950 font-semibold focus:border-pink-400 dark:border-pink-800 dark:bg-[#1f0f21] dark:text-pink-200"
                        >
                          <option value="Not Started">Not Started</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Needs Review">Needs Review</option>
                          <option value="Mastered">Mastered</option>
                        </select>

                        {/* Notes button */}
                        <button
                          type="button"
                          onClick={() => handleOpenNotes(task)}
                          className="rounded-lg border border-pink-200 bg-white p-1.5 text-pink-700 hover:bg-pink-50 transition dark:border-pink-800 dark:bg-[#201022] dark:text-pink-300"
                          title="Edit Personal Notes"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>

                        {/* Reschedule button */}
                        <button
                          type="button"
                          onClick={() => handleOpenReschedule(task)}
                          className="rounded-lg border border-pink-200 bg-white p-1.5 text-pink-700 hover:bg-pink-50 transition dark:border-pink-800 dark:bg-[#201022] dark:text-pink-300"
                          title="Reschedule to another weekday"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>

                        {/* Study Tip button */}
                        <button
                          type="button"
                          onClick={() => {
                            const domTitle = OFFICIAL_DOMAINS.find((d) => d.id === task.domainId)?.title || 'ServiceNow Platform';
                            getStudyTip(task.domainId || 1, domTitle, task.topic);
                          }}
                          className="flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
                          title="Get Gemini AI study tip for this topic"
                        >
                          <Sparkles className="h-3 w-3 text-rose-500" />
                          <span>Tip</span>
                        </button>

                        {/* Study button */}
                        <button
                          type="button"
                          onClick={() => onStartSession(task.domainId || 1, task.topic)}
                          className="flex items-center gap-1 rounded-xl bg-pink-500 px-3 py-1 text-xs font-semibold text-white shadow-xs hover:bg-pink-600 transition"
                        >
                          <Play className="h-3 w-3 fill-current" />
                          <span>Study</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* RESCHEDULE MODAL */}
      {reschedulingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-950/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-pink-200 bg-white p-5 shadow-2xl dark:border-pink-900/70 dark:bg-[#221224]">
            <div className="flex items-center justify-between pb-3 border-b border-pink-100 dark:border-pink-900/60">
              <h3 className="text-base font-bold text-pink-950 dark:text-pink-100 flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-pink-500" /> Reschedule Study Task
              </h3>
              <button
                type="button"
                onClick={() => setReschedulingTask(null)}
                className="text-pink-400 hover:text-pink-700 dark:hover:text-pink-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div>
                <span className="text-xs text-slate-500 dark:text-pink-300/70 font-medium">Task:</span>
                <p className="text-sm font-bold text-pink-950 dark:text-pink-100">{reschedulingTask.title}</p>
                <p className="text-xs text-pink-600 dark:text-pink-400 font-medium">Currently: {reschedulingTask.date}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-pink-950 dark:text-pink-100 mb-1">
                  New Target Date (Weekdays Only):
                </label>
                <input
                  type="date"
                  min="2026-10-12"
                  max="2026-10-29"
                  value={rescheduleTargetDate}
                  onChange={(e) => {
                    setRescheduleTargetDate(e.target.value);
                    setRescheduleError('');
                  }}
                  className="w-full rounded-xl border border-pink-200 bg-pink-50/50 px-3 py-2 text-sm text-pink-950 font-semibold focus:outline-none focus:border-pink-400 dark:border-pink-800 dark:bg-[#1a0b1c] dark:text-pink-100"
                />
                <p className="text-[11px] text-slate-500 dark:text-pink-300/70 mt-1 font-medium">
                  Weekends (Saturdays & Sundays) are protected rest days.
                </p>
              </div>

              {rescheduleError && (
                <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200 font-semibold">
                  <AlertCircle className="h-4 w-4 text-rose-500" />
                  <span>{rescheduleError}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-pink-100 dark:border-pink-900/60">
              <button
                type="button"
                onClick={() => setReschedulingTask(null)}
                className="rounded-xl border border-pink-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-pink-50 transition dark:border-pink-800 dark:text-pink-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReschedule}
                className="rounded-xl bg-pink-500 px-4 py-1.5 text-xs font-bold text-white hover:bg-pink-600 transition shadow-sm shadow-pink-300/40"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PERSONAL NOTES MODAL */}
      {editingNotesTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-950/40 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-pink-200 bg-white p-5 shadow-2xl dark:border-pink-900/70 dark:bg-[#221224]">
            <div className="flex items-center justify-between pb-3 border-b border-pink-100 dark:border-pink-900/60">
              <h3 className="text-base font-bold text-pink-950 dark:text-pink-100 flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-pink-500" /> Personal Task Notes & Takeaways
              </h3>
              <button
                type="button"
                onClick={() => setEditingNotesTask(null)}
                className="text-pink-400 hover:text-pink-700 dark:hover:text-pink-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div>
                <p className="text-sm font-bold text-pink-950 dark:text-pink-100">{editingNotesTask.title}</p>
                <p className="text-xs text-pink-700/80 dark:text-pink-300/80 font-medium">
                  Topic: {editingNotesTask.topic} • Domain {editingNotesTask.domainId}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-pink-950 dark:text-pink-100 mb-1">
                  Your Notes & Key Takeaways:
                </label>
                <textarea
                  rows={5}
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  placeholder="Record key definitions, tips to remember, tricky edge cases, or exam reminders..."
                  className="w-full rounded-xl border border-pink-200 bg-pink-50/40 p-3 text-xs text-pink-950 placeholder-slate-400 focus:outline-none focus:border-pink-400 font-sans leading-relaxed dark:border-pink-800 dark:bg-[#1a0b1c] dark:text-pink-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-pink-100 dark:border-pink-900/60">
              <button
                type="button"
                onClick={() => setEditingNotesTask(null)}
                className="rounded-xl border border-pink-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-pink-50 transition dark:border-pink-800 dark:text-pink-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNotes}
                className="rounded-xl bg-pink-500 px-4 py-1.5 text-xs font-bold text-white hover:bg-pink-600 transition shadow-sm shadow-pink-300/40"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD CUSTOM TASK MODAL */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-950/40 backdrop-blur-sm">
          <form
            onSubmit={handleCreateTask}
            className="w-full max-w-md rounded-2xl border border-pink-200 bg-white p-5 shadow-2xl space-y-4 dark:border-pink-900/70 dark:bg-[#221224]"
          >
            <div className="flex items-center justify-between pb-3 border-b border-pink-100 dark:border-pink-900/60">
              <h3 className="text-base font-bold text-pink-950 dark:text-pink-100 flex items-center gap-2">
                <Plus className="h-4 w-4 text-pink-500" /> Add Custom Study Task
              </h3>
              <button
                type="button"
                onClick={() => setShowAddTaskModal(false)}
                className="text-pink-400 hover:text-pink-700 dark:hover:text-pink-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-pink-950 dark:text-pink-100 mb-1">Task Title *</label>
              <input
                type="text"
                required
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="e.g., Practice ACL wildcards in PDI"
                className="w-full rounded-xl border border-pink-200 bg-pink-50/40 px-3 py-2 text-xs text-pink-950 placeholder-slate-400 focus:outline-none focus:border-pink-400 dark:border-pink-800 dark:bg-[#1a0b1c] dark:text-pink-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-pink-950 dark:text-pink-100 mb-1">Description</label>
              <textarea
                rows={2}
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Details of what you will cover..."
                className="w-full rounded-xl border border-pink-200 bg-pink-50/40 p-2.5 text-xs text-pink-950 placeholder-slate-400 focus:outline-none focus:border-pink-400 dark:border-pink-800 dark:bg-[#1a0b1c] dark:text-pink-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-pink-950 dark:text-pink-100 mb-1">Official Domain</label>
                <select
                  value={newTaskDomainId}
                  onChange={(e) => setNewTaskDomainId(Number(e.target.value) as DomainId)}
                  className="w-full rounded-xl border border-pink-200 bg-pink-50/40 px-2 py-1.5 text-xs text-pink-950 font-semibold focus:outline-none focus:border-pink-400 dark:border-pink-800 dark:bg-[#1a0b1c] dark:text-pink-100"
                >
                  {OFFICIAL_DOMAINS.map((d) => (
                    <option key={d.id} value={d.id}>
                      D{d.id}: {d.title.split(' ')[0]} ({d.weight}%)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-pink-950 dark:text-pink-100 mb-1">Duration (mins)</label>
                <input
                  type="number"
                  min={15}
                  max={180}
                  step={5}
                  value={newTaskDuration}
                  onChange={(e) => setNewTaskDuration(Number(e.target.value))}
                  className="w-full rounded-xl border border-pink-200 bg-pink-50/40 px-3 py-1.5 text-xs text-pink-950 font-bold focus:outline-none focus:border-pink-400 dark:border-pink-800 dark:bg-[#1a0b1c] dark:text-pink-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-pink-950 dark:text-pink-100 mb-1">
                Date (Weekdays Only) *
              </label>
              <input
                type="date"
                required
                min="2026-10-12"
                max="2026-10-29"
                value={newTaskDate}
                onChange={(e) => {
                  setNewTaskDate(e.target.value);
                  setAddTaskError('');
                }}
                className="w-full rounded-xl border border-pink-200 bg-pink-50/40 px-3 py-1.5 text-xs text-pink-950 font-bold focus:outline-none focus:border-pink-400 dark:border-pink-800 dark:bg-[#1a0b1c] dark:text-pink-100"
              />
            </div>

            {addTaskError && (
              <div className="text-xs text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200 font-semibold">
                {addTaskError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-pink-100 dark:border-pink-900/60">
              <button
                type="button"
                onClick={() => setShowAddTaskModal(false)}
                className="rounded-xl border border-pink-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-pink-50 transition dark:border-pink-800 dark:text-pink-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-pink-500 px-4 py-1.5 text-xs font-bold text-white hover:bg-pink-600 transition shadow-sm shadow-pink-300/40"
              >
                Add Task
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
