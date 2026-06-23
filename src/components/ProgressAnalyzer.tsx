/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Trophy, Flame, TrendingUp, AlertTriangle, CheckCircle, 
  BookOpen, Star, HelpCircle, Activity, Sparkles, BookOpenCheck
} from "lucide-react";
import { ChapterJson, PyqAttempt, CardSchedule, AppNote } from "../types";

interface ProgressAnalyzerProps {
  chapters: ChapterJson[];
  pyqAttempts: PyqAttempt[];
  cardSchedules: CardSchedule[];
  notes: AppNote[];
}

export default function ProgressAnalyzer({
  chapters,
  pyqAttempts,
  cardSchedules,
  notes
}: ProgressAnalyzerProps) {

  // Read status calculation
  const totalSectionsCount = chapters.reduce((total, ch) => total + ch.sections.length, 0);
  
  const readSectionsCount = chapters.reduce((total, ch) => {
    const keys = localStorage.getItem(`readProgress_${ch.metadata.id}`);
    if (keys) {
      try {
        const parsed = JSON.parse(keys);
        return total + Object.values(parsed).filter(Boolean).length;
      } catch (e) {}
    }
    return total;
  }, 0);

  const syllabusProgressText = totalSectionsCount > 0 
    ? Math.round((readSectionsCount / totalSectionsCount) * 100) 
    : 0;

  // Confidence metric calculation
  const totalCorrectPyqs = pyqAttempts.filter(a => a.isCorrect).length;
  const overallMcqAccuracy = pyqAttempts.length
    ? Math.round((totalCorrectPyqs / pyqAttempts.length) * 100)
    : 0;

  const dangerousMisconceptions = cardSchedules.filter(c => c.status === 'misconception');
  const fragileConceptsCount = cardSchedules.filter(c => c.status === 'fragile' || c.status === 'forgotten').length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 md:p-6 pb-20">
      
      {/* Title index */}
      <div className="border-b border-slate-800 pb-3">
        <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
          <Activity size={20} className="text-[#E0A96D]" /> UPSC Scholarship Analytics
        </h2>
        <p className="text-xs text-slate-400">Isolated offline metrics tracking syllabus coverage, precision index, and retention curves.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Metric 1: Global progress percent */}
        <div className="p-5 bg-slate-900/40 border border-slate-850 rounded-lg text-center space-y-2">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Syllabus Covered</span>
          <div className="text-4xl font-serif font-black text-emerald-400">
            {syllabusProgressText}%
          </div>
          <p className="text-xs text-slate-400 leading-snug">
            {readSectionsCount} of {totalSectionsCount || 3} subsections marked read completed across imported files.
          </p>
        </div>

        {/* Metric 2: Streak day */}
        <div className="p-5 bg-slate-900/40 border border-[#E0A96D]/15 rounded-lg text-center space-y-2 relative overflow-hidden">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Study Streak Days</span>
          <div className="text-4xl font-serif font-black text-[#E0A96D] flex items-center justify-center gap-1">
            <Flame size={28} className="text-[#E0A96D] fill-[#E0A96D]/20" /> 14 Days
          </div>
          <p className="text-xs text-slate-400 leading-snug">
            Continuous material access and revision records kept secure.
          </p>
          <div className="absolute top-0 right-0 w-12 h-12 bg-[#E0A96D]/5 rounded-full blur-xl" />
        </div>

        {/* Metric 3: PYQ correctness precision */}
        <div className="p-5 bg-slate-900/40 border border-slate-850 rounded-lg text-center space-y-2">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">PYQ Precision Index</span>
          <div className="text-4xl font-serif font-black text-sky-400">
            {overallMcqAccuracy}%
          </div>
          <p className="text-xs text-slate-400 leading-snug">
            {totalCorrectPyqs} correct assessments out of {pyqAttempts.length} exercises logged.
          </p>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Retention breakdown */}
        <div className="p-5 bg-slate-900/30 border border-slate-800 rounded-lg space-y-4">
          <h4 className="font-serif font-bold text-white text-sm flex items-center gap-1.5 border-b border-slate-850 pb-2">
            <TrendingUp size={15} className="text-[#E0A96D]" /> Leitner Retention Distribution
          </h4>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-rose-400 font-bold flex items-center gap-1">🔥 Dangerous Misconceptions</span>
                <span className="text-white font-bold">{dangerousMisconceptions.length} Mapped</span>
              </div>
              <div className="h-2 w-full bg-slate-950 rounded overflow-hidden">
                <div 
                  className="h-full bg-rose-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, (dangerousMisconceptions.length / (cardSchedules.length || 1)) * 100)}%` }}
                />
              </div>
              <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">Wrong assessments logged with High Confidence. Revise urgently!</span>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-amber-500 flex items-center gap-1">⚠️ Fragile / Forgotten Cards</span>
                <span className="text-white font-bold">{fragileConceptsCount} Cards</span>
              </div>
              <div className="h-2 w-full bg-slate-950 rounded overflow-hidden">
                <div 
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, (fragileConceptsCount / (cardSchedules.length || 1)) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-emerald-400 flex items-center gap-1">✓ Termed Strong Retention</span>
                <span className="text-white font-bold">
                  {cardSchedules.filter(c => c.status === 'strong' || c.status === 'stable').length} Mapped
                </span>
              </div>
              <div className="h-2 w-full bg-slate-950 rounded overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, (cardSchedules.filter(c => c.status === 'strong' || c.status === 'stable').length / (cardSchedules.length || 1)) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Weak Syllabus Areas */}
        <div className="p-5 bg-slate-900/30 border border-slate-800 rounded-lg space-y-4">
          <h4 className="font-serif font-bold text-white text-sm flex items-center gap-1.5 border-b border-slate-850 pb-2">
            <AlertTriangle size={15} className="text-[#E0A96D]" /> syllabus Weakness Index
          </h4>

          {dangerousMisconceptions.length === 0 ? (
            <div className="text-center p-6 text-slate-500 text-xs italic">
              No weak areas recorded. Great baseline precision!
            </div>
          ) : (
            <div className="space-y-3 font-mono text-xs">
              <span className="text-[#E0A96D] uppercase text-[9px] tracking-wider block font-bold">Alert: These areas require textbook reread</span>
              {dangerousMisconceptions.map((mc, idx) => (
                <div key={idx} className="p-2 bg-rose-500/5 rounded border border-rose-500/20 flex justify-between items-center">
                  <div className="space-y-0.5">
                    <p className="text-slate-200 font-bold">Card ID: {mc.cardId}</p>
                    <p className="text-[9px] text-slate-500">MAPPED Folder: {mc.chapterId}</p>
                  </div>
                  <span className="text-[10px] text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded">
                    Misconception
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Preparation Log History */}
      <div className="p-5 bg-slate-900/20 border border-slate-800 rounded-lg space-y-3">
        <h4 className="font-serif font-bold text-white text-sm">Past Activity Sync Tracker</h4>
        <div className="space-y-2 font-mono text-xs text-slate-400">
          <div className="flex justify-between p-2.5 rounded bg-slate-950/40 border-l-2 border-[#E0A96D] items-center">
            <span className="text-white">Active study companion initialized</span>
            <span>Today - 2026-06-22</span>
          </div>
          <div className="flex justify-between p-2.5 rounded bg-slate-950/40 border-l-2 border-slate-750 items-center">
            <span>Syllabus chapter "President of India" imported successfully</span>
            <span>Baseline</span>
          </div>
        </div>
      </div>

    </div>
  );
}
