/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  BookOpen, Clock, AlertTriangle, Play, HelpCircle, Flame, Trophy, 
  ArrowRight, Sparkles, FolderOpen, Heart, Landmark, Plus, Search, ChevronRight
} from "lucide-react";
import { 
  ChapterJson, PyqAttempt, CardSchedule, AppNote, SubjectFolder 
} from "../types";

interface HomeDashboardProps {
  chapters: ChapterJson[];
  notes: AppNote[];
  pyqAttempts: PyqAttempt[];
  cardSchedules: CardSchedule[];
  onOpenChapter: (id: string) => void;
  onNavigateToTab: (tabId: 'read' | 'revision' | 'test' | 'notes') => void;
  onTriggerImport: () => void;
  customFolders: SubjectFolder[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onTriggerGlobalSearch: () => void;
}

export default function HomeDashboard({
  chapters,
  notes,
  pyqAttempts,
  cardSchedules,
  onOpenChapter,
  onNavigateToTab,
  onTriggerImport,
  customFolders,
  searchQuery,
  setSearchQuery,
  onTriggerGlobalSearch
}: HomeDashboardProps) {
  
  // Calculate analytics for UPSC scholars
  const totalChapters = chapters.length;
  const recentChapters = chapters.slice(-3).reverse();
  
  // Completed sections
  const completedSectionCount = chapters.reduce((total, ch) => {
    const keys = localStorage.getItem(`readProgress_${ch.metadata.id}`);
    if (keys) {
      try {
        const parsed = JSON.parse(keys);
        return total + Object.values(parsed).filter(Boolean).length;
      } catch (e) {}
    }
    return total;
  }, 0);

  const dueCardsCount = cardSchedules.filter(c => c.status === 'fragile' || c.status === 'forgotten').length;
  const pyqAccuracy = pyqAttempts.length 
    ? Math.round((pyqAttempts.filter(a => a.isCorrect).length / pyqAttempts.length) * 1050) / 10.5
    : 0;

  const unresolvedDoubtsCount = notes.filter(n => n.isDoubt && !n.isResolved).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-6 pb-20">
      
      {/* Top Welcome Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-lg border border-[#3A506B]/30 relative overflow-hidden">
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-1.5 text-[#E0A96D] text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles size={14} /> Active UPSC Scholar Syllabus Space
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">
            Greetings, Aspirant
          </h2>
          <p className="text-xs text-slate-400 max-w-md">
            Your material offline container is locked and isolated on this applet. Complete syllabus reading, card Leitners, and keep revisions aligned.
          </p>
        </div>

        <div className="flex gap-2 shrink-0 z-10">
          <button 
            id="dash-import-btn"
            onClick={onTriggerImport}
            className="px-4 py-2 bg-gradient-to-r from-[#D97706] to-[#E0A96D] hover:from-[#B45309] hover:to-[#D97706] text-slate-950 font-bold rounded text-xs uppercase tracking-wide transition shadow"
          >
            Import Syllabus JSON
          </button>
        </div>

        <div className="absolute top-0 right-0 w-44 h-44 bg-[#E0A96D]/5 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Global Search form */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3.5 text-slate-400" size={16} />
          <input
            id="dash-search-input"
            type="text"
            placeholder="Search across imported chapter text, notes, PYQs, and card decks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-slate-900 border border-slate-800 p-3.5 pl-10 rounded text-white focus:outline-none focus:border-[#E0A96D]/65"
          />
        </div>
        <button
          id="dash-search-btn"
          onClick={onTriggerGlobalSearch}
          className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-bold font-serif"
        >
          Query General Search
        </button>
      </div>

      {/* Grid values blocks */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800/80 space-y-1.5 text-center">
          <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">Chapters Imported</span>
          <p className="text-2xl font-serif font-black text-white">{totalChapters}</p>
          <div className="text-[10px] text-[#E0A96D] font-mono">1 Default Polity</div>
        </div>

        <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800/80 space-y-1.5 text-center">
          <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">Subsections Read</span>
          <p className="text-2xl font-serif font-black text-emerald-400">{completedSectionCount}</p>
          <div className="text-[10px] text-slate-400 font-mono">Completed items</div>
        </div>

        <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800/80 space-y-1.5 text-center">
          <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">Revision Due</span>
          <p className="text-2xl font-serif font-black text-amber-500">{dueCardsCount} Cards</p>
          <div className="text-[10px] text-[#E0A96D] font-mono">Leitner System</div>
        </div>

        <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800/80 space-y-1.5 text-center">
          <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">UPSC PYQ Accuracy</span>
          <p className="text-2xl font-serif font-black text-[#E0A96D]">{pyqAccuracy}%</p>
          <div className="text-[10px] text-slate-500 font-mono">{pyqAttempts.length} Total Exercises</div>
        </div>

      </div>

      {/* Continue reading + Revision Focus double row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Continue reading card description */}
        <div className="p-5 rounded-lg bg-slate-900/40 border border-slate-850 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5">
              <Clock size={12} /> Continue My Active Syllabus Module
            </span>
            {chapters.length > 0 ? (
              <div className="space-y-1">
                <p className="font-serif text-xs uppercase tracking-widest text-[#E0A96D] font-bold">
                  {chapters[0].metadata.book} - {chapters[0].metadata.subject}
                </p>
                <h4 className="text-lg font-serif font-bold text-white tracking-tight">
                  Ch {chapters[0].metadata.chapterNumber}. {chapters[0].metadata.chapterTitle}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Start reading the Election system of the President of India. Complete original sections with formula definitions.
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">No syllabus chapters loaded. Import a JSON file to get started.</p>
            )}
          </div>

          {chapters.length > 0 && (
            <button
              id="dash-continue-btn"
              onClick={() => onOpenChapter(chapters[0].metadata.id)}
              className="mt-2 py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded text-xs font-bold transition flex items-center justify-between"
            >
              <span>Resume Reading Section</span>
              <Play size={10} className="fill-white" />
            </button>
          )}
        </div>

        {/* Today's revision summary */}
        <div className="p-5 rounded-lg bg-[#E0A96D]/5 border border-[#E0A96D]/20 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-wider text-[#E0A96D] font-mono flex items-center gap-1.5 font-bold">
              <Trophy size={12} /> Spaced Revision Alignment
            </span>
            <div className="space-y-1">
              <h4 className="text-base font-serif font-bold text-white tracking-tight">
                Daily Leitner Revision Queue
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                You have <strong className="text-white font-bold">{dueCardsCount} fragile cards</strong> scheduled due today. Clear your weak areas before starting newer syllabus domains.
              </p>
              {unresolvedDoubtsCount > 0 && (
                <p className="text-xs text-amber-400 flex items-center gap-1 mt-1 font-mono">
                  <AlertTriangle size={12} /> {unresolvedDoubtsCount} unresolved doubts pending in Doubt Bank.
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('revision' as any)}
            className="py-2 px-4 bg-[#E0A96D] hover:bg-[#D97706] text-slate-950 rounded text-xs font-black uppercase tracking-wider transition flex items-center justify-between"
          >
            <span>Trigger Leitner Cards Review</span>
            <ArrowRight size={12} />
          </button>
        </div>

      </div>

      {/* Recently Study area */}
      <div className="space-y-3">
        <h4 className="text-xs text-slate-500 uppercase font-mono tracking-wider">Recently Studied Chapters</h4>
        {recentChapters.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No chapters recorded. Import files to grow your personal study base.</p>
        ) : (
          <div className="space-y-2.5">
            {recentChapters.map((ch) => (
              <div 
                key={ch.metadata.id}
                onClick={() => onOpenChapter(ch.metadata.id)}
                className="p-3.5 rounded bg-slate-900/30 border border-slate-800/80 hover:bg-slate-900/60 transition cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[#E0A96D]/10 border border-[#E0A96D]/25 flex items-center justify-center text-[#E0A96D]">
                    <BookOpen size={16} />
                  </div>
                  <div>
                    <h5 className="text-xs font-serif font-bold text-white leading-tight">
                      {ch.metadata.chapterTitle}
                    </h5>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {ch.metadata.book} • MAPPED Folder: {ch.metadata.subject}
                    </p>
                  </div>
                </div>

                <ChevronRight size={14} className="text-slate-500" />
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
