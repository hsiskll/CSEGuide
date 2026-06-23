/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Swords, RotateCcw, AlertTriangle, Play, HelpCircle, Flame, 
  ChevronRight, Calendar, BookmarkCheck, Bookmark, CheckCircle, Clock
} from "lucide-react";
import { LessonSlide, Flashcard, CardSchedule } from "../types";

interface CardRevisionProps {
  cardSchedules: CardSchedule[];
  allFlashcards: Flashcard[];
  onScheduleCard: (cardId: string, status: CardSchedule['status']) => void;
  onNavigateToReader: (chapterId: string) => void;
}

export default function CardRevision({
  cardSchedules,
  allFlashcards,
  onScheduleCard,
  onNavigateToReader
}: CardRevisionProps) {
  const [filterMode, setFilterMode] = useState<'due' | 'misconceptions' | 'strong' | 'all'>('due');
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // Link schedules to static lists
  const renderedList = cardSchedules.map(sched => {
    const card = allFlashcards.find(f => f.id === sched.cardId) || EXTRA_FALLBACK_REVISIONS.find(f => f.id === sched.cardId);
    return card ? { ...card, schedule: sched } : null;
  }).filter(Boolean) as Array<Flashcard & { schedule: CardSchedule }>;

  // Filter based on selected modes
  const filteredRevisions = renderedList.filter(item => {
    if (filterMode === 'due') {
      return item.schedule.status === 'fragile' || item.schedule.status === 'forgotten' || item.schedule.status === 'new';
    }
    if (filterMode === 'misconceptions') {
      return item.schedule.status === 'misconception';
    }
    if (filterMode === 'strong') {
      return item.schedule.status === 'strong' || item.schedule.status === 'stable';
    }
    return true;
  });

  const currentItem = filteredRevisions[activeIdx];

  const handleUpdateStatus = (status: CardSchedule['status']) => {
    if (!currentItem) return;
    onScheduleCard(currentItem.id, status);
    setIsFlipped(false);
    
    if (activeIdx < filteredRevisions.length - 1) {
      setActiveIdx(prev => prev + 1);
    } else {
      setActiveIdx(0);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 md:p-6 pb-20">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-3 gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
            <Swords size={20} className="text-[#E0A96D]" /> Spaced Leitner Revision Queue
          </h2>
          <p className="text-xs text-slate-400">Leitner spaced intervals maximize retention for syllabus concepts.</p>
        </div>

        {/* Filter controls tab list */}
        <div className="flex p-0.5 rounded-lg border border-slate-800 bg-slate-950 font-mono text-[10px]">
          {[
            { id: 'due', label: 'Due Today' },
            { id: 'misconceptions', label: '🔥 Misconceptions' },
            { id: 'strong', label: 'Locked/Strong' },
            { id: 'all', label: 'All Cards' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setFilterMode(tab.id as any);
                setActiveIdx(0);
                setIsFlipped(false);
              }}
              className={`p-1.5 px-3 rounded cursor-pointer transition ${filterMode === tab.id ? 'bg-[#E0A96D] text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Review module or zero state */}
      {filteredRevisions.length === 0 ? (
        <div className="text-center p-12 bg-slate-900/10 border border-slate-850 rounded-lg max-w-md mx-auto space-y-4">
          <CheckCircle size={44} className="mx-auto text-emerald-400" />
          <h3 className="font-serif text-lg font-bold text-white">Inbox Clean</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            All cards in this segment are locked at stable retention states! Great focus. Continue reading newer subsections to trigger flash card schedules.
          </p>
        </div>
      ) : (
        <div className="max-w-md mx-auto flex flex-col items-center space-y-6">
          <div className="w-full flex items-center justify-between text-xs font-mono text-slate-400 px-1">
            <span className="flex items-center gap-1.5">
              <Calendar size={13} /> Status: <strong className="text-[#E0A96D] capitalize">{currentItem?.schedule.status}</strong>
            </span>
            <span>Card {activeIdx + 1} of {filteredRevisions.length}</span>
          </div>

          {/* FLIP CARD CONTAINER */}
          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className={`w-full min-h-[250px] p-6 rounded-lg border cursor-pointer flex flex-col justify-between transition-all duration-300 relative ${
              isFlipped 
                ? 'bg-slate-900 border-[#E0A96D]/60 shadow-[#E0A96D]/5' 
                : 'bg-slate-900/40 border-slate-800'
            }`}
          >
            <div className="text-right text-[9px] uppercase tracking-wider text-slate-500 font-mono">
              {isFlipped ? "Back: UPSC Key Explanation" : "Front: Syllabus Prompt"}
            </div>

            <div className="my-auto py-4 text-center">
              <p className="text-base md:text-lg font-serif font-semibold text-slate-100 leading-relaxed px-4 whitespace-pre-wrap">
                {isFlipped ? currentItem?.back : currentItem?.front}
              </p>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
              <span>Chapter ID: {currentItem?.schedule.chapterId}</span>
              <span>Click to reveal details</span>
            </div>
          </div>

          {/* Quick Leitner Controls */}
          <div className="w-full grid grid-cols-3 gap-2">
            <button
              onClick={() => handleUpdateStatus('forgotten')}
              className="py-2 bg-rose-950/40 text-rose-400 border border-rose-900/40 hover:bg-rose-950/60 rounded text-center font-bold text-xs"
              title="Return urgently within 5 mins"
            >
              Forgot
            </button>
            <button
              onClick={() => handleUpdateStatus('stable')}
              className="py-2 bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-750 rounded text-center text-xs"
              title="Return within 2 days"
            >
              Vague/Fragile
            </button>
            <button
              onClick={() => handleUpdateStatus('strong')}
              className="py-2 bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 hover:bg-emerald-950/60 rounded text-center font-bold text-xs"
              title="Archive till 10 days"
            >
              Remembered
            </button>
          </div>

          {/* Jump back into specific reading segment link */}
          <button
            onClick={() => onNavigateToReader(currentItem.schedule.chapterId)}
            className="text-xs text-[#E0A96D] hover:underline flex items-center gap-1 font-mono pt-2"
          >
            Open associated Chapter text <ChevronRight size={12} />
          </button>
        </div>
      )}

    </div>
  );
}

const EXTRA_FALLBACK_REVISIONS = [
  {
    id: "fc-pres-001",
    front: "Which Article sets the executive power of the Union in the President of India?",
    back: "Article 53 of the Constitution. It states it can be exercised directly or through subordinate officers.",
    category: "article"
  },
  {
    id: "fc-pres-002",
    front: "What is the key difference of Nominated MPs in Presidential Election vs Impeachment?",
    back: "Nominated MPs CANNOT vote in the election of the President, but they CAN vote in the impeachment process.",
    category: "trap"
  }
];
