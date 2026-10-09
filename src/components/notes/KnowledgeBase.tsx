import React, { useState } from 'react';
import {
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Search,
  ExternalLink,
  Plus,
  Edit3,
  Trash2,
  Check,
  X,
  Sparkles,
  FileText,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { OFFICIAL_DOMAINS, OFFICIAL_DOC_LINKS } from '../../data/domains';
import { DomainId, StudyNote } from '../../types';
import { useStudyTip } from '../../hooks/useStudyTip';
import { StudyTipModal } from '../tips/StudyTipModal';

export const KnowledgeBase: React.FC = () => {
  const { notes, addNote, updateNote, toggleBookmarkNote, deleteNote } = useApp();
  const { tipData, isLoading, isModalOpen, getStudyTip, closeTipModal } = useStudyTip();

  const [selectedDomainId, setSelectedDomainId] = useState<DomainId | 'all'>('all');
  const [onlyBookmarks, setOnlyBookmarks] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Editing Note State
  const [editingNote, setEditingNote] = useState<StudyNote | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTopic, setNoteTopic] = useState('');
  const [noteDomainId, setNoteDomainId] = useState<DomainId>(5);

  // New Note Modal
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);

  const filteredNotes = notes.filter((n) => {
    if (selectedDomainId !== 'all' && n.domainId !== selectedDomainId) return false;
    if (onlyBookmarks && !n.isBookmarked) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = n.title.toLowerCase().includes(q);
      const matchContent = n.content.toLowerCase().includes(q);
      const matchTopic = n.topic.toLowerCase().includes(q);
      const matchTerms = (n.keyTerms || []).some(
        (t) => t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q)
      );
      if (!matchTitle && !matchContent && !matchTopic && !matchTerms) return false;
    }
    return true;
  });

  const handleOpenEdit = (n: StudyNote) => {
    setEditingNote(n);
    setNoteTitle(n.title);
    setNoteContent(n.content);
    setNoteTopic(n.topic);
    setNoteDomainId(n.domainId);
  };

  const handleSaveEdit = () => {
    if (!editingNote) return;
    updateNote(editingNote.id, {
      title: noteTitle,
      content: noteContent,
      topic: noteTopic,
      domainId: noteDomainId,
    });
    setEditingNote(null);
  };

  const handleCreateNewNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;

    addNote({
      domainId: noteDomainId,
      topic: noteTopic || 'General Study',
      title: noteTitle,
      content: noteContent,
      isBookmarked: false,
    });

    setShowNewNoteModal(false);
    setNoteTitle('');
    setNoteContent('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pink-200/80 dark:border-pink-900/60 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-pink-950 dark:text-pink-100 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-pink-500" />
            Knowledge Base & Official Exam Notes
          </h1>
          <p className="text-xs text-slate-500 dark:text-pink-300/70 mt-1 font-medium">
            Structured study notes, comparison matrices, and key terms organized by the 6 official blueprint domains.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setNoteTitle('');
              setNoteContent('');
              setNoteTopic('General Study');
              setShowNewNoteModal(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-pink-500 px-3.5 py-2 text-xs font-bold text-white hover:bg-pink-600 transition shadow-sm shadow-pink-300/40 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Add Study Note</span>
          </button>
        </div>
      </div>

      {/* Official External Resources Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <a
          href={OFFICIAL_DOC_LINKS.docs}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-2xl border border-pink-200 bg-white/95 p-3.5 text-xs text-slate-700 hover:border-pink-300 hover:bg-pink-50/50 shadow-sm shadow-pink-100/50 transition dark:border-pink-900/60 dark:bg-[#221224] dark:text-pink-200"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-pink-100 text-pink-600 dark:bg-pink-950/60 dark:text-pink-300">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <div className="font-bold text-pink-950 dark:text-pink-100">ServiceNow Docs</div>
              <div className="text-[11px] text-slate-500 dark:text-pink-300/70">docs.servicenow.com</div>
            </div>
          </div>
          <ExternalLink className="h-3.5 w-3.5 text-pink-400" />
        </a>

        <a
          href={OFFICIAL_DOC_LINKS.learning}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-2xl border border-pink-200 bg-white/95 p-3.5 text-xs text-slate-700 hover:border-pink-300 hover:bg-pink-50/50 shadow-sm shadow-pink-100/50 transition dark:border-pink-900/60 dark:bg-[#221224] dark:text-pink-200"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-300">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="font-bold text-pink-950 dark:text-pink-100">ServiceNow Learning</div>
              <div className="text-[11px] text-slate-500 dark:text-pink-300/70">Now Learning Courses</div>
            </div>
          </div>
          <ExternalLink className="h-3.5 w-3.5 text-pink-400" />
        </a>

        <a
          href={OFFICIAL_DOC_LINKS.certificationJourney}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-2xl border border-pink-200 bg-white/95 p-3.5 text-xs text-slate-700 hover:border-pink-300 hover:bg-pink-50/50 shadow-sm shadow-pink-100/50 transition dark:border-pink-900/60 dark:bg-[#221224] dark:text-pink-200"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <div className="font-bold text-pink-950 dark:text-pink-100">Certification Journey</div>
              <div className="text-[11px] text-slate-500 dark:text-pink-300/70">CSA Exam Guide</div>
            </div>
          </div>
          <ExternalLink className="h-3.5 w-3.5 text-pink-400" />
        </a>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-pink-200 bg-white/95 p-4 shadow-sm shadow-pink-100/50 dark:border-pink-900/60 dark:bg-[#221224]">
        <div className="flex flex-wrap items-center gap-2">
          {/* Domain Filter */}
          <select
            value={selectedDomainId}
            onChange={(e) => setSelectedDomainId(e.target.value === 'all' ? 'all' : (Number(e.target.value) as DomainId))}
            className="rounded-xl border border-pink-200 bg-pink-50/50 px-3 py-1.5 text-xs text-pink-950 font-medium dark:border-pink-800 dark:bg-pink-950/40 dark:text-pink-100"
          >
            <option value="all">All 6 Domains</option>
            {OFFICIAL_DOMAINS.map((d) => (
              <option key={d.id} value={d.id}>
                Domain {d.id}: {d.title.split(' ')[0]} ({d.weight}%)
              </option>
            ))}
          </select>

          {/* Bookmarks Toggle */}
          <button
            type="button"
            onClick={() => setOnlyBookmarks(!onlyBookmarks)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
              onlyBookmarks
                ? 'border-amber-400 bg-amber-50 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                : 'border-pink-200 bg-white text-slate-700 hover:bg-pink-50 dark:border-pink-800 dark:bg-[#201022] dark:text-pink-300'
            }`}
          >
            <Bookmark className="h-3.5 w-3.5 fill-current" />
            <span>Starred Notes</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-pink-400" />
          <input
            type="text"
            placeholder="Search notes, terms, tables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-pink-200 bg-pink-50/50 pl-8 pr-3 py-1.5 text-xs text-pink-950 placeholder-slate-400 focus:outline-none dark:border-pink-800 dark:bg-pink-950/40 dark:text-pink-100"
          />
        </div>
      </div>

      {/* Notes Stream */}
      <div className="space-y-6">
        {filteredNotes.length === 0 ? (
          <div className="rounded-2xl border border-pink-200 bg-white/95 p-12 text-center text-xs text-slate-500 dark:text-pink-300/70 font-medium">
            No notes found matching your search.
          </div>
        ) : (
          filteredNotes.map((note) => {
            const domain = OFFICIAL_DOMAINS.find((d) => d.id === note.domainId);
            return (
              <div
                key={note.id}
                className="rounded-2xl border border-pink-200 bg-white/95 p-6 space-y-4 shadow-sm shadow-pink-100/50 hover:border-pink-300 transition dark:border-pink-900/60 dark:bg-[#221224]"
              >
                {/* Note Header */}
                <div className="flex items-start justify-between gap-4 border-b border-pink-100 dark:border-pink-900/60 pb-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="rounded-lg bg-pink-100 px-2 py-0.5 text-[10px] font-mono font-bold text-pink-700 border border-pink-200 dark:bg-pink-950/60 dark:text-pink-300 dark:border-pink-800">
                        Domain {note.domainId} ({domain?.weight}%)
                      </span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-pink-200">
                        {note.topic}
                      </span>
                      {domain?.isHighPriority && (
                        <span className="rounded-lg bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50">
                          30% Focus
                        </span>
                      )}
                    </div>
                    <h2 className="text-base font-bold text-pink-950 dark:text-pink-100">{note.title}</h2>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => getStudyTip(note.domainId, domain?.title || 'ServiceNow Platform', note.topic)}
                      className="flex items-center gap-1 rounded-xl border border-pink-200 bg-pink-50 px-2.5 py-1 text-[11px] font-bold text-pink-700 hover:bg-pink-100 hover:text-pink-900 dark:border-pink-800 dark:bg-pink-950/50 dark:text-pink-300 transition"
                      title="Generate actionable study tip with Gemini"
                    >
                      <Sparkles className="h-3 w-3 text-pink-500" />
                      <span>Study Tip</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleBookmarkNote(note.id)}
                      className="p-1.5 text-slate-400 hover:text-amber-500 transition"
                      title={note.isBookmarked ? 'Remove bookmark' : 'Bookmark this note'}
                    >
                      <Bookmark
                        className={`h-4 w-4 ${note.isBookmarked ? 'text-amber-500 fill-amber-500' : ''}`}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(note)}
                      className="p-1.5 text-slate-400 hover:text-pink-600 transition"
                      title="Edit note"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteNote(note.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition"
                      title="Delete note"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Markdown-style Body */}
                <div className="text-xs sm:text-sm text-slate-700 dark:text-pink-100/90 leading-relaxed font-sans whitespace-pre-line space-y-2">
                  {note.content}
                </div>

                {/* Key Terms & Flashcard Definitions */}
                {note.keyTerms && note.keyTerms.length > 0 && (
                  <div className="pt-3 border-t border-pink-100 dark:border-pink-900/60 space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-pink-800/80 dark:text-pink-300/80">
                      Key Terms & Official Definitions:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {note.keyTerms.map((termItem, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-pink-200 bg-pink-50/50 p-2.5 text-xs space-y-1 dark:border-pink-900/60 dark:bg-[#1a0b1c]"
                        >
                          <span className="font-mono font-bold text-pink-600 dark:text-pink-400 block">
                            {termItem.term}
                          </span>
                          <p className="text-slate-600 dark:text-pink-200/80 text-[11px] leading-snug">
                            {termItem.definition}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* CREATE NEW NOTE MODAL */}
      {showNewNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-950/40 backdrop-blur-sm">
          <form
            onSubmit={handleCreateNewNote}
            className="w-full max-w-lg rounded-2xl border border-pink-200 bg-white p-6 shadow-2xl space-y-4 dark:border-pink-900/70 dark:bg-[#201022]"
          >
            <div className="flex items-center justify-between pb-3 border-b border-pink-100 dark:border-pink-900/60">
              <h3 className="text-base font-bold text-pink-950 dark:text-pink-100 flex items-center gap-2">
                <Plus className="h-4 w-4 text-pink-500" /> Create Custom Study Note
              </h3>
              <button
                type="button"
                onClick={() => setShowNewNoteModal(false)}
                className="text-pink-400 hover:text-pink-700 dark:hover:text-pink-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-pink-200 mb-1">
                Note Title *
              </label>
              <input
                type="text"
                required
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="e.g., Transform Map Field Mapping & Coalesce Rules"
                className="w-full rounded-xl border border-pink-200 bg-pink-50/50 px-3 py-2 text-xs text-pink-950 focus:outline-none focus:border-pink-400 dark:border-pink-800 dark:bg-pink-950/40 dark:text-pink-100 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-pink-200 mb-1">Domain</label>
                <select
                  value={noteDomainId}
                  onChange={(e) => setNoteDomainId(Number(e.target.value) as DomainId)}
                  className="w-full rounded-xl border border-pink-200 bg-pink-50/50 px-2 py-1.5 text-xs text-pink-950 font-medium dark:border-pink-800 dark:bg-pink-950/40 dark:text-pink-100"
                >
                  {OFFICIAL_DOMAINS.map((d) => (
                    <option key={d.id} value={d.id}>
                      D{d.id}: {d.title.split(' ')[0]} ({d.weight}%)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-pink-200 mb-1">Topic</label>
                <input
                  type="text"
                  value={noteTopic}
                  onChange={(e) => setNoteTopic(e.target.value)}
                  placeholder="e.g. Importing Data"
                  className="w-full rounded-xl border border-pink-200 bg-pink-50/50 px-3 py-1.5 text-xs text-pink-950 font-medium dark:border-pink-800 dark:bg-pink-950/40 dark:text-pink-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-pink-200 mb-1">
                Notes & Summary Content:
              </label>
              <textarea
                rows={6}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Type your structured notes, key bullet points, or cheat sheet comparisons..."
                className="w-full rounded-xl border border-pink-200 bg-pink-50/50 p-3 text-xs text-pink-950 leading-relaxed font-sans focus:outline-none focus:border-pink-400 dark:border-pink-800 dark:bg-pink-950/40 dark:text-pink-100"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-pink-100 dark:border-pink-900/60">
              <button
                type="button"
                onClick={() => setShowNewNoteModal(false)}
                className="rounded-lg border border-pink-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-pink-50 dark:border-pink-800 dark:text-pink-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-pink-500 px-4 py-1.5 text-xs font-bold text-white hover:bg-pink-600 shadow-xs active:scale-95"
              >
                Save Note
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT NOTE MODAL */}
      {editingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-950/40 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-pink-200 bg-white p-6 shadow-2xl space-y-4 dark:border-pink-900/70 dark:bg-[#201022]">
            <div className="flex items-center justify-between pb-3 border-b border-pink-100 dark:border-pink-900/60">
              <h3 className="text-base font-bold text-pink-950 dark:text-pink-100 flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-pink-500" /> Edit Study Note
              </h3>
              <button
                type="button"
                onClick={() => setEditingNote(null)}
                className="text-pink-400 hover:text-pink-700 dark:hover:text-pink-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-pink-200 mb-1">Title</label>
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="w-full rounded-xl border border-pink-200 bg-pink-50/50 px-3 py-2 text-xs text-pink-950 focus:outline-none dark:border-pink-800 dark:bg-pink-950/40 dark:text-pink-100 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-pink-200 mb-1">Content</label>
              <textarea
                rows={8}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="w-full rounded-xl border border-pink-200 bg-pink-50/50 p-3 text-xs text-pink-950 leading-relaxed font-sans focus:outline-none dark:border-pink-800 dark:bg-pink-950/40 dark:text-pink-100"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-pink-100 dark:border-pink-900/60">
              <button
                type="button"
                onClick={() => setEditingNote(null)}
                className="rounded-lg border border-pink-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-pink-50 dark:border-pink-800 dark:text-pink-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="rounded-lg bg-pink-500 px-4 py-1.5 text-xs font-bold text-white hover:bg-pink-600 shadow-xs active:scale-95"
              >
                Update Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gemini Study Tip Modal */}
      <StudyTipModal
        isOpen={isModalOpen}
        isLoading={isLoading}
        tipData={tipData}
        onClose={closeTipModal}
      />
    </div>
  );
};
