/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  FolderOpen, Plus, FolderHeart, Trash2, Edit2, BookOpen, 
  ChevronRight, AlertCircle, Sparkles, Folder, Archive
} from "lucide-react";
import { ChapterJson, SubjectFolder } from "../types";
import { UPSC_DEFAULT_FOLDERS } from "../data";

interface LibraryFoldersProps {
  chapters: ChapterJson[];
  folders: SubjectFolder[];
  onAddCustomFolder: (name: string) => void;
  onDeleteCustomFolder: (id: string) => void;
  onRenameCustomFolder: (id: string, newName: string) => void;
  onOpenChapter: (id: string) => void;
  onMoveChapterFolder: (chapterId: string, targetSubject: string) => void;
}

export default function LibraryFolders({
  chapters,
  folders,
  onAddCustomFolder,
  onDeleteCustomFolder,
  onRenameCustomFolder,
  onOpenChapter,
  onMoveChapterFolder
}: LibraryFoldersProps) {
  const [newFolderName, setNewFolderName] = useState<string>("");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>("");

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    onAddCustomFolder(newFolderName.trim());
    setNewFolderName("");
    setIsAdding(false);
  };

  const startEditing = (folder: SubjectFolder) => {
    setEditingFolderId(folder.id);
    setEditingName(folder.name);
  };

  const saveEditingName = () => {
    if (!editingName.trim() || !editingFolderId) return;
    onRenameCustomFolder(editingFolderId, editingName.trim());
    setEditingFolderId(null);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-6 pb-20">
      
      {/* Header index */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
            <Archive size={20} className="text-[#E0A96D]" /> UPSC Structured Library
          </h2>
          <p className="text-xs text-slate-400">Chapters are auto-sorted into these default and custom syllabus folders.</p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-3.5 py-1.5 rounded bg-slate-800 text-slate-200 hover:bg-slate-700 font-bold text-xs flex items-center gap-1.5 transition"
        >
          <Plus size={14} /> Custom Folder
        </button>
      </div>

      {/* Creation form */}
      {isAdding && (
        <div className="p-4 bg-slate-900 border border-[#3A506B]/30 rounded space-y-3">
          <label className="text-xs text-slate-300 font-medium">New Custom Folder Title</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="E.g., Economy Optional Main, Essay Sketched Mockups"
              className="flex-1 text-xs bg-slate-950 p-2 border border-slate-800 rounded text-slate-100 placeholder-slate-500 focus:outline-none"
            />
            <button
              onClick={handleCreateFolder}
              className="px-4 py-2 bg-[#E0A96D] hover:bg-[#D97706] text-slate-950 rounded font-bold text-xs"
            >
              Add Folder
            </button>
          </div>
        </div>
      )}

      {/* Grid selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {folders.map((folder) => {
          // Find chapters belonging to this folder's subject
          const folderChapters = chapters.filter(ch => {
            const subj = ch.metadata.subject?.toLowerCase();
            const fName = folder.name.toLowerCase();
            return subj?.includes(fName) || fName?.includes(subj);
          });

          const isSelected = selectedFolderId === folder.id;

          return (
            <div 
              key={folder.id}
              className={`p-4 rounded border transition duration-150 ${
                isSelected 
                  ? 'bg-slate-900/60 border-[#E0A96D]/45 shadow-sm' 
                  : 'bg-slate-900/20 border-slate-800/80 hover:bg-slate-900/40'
              }`}
            >
              {/* Folder Header */}
              <div className="flex items-start justify-between gap-2">
                <div 
                  onClick={() => setSelectedFolderId(isSelected ? null : folder.id)}
                  className="flex items-start gap-2.5 cursor-pointer flex-1"
                >
                  <div className="p-2 ml-[-4px] rounded bg-slate-950/40 text-[#E0A96D] max-h-[38px] shrink-0">
                    {folder.isDefault ? <Folder size={18} /> : <FolderHeart size={18} />}
                  </div>

                  <div className="space-y-0.5">
                    {editingFolderId === folder.id ? (
                      <div className="flex gap-1 items-center">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="text-xs bg-slate-950 px-1.5 py-0.5 text-white border border-slate-700 rounded"
                        />
                        <button onClick={saveEditingName} className="text-[10px] text-emerald-400 font-bold px-1 rounded bg-slate-800">Done</button>
                      </div>
                    ) : (
                      <h4 className="text-xs font-semibold text-white tracking-tight flex items-center gap-1">
                        {folder.name}
                      </h4>
                    )}
                    <span className="text-[10px] text-slate-500 font-mono block">
                      {folderChapters.length} Source Chapters loaded
                    </span>
                  </div>
                </div>

                {/* Exclude standard folder deletions */}
                {!folder.isDefault && (
                  <div className="flex gap-1 shrink-0">
                    <button 
                      onClick={() => startEditing(folder)}
                      className="p-1 rounded text-slate-500 hover:text-[#E0A96D] transition"
                    >
                      <Edit2 size={11} />
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm(`Confirm deleting custom category: "${folder.name}"? Active chapters inside will preserve on directory list.`)) {
                          onDeleteCustomFolder(folder.id);
                        }
                      }}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                )}
              </div>

              {/* Collapsed chapters lists */}
              {isSelected && (
                <div className="mt-4 pt-4 border-t border-slate-800/60 space-y-2.5 transition-all duration-300">
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono font-bold block">Chapters mapped inside:</span>
                  {folderChapters.length === 0 ? (
                    <div className="text-center p-3 rounded bg-slate-950/20 text-[11px] text-slate-500">
                      Empty Folder. Import files containing this subject metadata to auto-populate.
                    </div>
                  ) : (
                    folderChapters.map((ch) => (
                      <div
                        key={ch.metadata.id}
                        onClick={() => onOpenChapter(ch.metadata.id)}
                        className="p-2.5 bg-slate-950/50 rounded border border-slate-850 hover:bg-slate-950 transition cursor-pointer flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen size={12} className="text-[#E0A96D] shrink-0" />
                          <span className="text-xs text-slate-200 truncate max-w-[170px] font-serif">
                            Ch {ch.metadata.chapterNumber}. {ch.metadata.chapterTitle}
                          </span>
                        </div>
                        <ChevronRight size={12} className="text-slate-600 shrink-0" />
                      </div>
                    ))
                  )}
                </div>
              )}

            </div>
          );
        })}

      </div>
    </div>
  );
}
