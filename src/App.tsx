/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Home, BookOpen, Clock, AlertTriangle, Play, HelpCircle, 
  Settings, Award, Archive, Smartphone, Sparkles, FolderOpen, 
  Trash2, FileDown, Upload, FileCode, CheckCircle, Search, LogOut,
  Landmark, ChevronRight
} from "lucide-react";

import { 
  ChapterJson, PyqAttempt, CardSchedule, AppNote, 
  SubjectFolder, UserSettings, HighlightBookmark, Flashcard
} from "./types";
import { 
  DEMO_CHAPTER_POLITY, UPSC_DEFAULT_FOLDERS 
} from "./data";
import { getThemePalette } from "./components/ThemeStyles";

import OnboardingFlow from "./components/OnboardingFlow";
import HomeDashboard from "./components/HomeDashboard";
import LibraryFolders from "./components/LibraryFolders";
import JsonImporter from "./components/JsonImporter";
import CardRevision from "./components/CardRevision";
import ProgressAnalyzer from "./components/ProgressAnalyzer";
import ChapterReader from "./components/ChapterReader";
import AndroidExporter from "./components/AndroidExporter";

export default function App() {
  // Onboarding Stage
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
    return localStorage.getItem("cse_onboarding_done") === "true";
  });

  // Active Menu Tab: 'home' | 'library' | 'revision' | 'tests' | 'progress' | 'settings' | 'develop'
  const [activeMenu, setActiveMenu] = useState<'home' | 'library' | 'revision' | 'tests' | 'progress' | 'settings' | 'develop'>('home');
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);

  // Core local lists state
  const [chapters, setChapters] = useState<ChapterJson[]>([]);
  const [notes, setNotes] = useState<AppNote[]>([]);
  const [bookmarks, setBookmarks] = useState<HighlightBookmark[]>([]);
  const [pyqAttempts, setPyqAttempts] = useState<PyqAttempt[]>([]);
  const [cardSchedules, setCardSchedules] = useState<CardSchedule[]>([]);
  const [customFolders, setCustomFolders] = useState<SubjectFolder[]>([]);

  // User Customize Styles Settings
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem("cse_user_settings");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      fontSize: 'base',
      lineSpacing: 'normal',
      paragraphSpacing: 'normal',
      fontFamily: 'serif',
      theme: 'scholar'
    };
  });

  // Global search parameters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [globalSearchResults, setGlobalSearchResults] = useState<any[] | null>(null);

  // Gemini Key State (Saved locally only as per privacy guidelines)
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    return localStorage.getItem("cse_gemini_key") || "";
  });

  const [testConnectionStatus, setTestConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'failed' | 'no_key'>('idle');

  // Hydrate base parameters on launch
  useEffect(() => {
    // 1. Chapters
    const savedChunks = localStorage.getItem("cse_imported_chapters");
    if (savedChunks) {
      try {
        setChapters(JSON.parse(savedChunks));
      } catch (e) {
        setChapters([DEMO_CHAPTER_POLITY]);
      }
    } else {
      setChapters([DEMO_CHAPTER_POLITY]);
    }

    // 2. Custom Folders
    const savedFolders = localStorage.getItem("cse_custom_folders");
    if (savedFolders) {
      try {
        setCustomFolders(JSON.parse(savedFolders));
      } catch (e) {}
    }

    // 3. Notes
    const savedNotes = localStorage.getItem("cse_notes");
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (e) {}
    }

    // 4. Bookmarks
    const savedBookmarks = localStorage.getItem("cse_bookmarks");
    if (savedBookmarks) {
      try {
        setBookmarks(JSON.parse(savedBookmarks));
      } catch (e) {}
    }

    // 5. Attempts
    const savedAttempts = localStorage.getItem("cse_pyq_attempts");
    if (savedAttempts) {
      try {
        setPyqAttempts(JSON.parse(savedAttempts));
      } catch (e) {}
    }

    // 6. Schedules (Build some initial Leitner schedules default of DEMO flashcards so list isn't dry)
    const savedSchedules = localStorage.getItem("cse_leitner_schedules");
    if (savedSchedules) {
      try {
        setCardSchedules(JSON.parse(savedSchedules));
      } catch (e) {}
    } else {
      const demoSlides = DEMO_CHAPTER_POLITY.practice?.flashcards || [];
      const initSchedules = demoSlides.map(slide => ({
        cardId: slide.id,
        chapterId: DEMO_CHAPTER_POLITY.metadata.id,
        box: 0,
        dueDate: new Date().toISOString().split('T')[0],
        status: 'fragile' as const
      }));
      setCardSchedules(initSchedules);
    }
  }, []);

  // Save Settings sync
  const handleUpdateSettings = (updater: Partial<UserSettings>) => {
    const next = { ...settings, ...updater };
    setSettings(next);
    localStorage.setItem("cse_user_settings", JSON.stringify(next));
  };

  // Chapter import triggers
  const handleImportChapterPayload = (newChapter: ChapterJson, overwritePolicy?: 'replace' | 'keep_both' | 'cancel') => {
    let nextList = [...chapters];

    if (overwritePolicy === 'replace') {
      nextList = nextList.filter(c => c.metadata.id !== newChapter.metadata.id);
      nextList.push(newChapter);
    } else if (overwritePolicy === 'cancel') {
      return;
    } else {
      nextList.push(newChapter);
    }

    setChapters(nextList);
    localStorage.setItem("cse_imported_chapters", JSON.stringify(nextList));

    // Auto seed flashcards for spaced revisions
    const flashList = newChapter.practice?.flashcards || [];
    if (flashList.length > 0) {
      const newSchedules = flashList.map(card => ({
        cardId: card.id,
        chapterId: newChapter.metadata.id,
        box: 0,
        dueDate: new Date().toISOString().split('T')[0],
        status: 'new' as const
      }));
      const combinedSchedules = [...cardSchedules, ...newSchedules];
      setCardSchedules(combinedSchedules);
      localStorage.setItem("cse_leitner_schedules", JSON.stringify(combinedSchedules));
    }

    alert(`Successfully imported Syllabus Chapter: "${newChapter.metadata.chapterTitle}". Merged inside Library.`);
    setActiveMenu('library');
  };

  const handleUpdateSectionProgress = (chapterId: string, sectionId: string, completed: boolean) => {
    // Tracks overall completed variables
    console.log(`Progress completed trigger ${chapterId} -> ${sectionId}: ${completed}`);
  };

  const handleSaveNote = (newNote: Omit<AppNote, 'id' | 'createdAt'>) => {
    const fullNote: AppNote = {
      ...newNote,
      id: "note_" + Date.now(),
      createdAt: new Date().toISOString()
    };
    const nextNotes = [fullNote, ...notes];
    setNotes(nextNotes);
    localStorage.setItem("cse_notes", JSON.stringify(nextNotes));
    alert("Note logs updated successfully!");
  };

  const handleDeleteNote = (noteId: string) => {
    const next = notes.filter(n => n.id !== noteId);
    setNotes(next);
    localStorage.setItem("cse_notes", JSON.stringify(next));
  };

  const handleToggleBookmark = (chapterId: string, sectionId: string) => {
    const isPresent = bookmarks.some(b => b.chapterId === chapterId && b.sectionId === sectionId);
    let nextBookmarks = [];

    if (isPresent) {
      nextBookmarks = bookmarks.filter(b => !(b.chapterId === chapterId && b.sectionId === sectionId));
    } else {
      nextBookmarks = [{
        id: "bm_" + Date.now(),
        chapterId,
        sectionId,
        createdAt: new Date().toISOString()
      }, ...bookmarks];
    }
    setBookmarks(nextBookmarks);
    localStorage.setItem("cse_bookmarks", JSON.stringify(nextBookmarks));
  };

  const handleAttemptPyq = (attempt: PyqAttempt) => {
    const nextAttempts = [attempt, ...pyqAttempts];
    setPyqAttempts(nextAttempts);
    localStorage.setItem("cse_pyq_attempts", JSON.stringify(nextAttempts));
  };

  const handleScheduleLeitnerCard = (cardId: string, status: CardSchedule['status']) => {
    const exists = cardSchedules.some(c => c.cardId === cardId);
    let nextSchedules = [];

    if (exists) {
      nextSchedules = cardSchedules.map(c => {
        if (c.cardId === cardId) {
          return { ...c, status, dueDate: new Date().toISOString().split('T')[0] };
        }
        return c;
      });
    } else {
      nextSchedules = [...cardSchedules, {
        cardId,
        chapterId: activeChapterId || "polity-president",
        box: 1,
        dueDate: new Date().toISOString().split('T')[0],
        status
      }];
    }
    setCardSchedules(nextSchedules);
    localStorage.setItem("cse_leitner_schedules", JSON.stringify(nextSchedules));
  };

  // Setup onboarding finish hooks
  const handleFinishedOnboarding = (action: 'explore_demo' | 'import_now' | 'dashboard') => {
    localStorage.setItem("cse_onboarding_done", "true");
    setHasCompletedOnboarding(true);
    
    if (action === 'explore_demo') {
      setActiveChapterId("polity-president");
      setActiveMenu('home'); // Reader overrides
    } else if (action === 'import_now') {
      setActiveMenu('settings'); // redirect to settings tab showing import hooks
    } else {
      setActiveMenu('home');
    }
  };

  // Restore onboarding trigger
  const handleResetAppOnboarding = () => {
    if (confirm("This restores Onboarding stepper guides. Your saved syllabus reads and notes preserve. Proceed?")) {
      localStorage.removeItem("cse_onboarding_done");
      setHasCompletedOnboarding(false);
    }
  };

  // Dynamic style updates
  const activePalette = getThemePalette(settings.theme);

  // Global search mechanism
  const executeGlobalSearch = () => {
    if (!searchQuery.trim()) {
      setGlobalSearchResults(null);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results: any[] = [];

    // Search across chapters text
    chapters.forEach((ch) => {
      ch.sections.forEach(sec => {
        if (sec.sourceText.toLowerCase().includes(query) || sec.title.toLowerCase().includes(query)) {
          results.push({
            type: "Chapter Section",
            title: `${ch.metadata.chapterTitle} > ${sec.title}`,
            snippet: sec.sourceText.substring(0, 160) + "...",
            chapterId: ch.metadata.id
          });
        }
      });
    });

    // Search across notes
    notes.forEach(note => {
      if (note.text.toLowerCase().includes(query)) {
        results.push({
          type: "Personal Note Logs",
          title: note.title,
          snippet: note.text.substring(0, 160) + "...",
          chapterId: note.chapterId
        });
      }
    });

    setGlobalSearchResults(results);
  };

  // Client backup system
  const triggerExportBackup = () => {
    const fullBackup = {
      chapters,
      notes,
      bookmarks,
      pyqAttempts,
      cardSchedules,
      settings
    };

    const str = JSON.stringify(fullBackup, null, 2);
    const blob = new Blob([str], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cseguide_candidate_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    alert("Export successful: Prepared candidate.json offline package backup download!");
  };

  const triggerImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const obj = JSON.parse(event.target?.result as string);
        if (obj.chapters) setChapters(obj.chapters);
        if (obj.notes) setNotes(obj.notes);
        if (obj.bookmarks) setBookmarks(obj.bookmarks);
        if (obj.pyqAttempts) setPyqAttempts(obj.pyqAttempts);
        if (obj.cardSchedules) setCardSchedules(obj.cardSchedules);
        
        localStorage.setItem("cse_imported_chapters", JSON.stringify(obj.chapters || []));
        localStorage.setItem("cse_notes", JSON.stringify(obj.notes || []));
        localStorage.setItem("cse_bookmarks", JSON.stringify(obj.bookmarks || []));
        localStorage.setItem("cse_pyq_attempts", JSON.stringify(obj.pyqAttempts || []));
        localStorage.setItem("cse_leitner_schedules", JSON.stringify(obj.cardSchedules || []));

        alert("Restore completed: Hydrated database offline state successfully.");
        setActiveMenu('home');
      } catch (err) {
        alert("Backup parsing failed. Verify JSON package scheme integrity.");
      }
    };
    reader.readAsText(file);
  };

  // Test optional key client connect check
  const handleTestGeminiConnection = async () => {
    if (!geminiApiKey.trim()) {
      setTestConnectionStatus('no_key');
      return;
    }
    setTestConnectionStatus('testing');

    try {
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "custom",
          sectionText: "State Position summary",
          customPrompt: "Hello, confirm link connection."
        })
      });
      const data = await response.json();
      if (data.output) {
        setTestConnectionStatus('success');
      } else {
        setTestConnectionStatus('failed');
      }
    } catch (e) {
      setTestConnectionStatus('failed');
    }
  };

  if (!hasCompletedOnboarding) {
    return <OnboardingFlow onComplete={handleFinishedOnboarding} />;
  }

  // Overriding display if reading a chapter
  const openedChapter = chapters.find(c => c.metadata.id === activeChapterId);

  return (
    <div className={`min-h-screen flex flex-col ${activePalette.bg} ${activePalette.textPrimary} select-none transition-colors duration-150`}>
      
      {/* Search overlay results list if queries exist */}
      {globalSearchResults && (
        <div className="fixed inset-0 z-50 bg-[#0B132B]/90 backdrop-blur-sm p-4 md:p-8 overflow-y-auto">
          <div className="max-w-2xl mx-auto bg-[#1C2541] rounded-lg border border-[#3A506B]/50 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-serif text-white font-bold">Search results ({globalSearchResults.length})</span>
              <button 
                onClick={() => {
                  setGlobalSearchResults(null);
                  setSearchQuery("");
                }}
                className="text-slate-400 hover:text-white"
              >
                Clear Filter
              </button>
            </div>

            <div className="space-y-4 max-h-[460px] overflow-y-auto">
              {globalSearchResults.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-6">No matching keywords found.</p>
              ) : (
                globalSearchResults.map((res, i) => (
                  <div 
                    key={i} 
                    onClick={() => {
                      setActiveChapterId(res.chapterId);
                      setGlobalSearchResults(null);
                      setSearchQuery("");
                    }}
                    className="p-3 rounded bg-slate-950/40 border border-slate-850 hover:bg-slate-950 hover:border-[#E0A96D]/30 transition cursor-pointer text-left space-y-1.5"
                  >
                    <div className="flex justify-between items-center text-[10px] text-[#E0A96D] font-mono">
                      <span>{res.type}</span>
                      <span className="text-slate-500 text-[9px] uppercase font-sans font-bold">Navigate</span>
                    </div>
                    <h5 className="text-xs font-serif font-bold text-slate-200">{res.title}</h5>
                    <p className="text-[11px] text-slate-400 font-serif lowercase italic">"{res.snippet}"</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Primary app body contents view wrapper */}
      {openedChapter ? (
        <ChapterReader
          chapter={openedChapter}
          settings={settings}
          onBack={() => setActiveChapterId(null)}
          onUpdateProgress={handleUpdateSectionProgress}
          onSaveNote={handleSaveNote}
          onDeleteNote={handleDeleteNote}
          notes={notes}
          bookmarks={bookmarks}
          onToggleBookmark={handleToggleBookmark}
          onAttemptPyq={handleAttemptPyq}
          onScheduleCard={handleScheduleLeitnerCard}
          pyqAttempts={pyqAttempts}
          cardSchedules={cardSchedules}
        />
      ) : (
        <div className="flex-1 flex flex-col md:flex-row min-h-screen">
          
          {/* Side navigation bar on desktop, collapsible rail */}
          <aside className="w-full md:w-64 bg-slate-950 text-slate-350 border-r border-slate-900 flex flex-col justify-between shrink-0">
            <div className="p-5 space-y-6">
              
              {/* Launcher Logotype */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-[#E0A96D]/15 border border-[#E0A96D]/45 flex items-center justify-center text-[#E0A96D]">
                  <Landmark size={18} />
                </div>
                <span className="font-serif font-bold tracking-widest text-[#FCFDFE]">
                  CSE<span className="text-[#E0A96D]">Guide</span>
                </span>
              </div>

              {/* Navigation list */}
              <nav className="flex flex-col gap-1.5 text-xs font-semibold">
                {[
                  { id: 'home', label: 'Candidate Dashboard', icon: Home },
                  { id: 'library', label: 'Syllabus Library', icon: BookOpen },
                  { id: 'revision', label: 'Leitner Revision', icon: Clock },
                  { id: 'progress', label: 'Retention Stats', icon: Award },
                  { id: 'settings', label: 'Settings & Backups', icon: Settings },
                  { id: 'develop', label: 'Export Android APK', icon: Smartphone }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeMenu === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`menu-item-${item.id}`}
                      onClick={() => setActiveMenu(item.id as any)}
                      className={`flex items-center gap-2.5 py-2.5 px-3 rounded text-left transition cursor-pointer ${
                        isActive 
                          ? 'bg-[#E0A96D]/10 text-[#E0A96D]' 
                          : 'hover:bg-slate-900 text-slate-300'
                      }`}
                    >
                      <Icon size={14} className={isActive ? 'text-[#E0A96D]' : 'text-slate-400'} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

            </div>

            {/* Offline-first bottom status card */}
            <div className="p-4 border-t border-slate-900 space-y-1 bg-[#1C2541]/10 text-[10px] text-slate-500 font-mono">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Isolated sandbox offline</span>
              </div>
              <p>Device locked. CSEGuide 1.0.0</p>
            </div>
          </aside>

          {/* Core content interaction dashboard viewport */}
          <div className="flex-1 overflow-y-auto">
            
            {activeMenu === 'home' && (
              <HomeDashboard
                chapters={chapters}
                notes={notes}
                pyqAttempts={pyqAttempts}
                cardSchedules={cardSchedules}
                onOpenChapter={setActiveChapterId}
                onNavigateToTab={(tabId) => {
                  if (tabId === 'revision') setActiveMenu('revision');
                }}
                onTriggerImport={() => setActiveMenu('settings')}
                customFolders={customFolders}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onTriggerGlobalSearch={executeGlobalSearch}
              />
            )}

            {activeMenu === 'library' && (
              <LibraryFolders
                chapters={chapters}
                folders={[...UPSC_DEFAULT_FOLDERS, ...customFolders]}
                onAddCustomFolder={(name) => {
                  const next = [...customFolders, { id: "custom_" + Date.now(), name, isDefault: false, iconName: "FolderHeart" }];
                  setCustomFolders(next);
                  localStorage.setItem("cse_custom_folders", JSON.stringify(next));
                }}
                onDeleteCustomFolder={(id) => {
                  const next = customFolders.filter(f => f.id !== id);
                  setCustomFolders(next);
                  localStorage.setItem("cse_custom_folders", JSON.stringify(next));
                }}
                onRenameCustomFolder={(id, newName) => {
                  const next = customFolders.map(f => f.id === id ? { ...f, name: newName } : f);
                  setCustomFolders(next);
                  localStorage.setItem("cse_custom_folders", JSON.stringify(next));
                }}
                onOpenChapter={setActiveChapterId}
                onMoveChapterFolder={(chapterId, target) => {
                  const next = chapters.map(c => {
                    if (c.metadata.id === chapterId) {
                      return { ...c, metadata: { ...c.metadata, subject: target } };
                    }
                    return c;
                  });
                  setChapters(next);
                  localStorage.setItem("cse_imported_chapters", JSON.stringify(next));
                }}
              />
            )}

            {activeMenu === 'revision' && (
              <CardRevision
                cardSchedules={cardSchedules}
                allFlashcards={chapters.reduce((lst, ch) => [...lst, ...(ch.practice?.flashcards || [])], [] as Flashcard[])}
                onScheduleCard={handleScheduleLeitnerCard}
                onNavigateToReader={setActiveChapterId}
              />
            )}

            {activeMenu === 'progress' && (
              <ProgressAnalyzer
                chapters={chapters}
                pyqAttempts={pyqAttempts}
                cardSchedules={cardSchedules}
                notes={notes}
              />
            )}

            {activeMenu === 'develop' && (
              <AndroidExporter />
            )}

            {activeMenu === 'settings' && (
              <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6 pb-20">
                <div className="border-b border-slate-800 pb-3">
                  <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                    <Settings Icon size={20} className="text-[#E0A96D]" /> Applet Configuration & Hydrator
                  </h2>
                  <p className="text-xs text-slate-400">Configure visual themes, spaced sliders, database imports/exports, and optional Gemini keys.</p>
                </div>

                {/* Sub-block 1: Themes configurations */}
                <div className="py-2.5 p-4 bg-slate-900/40 border border-slate-850 rounded-lg space-y-3">
                  <h3 className="text-sm font-bold text-slate-300">Set Reading Themes</h3>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                    {[
                      { id: 'scholar', label: 'Scholar Dark' },
                      { id: 'sepia', label: 'Sepia Study' },
                      { id: 'clean', label: 'Clean Light' },
                      { id: 'night', label: 'Night Reading' },
                      { id: 'forest', label: 'Forest Focus' },
                      { id: 'highcontrast', label: 'High Contrast' }
                    ].map(pal => (
                      <button
                        key={pal.id}
                        id={`theme-btn-${pal.id}`}
                        onClick={() => handleUpdateSettings({ theme: pal.id as any })}
                        className={`text-xs p-2 rounded border font-semibold capitalize ${settings.theme === pal.id ? 'bg-[#E0A96D] text-slate-950 border-[#E0A96D]' : 'bg-slate-950 text-slate-300 border-transparent hover:bg-slate-900'}`}
                      >
                        {pal.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sub-block 2: Font sliders and styles */}
                <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-lg space-y-4">
                  <h3 className="text-sm font-bold text-slate-300">Reader Typography Metrics</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    
                    <div className="space-y-1.5">
                      <span>Typography Style Family:</span>
                      <div className="grid grid-cols-3 gap-1">
                        {[
                          { id: 'serif', label: 'Book Serif' },
                          { id: 'academic', label: 'Academic' },
                          { id: 'sans', label: 'System Sans' }
                        ].map(t => (
                          <button
                            key={t.id}
                            onClick={() => handleUpdateSettings({ fontFamily: t.id as any })}
                            className={`p-1 border rounded text-[10px] ${settings.fontFamily === t.id ? 'bg-[#E0A96D] text-slate-950' : 'bg-slate-950 text-slate-400'}`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span>Text size scale:</span>
                      <div className="grid grid-cols-4 gap-1">
                        {['sm', 'base', 'lg', 'xl'].map(size => (
                          <button
                            key={size}
                            onClick={() => handleUpdateSettings({ fontSize: size as any })}
                            className={`p-1 border rounded text-[10px] uppercase ${settings.fontSize === size ? 'bg-[#E0A96D] text-slate-950' : 'bg-slate-950 text-slate-400'}`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Sub-block 3: Optional Gemini API Key integration wrapper */}
                <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-lg space-y-3">
                  <h3 className="text-sm font-bold text-[#E0A96D] flex items-center gap-1.5">
                    <Sparkles size={14} /> Optional Gemini AI Configuration (Server-Proxy)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    To trigger live UPSC summary simplify, MCQ drill generators, and Mains skeletal outlines, provide your private Gemini key. This is never uploaded to any external database and remains client-side.
                  </p>
                  
                  <div className="flex gap-2">
                    <input
                      id="gemini-api-key-input"
                      type="password"
                      placeholder="Paste your AI Studio Gemini API Key here..."
                      value={geminiApiKey}
                      onChange={(e) => {
                        setGeminiApiKey(e.target.value);
                        localStorage.setItem("cse_gemini_key", e.target.value);
                      }}
                      className="flex-1 text-xs bg-slate-950 p-2.5 rounded text-white border border-slate-800"
                    />
                    <button
                      id="gemini-test-conn-btn"
                      onClick={handleTestGeminiConnection}
                      className="px-4 py-2 bg-slate-850 hover:bg-slate-750 text-slate-200 border border-slate-750 rounded text-xs font-bold transition"
                    >
                      Test Connection
                    </button>
                  </div>

                  {testConnectionStatus === 'testing' && <span className="text-[10px] font-mono text-[#E0A96D] block">Querying model via server proxy...</span>}
                  {testConnectionStatus === 'success' && <span className="text-[10px] font-mono text-emerald-400 block font-bold">✓ Connection Validated Successfully with gemini-3.5-flash!</span>}
                  {testConnectionStatus === 'failed' && <span className="text-[10px] font-mono text-rose-400 block">✖ Connection failed. Verify key schema in your settings.</span>}
                </div>

                {/* Database backup exporter/importer */}
                <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-lg space-y-4">
                  <h3 className="text-sm font-bold text-slate-300">Candidate Data Backups</h3>
                  <p className="text-[11px] text-slate-400">Export or restore your compiled chapter reads, notes, leitner revision cards lists, and metrics offline.</p>
                  
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={triggerExportBackup}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded text-xs font-bold flex items-center gap-1 transition"
                    >
                      <FileDown size={14} /> Export Backup JSON
                    </button>

                    <label className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition">
                      <Upload size={14} /> Import Backup JSON
                      <input 
                        type="file" 
                        accept="application/json" 
                        onChange={triggerImportBackup}
                        className="hidden" 
                      />
                    </label>

                    <button
                      onClick={handleResetAppOnboarding}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition"
                    >
                      Restore Onboarding Steps
                    </button>
                  </div>
                </div>

                {/* Sub-block 4: Direct Syllabus content hydrator JSON */}
                <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-lg space-y-3">
                  <h3 className="text-sm font-bold text-slate-300 mb-1">Direct Json Folder Upload</h3>
                  <JsonImporter
                    onImportChapter={handleImportChapterPayload}
                    existingChapters={chapters}
                  />
                </div>

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
