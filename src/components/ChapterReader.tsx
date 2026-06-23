/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, BookOpen, Sparkles, Bookmark, BookmarkCheck, FileText, CheckCircle, 
  AlertCircle, HelpCircle, Send, Save, Plus, Trash2, Eye, ExternalLink, 
  Clock, ArrowRight, Table, Swords, BookOpenCheck, ChevronRight, ChevronDown, ListFilter,
  Check, X, RotateCcw, AlertTriangle, Edit3, BookmarkCheck as Bookmarked
} from "lucide-react";
import { 
  ChapterJson, ChapterSection, LessonSlide, PracticeMcq, Flashcard, 
  AppNote, HighlightBookmark, PyqAttempt, CardSchedule, UserSettings 
} from "../types";
import { 
  getThemePalette, getFontFamilyClass, getFontSizeClass, 
  getLineSpaceClass, getParagraphSpaceClass, ThemeColors
} from "./ThemeStyles";

interface ChapterReaderProps {
  chapter: ChapterJson;
  settings: UserSettings;
  onBack: () => void;
  onUpdateProgress: (chapterId: string, sectionId: string, completed: boolean) => void;
  onSaveNote: (note: Omit<AppNote, 'id' | 'createdAt'>) => void;
  onDeleteNote: (noteId: string) => void;
  notes: AppNote[];
  bookmarks: HighlightBookmark[];
  onToggleBookmark: (chapterId: string, sectionId: string) => void;
  onAttemptPyq: (attempt: PyqAttempt) => void;
  onScheduleCard: (cardId: string, status: CardSchedule['status']) => void;
  pyqAttempts: PyqAttempt[];
  cardSchedules: CardSchedule[];
}

export default function ChapterReader({
  chapter,
  settings,
  onBack,
  onUpdateProgress,
  onSaveNote,
  onDeleteNote,
  notes,
  bookmarks,
  onToggleBookmark,
  onAttemptPyq,
  onScheduleCard,
  pyqAttempts,
  cardSchedules
}: ChapterReaderProps) {
  const [activeTab, setActiveTab] = useState<'read' | 'lesson' | 'pyq' | 'cards' | 'test' | 'notes' | 'ca'>('read');
  const [selectedSectionId, setSelectedSectionId] = useState<string>(chapter.sections[0]?.id || "");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    [chapter.sections[0]?.id]: true
  });
  
  // Local state for Read Assistant Action
  const [assistantLoading, setAssistantLoading] = useState<boolean>(false);
  const [assistantOutput, setAssistantOutput] = useState<{title: string, content: string, type: string} | null>(null);
  
  // Highlight note creation
  const [sectionNoteText, setSectionNoteText] = useState<string>("");
  const [sectionDoubtFlag, setSectionDoubtFlag] = useState<boolean>(false);
  
  // Lesson state
  const [activeLessonIdx, setActiveLessonIdx] = useState<number>(0);
  const [activeSlideIdx, setActiveSlideIdx] = useState<number>(0);
  const [completedSlides, setCompletedSlides] = useState<Record<string, boolean>>({});
  
  // PYQ state
  const [pyqAnswerState, setPyqAnswerState] = useState<Record<string, { answered: boolean, selected: string, confidence: 'sure' | 'somewhat' | 'guess' | 'unknown' }>>({});
  
  // Flashcards state
  const [activeCardIdx, setActiveCardIdx] = useState<number>(0);
  const [isCardFlipped, setIsCardFlipped] = useState<boolean>(false);
  
  // Test Mode state
  const [testState, setTestState] = useState<'setup' | 'active' | 'review'>('setup');
  const [testQuestions, setTestQuestions] = useState<PracticeMcq[]>([]);
  const [testAnswers, setTestAnswers] = useState<Record<string, string>>({});
  const [testConfidence, setTestConfidence] = useState<Record<string, 'sure' | 'somewhat' | 'guess' | 'unknown'>>({});
  const [testResult, setTestResult] = useState<{ score: number, accuracy: number } | null>(null);

  // Table View modes: 'clean' | 'exam' | 'source'
  const [tableViewMode, setTableViewMode] = useState<'clean' | 'exam' | 'source'>('clean');

  // Custom Prompt local assistant state
  const [customAiPrompt, setCustomAiPrompt] = useState<string>("");

  // Progress Sections Read State
  const [readSections, setReadSections] = useState<Record<string, boolean>>({});

  // Current Affairs Paste Bridge
  const [caText, setCaText] = useState<string>("");
  const [caClassifyLoading, setCaClassifyLoading] = useState<boolean>(false);
  const [caStructuredOutput, setCaStructuredOutput] = useState<any>(null);

  useEffect(() => {
    // Load initial read progress or activities if stored
    const keys = localStorage.getItem(`readProgress_${chapter.metadata.id}`);
    if (keys) {
      try {
        setReadSections(JSON.parse(keys));
      } catch (e) {}
    }
  }, [chapter.metadata.id]);

  const activePalette = getThemePalette(settings.theme);
  const currentSection = chapter.sections.find(s => s.id === selectedSectionId) || chapter.sections[0];

  const handleToggleSection = (id: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    setSelectedSectionId(id);
  };

  const handleMarkAsRead = (sectionId: string) => {
    const nextRead = {
      ...readSections,
      [sectionId]: !readSections[sectionId]
    };
    setReadSections(nextRead);
    localStorage.setItem(`readProgress_${chapter.metadata.id}`, JSON.stringify(nextRead));
    onUpdateProgress(chapter.metadata.id, sectionId, nextRead[sectionId]);
  };

  // Launch Server-side Gemini endpoint
  const runAssistantTool = async (taskType: string, customText: string = "") => {
    if (!currentSection) return;
    setAssistantLoading(true);
    setAssistantOutput(null);

    const titleMap: Record<string, string> = {
      explain: "Simple Explanation",
      upsc_lens: "UPSC Civil Services Lens (Prelims vs Mains)",
      socratic: "Socratic Retrieval Questions",
      mcq: "Instant UPSC MCQ Drill",
      flashcard: "Study Flashcards",
      mains_prompt: "Mains Prompt & Skeleton",
      custom: "AI Custom Explanation"
    };

    try {
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: taskType,
          sectionText: currentSection.sourceText,
          customPrompt: customText
        })
      });

      const data = await response.json();
      if (data.error) {
        setAssistantOutput({
          title: "API Error",
          content: `${data.error}. If you don't have an internet connection or an active key, please use local fallback indicators below!`,
          type: "error"
        });
      } else {
        setAssistantOutput({
          title: titleMap[taskType] || "Assistant Intelligence",
          content: data.output,
          type: taskType
        });
      }
    } catch (err: any) {
      setAssistantOutput({
        title: "API Connection Failed",
        content: "Our servers could not reach the Gemini API gateway offline. Verify your local settings and server connection.",
        type: "error"
      });
    } finally {
      setAssistantLoading(false);
    }
  };

  const handleSaveSectionNote = () => {
    if (!sectionNoteText.trim()) return;
    onSaveNote({
      chapterId: chapter.metadata.id,
      sectionId: selectedSectionId,
      title: `${chapter.metadata.chapterTitle} - ${currentSection.title}`,
      text: sectionNoteText,
      isDoubt: sectionDoubtFlag,
      isResolved: false
    });
    setSectionNoteText("");
    setSectionDoubtFlag(false);
  };

  // Lesson Mode Utilities
  const currentLesson = chapter.lessonMode?.lessons[activeLessonIdx];
  const currentSlide = currentLesson?.slides[activeSlideIdx];

  const handleToggleSlideCompletion = (slideId: string) => {
    setCompletedSlides(prev => ({
      ...prev,
      [slideId]: !prev[slideId]
    }));
  };

  // PYQ Answer Handlers
  const handleAnswerPyq = (pyqId: string, option: string, confidence: 'sure' | 'somewhat' | 'guess' | 'unknown') => {
    const pyq = chapter.practice?.mcqs?.find(q => q.id === pyqId) || DEMO_PYQS_LOCAL.find(q => q.id === pyqId);
    if (!pyq) return;

    const isCorrect = option === pyq.answer;
    setPyqAnswerState(prev => ({
      ...prev,
      [pyqId]: { answered: true, selected: option, confidence }
    }));

    // Trigger parent attempts tracking
    onAttemptPyq({
      pyqId,
      userAnswer: option,
      isCorrect,
      confidence,
      timestamp: new Date().toISOString()
    });

    // Leitner scheduling: if wrong + confidence sure -> mark urgent revision "misconception"
    if (!isCorrect && confidence === 'sure') {
      onScheduleCard(pyqId, 'misconception');
    }
  };

  // Test Generator
  const handleStartChapterTest = () => {
    const combinedMcqs = [...(chapter.practice?.mcqs || [])];
    if (combinedMcqs.length === 0) {
      // populate standard demo polity mcqs
      setTestQuestions(DEMO_PYQS_LOCAL.slice(0, 5));
    } else {
      setTestQuestions(combinedMcqs);
    }
    setTestAnswers({});
    setTestConfidence({});
    setTestResult(null);
    setTestState('active');
  };

  const calculateTestScore = () => {
    let score = 0;
    testQuestions.forEach(q => {
      if (testAnswers[q.id] === q.answer) {
        score += 2; // UPSC Prelims scheme: 2 marks per MCQ
      } else if (testAnswers[q.id]) {
        score -= 0.66; // 1/3 penalty
      }
    });

    const totalPossible = testQuestions.length * 2;
    const accuracy = testQuestions.length 
      ? Math.round((Object.keys(testAnswers).filter(qid => testAnswers[qid] === testQuestions.find(q => q.id === qid)?.answer).length / testQuestions.length) * 100)
      : 0;

    setTestResult({
      score: Number(score.toFixed(2)),
      accuracy
    });

    // Auto log attempts & report dangerous misconceptions
    testQuestions.forEach(q => {
      const isCorrect = testAnswers[q.id] === q.answer;
      onAttemptPyq({
        pyqId: q.id,
        userAnswer: testAnswers[q.id] || "Skipped",
        isCorrect,
        confidence: testConfidence[q.id] || 'unknown',
        timestamp: new Date().toISOString()
      });

      if (!isCorrect && testConfidence[q.id] === 'sure') {
        onScheduleCard(q.id, 'misconception');
      }
    });

    setTestState('review');
  };

  // Classified Current Affairs Generator
  const handleClassifyCurrentAffairs = async () => {
    if (!caText.trim()) return;
    setCaClassifyLoading(true);
    setCaStructuredOutput(null);

    try {
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "current_affairs",
          sectionText: caText
        })
      });

      const data = await response.json();
      if (data.error) {
        // Mock structured output for offline
        setCaStructuredOutput({
          subject: chapter.metadata.subject,
          syllabusArea: "General Studies Paper II: Executive & Judiciary links",
          prelimsFact: "Key statutory vs constitutional roles discussed in current context.",
          mainsIssue: "Vesting of cabinet control over ministerial accountability.",
          upscAngle: "How current legislative amendments dilute constitutional state parity.",
          revisionNote20Words: "Pasted current affairs piece highlights cabinet supremacy over administrative decisions, reinforcing parliamentary sovereign oversight mechanism as key GS II study area.",
          error: data.error
        });
      } else {
        // Parse unstructured text into mock blocks for gorgeous representation
        const raw = data.output;
        setCaStructuredOutput({
          subject: chapter.metadata.subject,
          syllabusArea: "GS Paper link automatically analyzed by Gemini",
          rawAI: raw
        });
      }

      // Save as note locally to link to chapter context
      onSaveNote({
        chapterId: chapter.metadata.id,
        sectionId: "ca-sync",
        title: `CA Sync: ${caText.substring(0, 35)}...`,
        text: caText + (data.output ? `\n\n[UPSC Analysed Angle]\n${data.output}` : ""),
        isDoubt: false,
        isResolved: true
      });

      setCaText("");
    } catch (e) {
      setCaStructuredOutput({
        subject: chapter.metadata.subject,
        syllabusArea: "General Studies Paper II",
        prelimsFact: "Static link mapped.",
        mainsIssue: "Sovereignty oversight dynamics.",
        revisionNote20Words: "Pasted snippet saved offline. Local storage structured fallback created automatically.",
      });
    } finally {
      setCaClassifyLoading(false);
    }
  };

  const isBookmarked = (secId: string) => bookmarks.some(b => b.chapterId === chapter.metadata.id && b.sectionId === secId);
  const currentChapterNotes = notes.filter(n => n.chapterId === chapter.metadata.id && n.sectionId === selectedSectionId);

  return (
    <div className={`min-h-screen ${activePalette.bg} ${activePalette.textPrimary} flex flex-col font-sans transition-colors duration-150`}>
      {/* Dynamic Header */}
      <header className={`sticky top-0 z-40 ${activePalette.navBg} border-b ${activePalette.border} px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <button 
            id="reader-back-btn"
            onClick={onBack} 
            className="p-1.5 rounded hover:bg-slate-800/40 text-slate-300 transition"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#E0A96D] px-1.5 py-0.5 rounded bg-[#E0A96D]/10">
                {chapter.metadata.subject}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Ch {chapter.metadata.chapterNumber}
              </span>
            </div>
            <h1 className="font-serif text-base md:text-lg font-bold truncate max-w-[280px] md:max-w-md">
              {chapter.metadata.chapterTitle}
            </h1>
          </div>
        </div>

        {/* Font customization fast controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs hidden sm:inline text-slate-400 font-mono">
            {chapter.metadata.book} {chapter.metadata.edition && `(${chapter.metadata.edition} Ed)`}
          </span>
          <div className="flex rounded border border-[#3A506B]/30 bg-slate-950/20 overflow-hidden">
            <button 
              onClick={() => setTableViewMode('clean')}
              className={`px-2 py-1 text-[10px] font-mono ${tableViewMode === 'clean' ? 'bg-[#E0A96D] text-slate-950' : 'text-slate-400'}`}
              title="Clean Table"
            >
              Clean
            </button>
            <button 
              onClick={() => setTableViewMode('exam')}
              className={`px-2 py-1 text-[10px] font-mono ${tableViewMode === 'exam' ? 'bg-[#E0A96D] text-slate-950' : 'text-slate-400'}`}
              title="Comparison Exam Mode"
            >
              Exam
            </button>
            <button 
              onClick={() => setTableViewMode('source')}
              className={`px-2 py-1 text-[10px] font-mono ${tableViewMode === 'source' ? 'bg-[#E0A96D] text-slate-950' : 'text-slate-400'}`}
              title="Source Code View"
            >
              Source
            </button>
          </div>
        </div>
      </header>

      {/* Chapter level Tabs bar */}
      <nav className={`w-full ${activePalette.surface} border-b ${activePalette.border} px-2 md:px-4 flex overflow-x-auto scrollbar-none`}>
        {[
          { id: 'read', label: '1. Read', icon: BookOpen },
          { id: 'lesson', label: '2. Lesson Slides', icon: FileText },
          { id: 'pyq', label: '3. Linked PYQs', icon: HelpCircle },
          { id: 'cards', label: '4. Flashcards', icon: Swords },
          { id: 'test', label: '5. Practice Test', icon: BookOpenCheck },
          { id: 'notes', label: '6. Section Notes', icon: Edit3 },
          { id: 'ca', label: '7. Current Affairs', icon: ExternalLink }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`reader-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 py-3 px-3 border-b-2 text-xs md:text-sm font-medium whitespace-nowrap transition cursor-pointer ${
                isActive 
                  ? 'border-[#E0A96D] text-[#E0A96D]' 
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-[#E0A96D]' : 'text-slate-400'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Main active segment with dual pane on large devices (Read Mode) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* --- LEFT SIDE: THE TEXT BOOK OR ACTIVE TAB INTERACTION --- */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          
          {/* TAB 1: READ TEXT BOOK */}
          {activeTab === 'read' && (
            <div className={`max-w-3xl mx-auto ${getFontFamilyClass(settings.fontFamily)} ${getFontSizeClass(settings.fontSize)} ${getLineSpaceClass(settings.lineSpacing)}`}>
              <div className="mb-6 pb-4 border-b border-slate-700/30 flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xs uppercase tracking-widest text-[#E0A96D] mb-1">Original Syllabus Passage</h3>
                  <p className="text-xs text-slate-400">Chapters and subsections render with official page numbers. Highlights and notes save automatically.</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs bg-[#E0A96D]/15 text-[#E0A96D] px-2 py-0.5 rounded font-mono">
                    {chapter.metadata.paper || "GS-II"}
                  </span>
                </div>
              </div>

              {chapter.sections.map((section) => {
                const isExpanded = expandedSections[section.id];
                const isSecRead = readSections[section.id];
                const activeSecBookmarked = isBookmarked(section.id);

                return (
                  <article 
                    key={section.id} 
                    className={`mb-6 p-4 rounded border transition ${
                      selectedSectionId === section.id 
                        ? `bg-slate-900/40 ${activePalette.border}` 
                        : "bg-transparent border-transparent"
                    }`}
                  >
                    {/* Collapsible item title */}
                    <header className="flex items-center justify-between gap-2 cursor-pointer pb-2" onClick={() => handleToggleSection(section.id)}>
                      <div className="flex items-center gap-2">
                        {isExpanded ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                        <h4 className="font-serif text-base font-semibold tracking-tight text-white hover:text-[#E0A96D] transition flex items-center gap-2">
                          {section.title}
                          {isSecRead && <CheckCircle size={14} className="text-emerald-400 inline" />}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        {section.pageHint && (
                          <span className="text-xs text-slate-500 font-mono">
                            p. {section.pageHint}
                          </span>
                        )}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleBookmark(chapter.metadata.id, section.id);
                          }}
                          className={`p-1.5 rounded transition ${activeSecBookmarked ? 'text-[#E0A96D]' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                          {activeSecBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                        </button>
                      </div>
                    </header>

                    {/* Section body */}
                    {isExpanded && (
                      <div className="pl-6 pt-2 space-y-4">
                        <p className={`text-slate-200 leading-relaxed ${getParagraphSpaceClass(settings.paragraphSpacing)}`}>
                          {section.sourceText}
                        </p>

                        {/* Rendering Simple Tables if present */}
                        {tableViewMode === 'exam' && (
                          <div className="bg-amber-500/5 border border-[#E0A96D]/30 rounded p-4 text-xs my-4 space-y-2">
                            <div className="flex items-center gap-1.5 text-[#E0A96D] font-bold">
                              <Table size={14} className="text-[#E0A96D]" /> COMPARISON EXAM FOCUS INDEX
                            </div>
                            <p className="text-slate-300 leading-snug">
                              <strong>Key Dimension:</strong> Executing powers and mandatory binding cabinet decrees. Money vs normal veto triggers.
                            </p>
                            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-700/30">
                              <div>
                                <span className="font-semibold text-white">De Jure Authority:</span>
                                <p className="text-slate-400">Vested in President (Art 53); symbolic head, first citizen.</p>
                              </div>
                              <div>
                                <span className="font-semibold text-white">De Facto Authority:</span>
                                <p className="text-slate-400">Vested in Prime Minister and Council; real political oversight.</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {tableViewMode === 'source' && (
                          <div className="bg-slate-950 p-3 rounded font-mono text-slate-400 text-xs my-4 overflow-x-auto border border-emerald-500/20">
                            {"// Source Schema Chapter payload segment"}
                            <pre className="text-emerald-400 mt-1 text-[10px]">
                              {JSON.stringify(section, null, 2)}
                            </pre>
                          </div>
                        )}

                        {/* Footnotes Display */}
                        {section.footnotes && section.footnotes.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-slate-800/40 text-xs text-slate-400 italic">
                            {section.footnotes.map((fn, idx) => (
                              <p key={idx}>* [{idx + 1}] {fn}</p>
                            ))}
                          </div>
                        )}

                        {/* Action buttons list */}
                        <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-800/20">
                          <button
                            onClick={() => handleMarkAsRead(section.id)}
                            className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1 transition ${
                              isSecRead 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20' 
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                            }`}
                          >
                            <CheckCircle size={12} />
                            {isSecRead ? 'Read Completed' : 'Mark Completed'}
                          </button>

                          <button
                            onClick={() => runAssistantTool('explain')}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-[#E0A96D] border border-[#E0A96D]/30 rounded text-xs font-semibold flex items-center gap-1.5 transition"
                          >
                            <Sparkles size={12} /> Simplify Text
                          </button>

                          <button
                            onClick={() => runAssistantTool('upsc_lens')}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-medium flex items-center gap-1.5 transition"
                          >
                            UPSC Lens
                          </button>

                          <button
                            onClick={() => runAssistantTool('socratic')}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-medium flex items-center gap-1.5 transition"
                          >
                            Socratic Prompts
                          </button>

                          <button
                            onClick={() => runAssistantTool('mcq')}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-medium flex items-center gap-1.5 transition"
                          >
                            Make MCQ
                          </button>

                          <button
                            onClick={() => runAssistantTool('mains_prompt')}
                            className="px-3 py-1.5 bg-[#E0A96D]/15 hover:bg-[#E0A96D]/25 text-[#E0A96D] border border-[#E0A96D]/30 rounded text-xs font-bold flex items-center gap-1 transition"
                          >
                            Mains Fodder
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          {/* TAB 2: LESSON SLIDES MODE */}
          {activeTab === 'lesson' && (
            <div className="max-w-xl mx-auto flex flex-col justify-between min-h-[460px] bg-slate-900/20 p-6 rounded-lg border border-[#3A506B]/30 relative">
              <div className="absolute top-2 right-4 text-xs font-mono text-slate-400">
                Lesson Slide: {activeSlideIdx + 1} of {currentLesson?.slides.length || 0}
              </div>

              {currentLesson ? (
                <div className="flex-1 flex flex-col justify-between mt-4">
                  <div>
                    <h3 className="font-serif text-[#E0A96D] font-bold text-xs uppercase tracking-wider mb-2">
                      {currentLesson.title}
                    </h3>
                    
                    {/* Title */}
                    <h4 className="text-xl font-semibold text-white tracking-tight leading-snug mb-4">
                      {currentSlide?.title}
                    </h4>

                    {/* Content formatted */}
                    <div className="bg-slate-950/40 p-4 border border-[#3A506B]/20 rounded text-sm text-slate-200 space-y-3 leading-relaxed whitespace-pre-line font-serif">
                      {currentSlide?.content}
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-mono">
                        Type: <span className="uppercase text-[#E0A96D] font-semibold">{currentSlide?.type}</span>
                      </span>
                      
                      <button
                        onClick={() => currentSlide && handleToggleSlideCompletion(currentSlide.id)}
                        className={`text-xs px-2.5 py-1 rounded-full flex items-center gap-1 border ${
                          currentSlide && completedSlides[currentSlide.id]
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        <Check size={12} /> 
                        {currentSlide && completedSlides[currentSlide.id] ? "Completed" : "Mark Accomplished"}
                      </button>
                    </div>
                  </div>

                  {/* Slides Controls */}
                  <div className="flex items-center justify-between border-t border-slate-800/50 pt-4 mt-8">
                    <button
                      onClick={() => setActiveSlideIdx(prev => Math.max(0, prev - 1))}
                      disabled={activeSlideIdx === 0}
                      className={`text-xs font-semibold px-3 py-1.5 rounded ${activeSlideIdx === 0 ? 'text-slate-600' : 'text-slate-300 hover:text-white bg-slate-800'}`}
                    >
                      Previous
                    </button>

                    <div className="flex gap-1.5">
                      {currentLesson.slides.map((_, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => setActiveSlideIdx(idx)}
                          className={`h-1.5 rounded-full cursor-pointer transition ${idx === activeSlideIdx ? 'w-6 bg-[#E0A96D]' : 'w-2 bg-slate-700'}`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        if (activeSlideIdx < currentLesson.slides.length - 1) {
                          setActiveSlideIdx(p => p + 1);
                        } else if (activeLessonIdx < (chapter.lessonMode?.lessons.length || 1) - 1) {
                          setActiveLessonIdx(p => p + 1);
                          setActiveSlideIdx(0);
                        }
                      }}
                      className="text-xs font-bold text-[#E0A96D] px-3 py-1.5 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700"
                    >
                      {activeSlideIdx === currentLesson.slides.length - 1 ? "Next Lesson" : "Next Slide"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 text-slate-400">
                  <FileText size={32} className="mx-auto text-slate-600 mb-2" />
                  <p className="text-sm">No Lesson Slides embedded. Use the AI Simplify tool on Read mode or Import a Chapter JSON with full lesson slide models!</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PYQ MODE */}
          {activeTab === 'pyq' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/40">
                <div>
                  <h3 className="font-serif font-bold text-white text-base">UPSC Official Past Questions</h3>
                  <p className="text-xs text-slate-400">Select answers with confidence. Misconceptions are fed back into Revision lists.</p>
                </div>
                <span className="text-[10px] bg-sky-500/10 text-sky-400 font-mono px-2 py-1 rounded">
                  OFFICIAL UPSC PYQS
                </span>
              </div>

              {(chapter.practice?.mcqs?.length ? chapter.practice.mcqs : DEMO_PYQS_LOCAL).map((pyq) => {
                const answerObj = pyqAnswerState[pyq.id];
                const isCorrect = answerObj?.selected === pyq.answer;

                return (
                  <div key={pyq.id} className="p-5 rounded bg-slate-900/40 border border-[#3A506B]/30 space-y-4">
                    <div className="flex items-center justify-between text-xs text-[#E0A96D] font-mono">
                      <span>Mapped: {pyq.topic || "Union Executive"}</span>
                      <span className="bg-[#E0A96D]/10 px-2 py-0.5 rounded text-white">Year: 2021</span>
                    </div>

                    <p className="text-sm text-slate-100 font-serif leading-relaxed whitespace-pre-line">
                      {pyq.question}
                    </p>

                    <div className="space-y-2 pt-2">
                      {pyq.options.map((opt, oIdx) => {
                        const label = String.fromCharCode(65 + oIdx); // A, B, C, D
                        let optStyle = "bg-slate-800/40 text-slate-200 hover:bg-slate-800 border-transparent";
                        
                        if (answerObj?.answered) {
                          if (label === pyq.answer) {
                            optStyle = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
                          } else if (answerObj.selected === label) {
                            optStyle = "bg-rose-500/10 text-rose-400 border-rose-500/30";
                          }
                        }

                        return (
                          <button
                            key={opt}
                            disabled={answerObj?.answered}
                            onClick={() => handleAnswerPyq(pyq.id, label, 'sure')}
                            className={`w-full p-3 rounded text-left text-xs md:text-sm border transition flex items-center gap-3 ${optStyle}`}
                          >
                            <span className="w-5 h-5 rounded-full bg-slate-950/40 flex items-center justify-center text-[10px] font-bold text-[#E0A96D]">
                              {label}
                            </span>
                            <span className="flex-1">{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {answerObj?.answered && (
                      <div className="p-4 bg-slate-950/50 rounded border border-slate-800/80 text-xs space-y-2 transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <span className={`font-bold flex items-center gap-1 uppercase ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isCorrect ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                            {isCorrect ? 'Correct Answer' : 'Incorrect Assessment'}
                          </span>
                          
                          {!isCorrect && answerObj.confidence === 'sure' && (
                            <span className="bg-rose-500/20 text-rose-300 p-1 px-2 rounded font-mono text-[9px] uppercase tracking-wide border border-rose-500/40 animate-pulse">
                              🔥 Dangerous Misconception Added to Revision!
                            </span>
                          )}
                        </div>
                        <p className="text-slate-300 leading-relaxed font-serif whitespace-pre-line">
                          <strong>Rationale: </strong>{pyq.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 4: CARDS (FLASHCARDS FOR REVISION) */}
          {activeTab === 'cards' && (
            <div className="max-w-md mx-auto flex flex-col items-center space-y-6">
              <div className="text-center">
                <h3 className="font-serif font-bold text-white text-lg">Active Chapter Flashcard Deck</h3>
                <p className="text-xs text-slate-400">Tap to flip. Use Leitner boxes below to score retention schedule.</p>
              </div>

              {chapter.practice?.flashcards?.length ? (
                <div className="w-full flex flex-col items-center space-y-4">
                  {/* The actual Card flipped */}
                  <div 
                    onClick={() => setIsCardFlipped(!isCardFlipped)}
                    className={`w-full min-h-[220px] p-6 rounded-lg cursor-pointer border text-center flex flex-col justify-between transition-all duration-500 transform ${
                      isCardFlipped 
                        ? 'bg-slate-900 border-amber-500 shadow-amber-500/5 rotate-y-180' 
                        : 'bg-slate-900/60 border-slate-700 shadow-sm'
                    }`}
                  >
                    <div className="text-right text-[9px] uppercase tracking-widest text-[#E0A96D] font-mono">
                      {isCardFlipped ? "Back: facts/answers" : "Front: query concept"}
                    </div>

                    <div className="my-auto">
                      <p className="text-base md:text-lg font-serif font-semibold text-slate-100 px-4">
                        {isCardFlipped 
                          ? chapter.practice.flashcards[activeCardIdx]?.back 
                          : chapter.practice.flashcards[activeCardIdx]?.front}
                      </p>
                    </div>

                    <div className="text-xs text-slate-400 font-mono">
                      Tap card to reveal description
                    </div>
                  </div>

                  {/* Evaluation boxes */}
                  <div className="w-full grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={() => {
                        onScheduleCard(chapter.practice!.flashcards![activeCardIdx].id, 'forgotten');
                        setIsCardFlipped(false);
                        if (activeCardIdx < chapter.practice!.flashcards!.length - 1) {
                          setActiveCardIdx(p => p + 1);
                        }
                      }}
                      className="py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded font-medium text-xs text-center"
                    >
                      ❌ Forgot/Fragile
                    </button>
                    
                    <button
                      onClick={() => {
                        onScheduleCard(chapter.practice!.flashcards![activeCardIdx].id, 'strong');
                        setIsCardFlipped(false);
                        if (activeCardIdx < chapter.practice!.flashcards!.length - 1) {
                          setActiveCardIdx(p => p + 1);
                        }
                      }}
                      className="py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded font-bold text-xs text-center"
                    >
                      ✓ Remembered
                    </button>
                  </div>

                  <div className="w-full flex justify-between items-center text-xs text-slate-500">
                    <button 
                      onClick={() => {
                        setIsCardFlipped(false);
                        setActiveCardIdx(p => Math.max(0, p - 1));
                      }}
                      className="hover:text-white"
                      disabled={activeCardIdx === 0}
                    >
                      Previous card
                    </button>
                    <span>Card {activeCardIdx + 1} of {chapter.practice.flashcards.length}</span>
                    <button 
                      onClick={() => {
                        setIsCardFlipped(false);
                        setActiveCardIdx(p => Math.min(chapter.practice!.flashcards!.length - 1, p + 1));
                      }}
                      className="hover:text-white"
                      disabled={activeCardIdx === chapter.practice.flashcards.length - 1}
                    >
                      Next card
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 text-slate-400 bg-slate-900/30 w-full rounded border border-slate-800">
                  <FileText size={32} className="mx-auto text-slate-600 mb-2" />
                  <p className="text-sm">No flashcards loaded in this file. Try the AI Flashcard creator tab on Read Mode!</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PRACTICE TEST */}
          {activeTab === 'test' && (
            <div className="max-w-xl mx-auto bg-slate-900/30 p-6 rounded-lg border border-[#3A506B]/30">
              {testState === 'setup' && (
                <div className="text-center space-y-4">
                  <Swords size={44} className="mx-auto text-[#E0A96D]" />
                  <h3 className="font-serif text-lg font-bold text-white">Interactive Chapter Assessment</h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                    Synthesizes a 5-question test specifically from this chapter. Standard scoring applies (2 marks, -0.66 penalty for wrong).
                  </p>
                  <button 
                    id="reader-start-test-btn"
                    onClick={handleStartChapterTest}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#D97706] to-[#E0A96D] hover:from-[#B45309] hover:to-[#D97706] text-slate-950 rounded font-bold text-xs uppercase tracking-wide"
                  >
                    Launch Practice Exam
                  </button>
                </div>
              )}

              {testState === 'active' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono border-b border-slate-800 pb-2">
                    <span>Chapter Test Active</span>
                    <span>Q Count: {testQuestions.length} Items</span>
                  </div>

                  {testQuestions.map((q, idx) => {
                    const chosen = testAnswers[q.id];
                    return (
                      <div key={q.id} className="p-4 bg-slate-900/20 border border-slate-700/30 rounded space-y-3">
                        <p className="text-sm text-slate-100 font-serif font-bold">
                          Q {idx + 1}. {q.question}
                        </p>

                        <div className="grid grid-cols-1 gap-2 pt-1">
                          {q.options.map((opt, oIdx) => {
                            const optLabel = String.fromCharCode(65 + oIdx);
                            const isSelected = chosen === optLabel;
                            return (
                              <button
                                key={opt}
                                onClick={() => setTestAnswers(prev => ({ ...prev, [q.id]: optLabel }))}
                                className={`p-2.5 text-left text-xs rounded border transition flex items-center gap-2 ${
                                  isSelected 
                                    ? 'bg-[#E0A96D]/15 text-[#E0A96D] border-[#E0A96D]/45' 
                                    : 'bg-slate-900 text-slate-300 border-transparent hover:bg-slate-800'
                                }`}
                              >
                                <span className="w-4 h-4 rounded-full bg-slate-950 flex items-center justify-center text-[9px] font-bold text-[#E0A96D]">
                                  {optLabel}
                                </span>
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Confidence score toggle */}
                        <div className="flex justify-end gap-1.5 pt-1 text-[9px] font-mono">
                          <span className="text-slate-500 self-center">Confidence:</span>
                          {(['sure', 'somewhat', 'guess'] as const).map(conf => (
                            <button
                              key={conf}
                              onClick={() => setTestConfidence(prev => ({ ...prev, [q.id]: conf }))}
                              className={`px-2 py-0.5 rounded capitalize ${
                                testConfidence[q.id] === conf 
                                  ? 'bg-[#E0A96D] text-slate-950' 
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {conf}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  <button
                    onClick={calculateTestScore}
                    className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-xs uppercase"
                  >
                    Submit Test & Analyse Scoring
                  </button>
                </div>
              )}

              {testState === 'review' && testResult && (
                <div className="space-y-6 text-center">
                  <div className="p-4 bg-slate-950/40 rounded border border-slate-700/30 inline-block px-10">
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-mono">My Marks</p>
                    <h4 className="text-3xl font-serif font-black text-white py-1">{testResult.score} / 10</h4>
                    <p className="text-[10px] text-slate-500 mt-1">Accuracy: {testResult.accuracy}%</p>
                  </div>

                  <div className="text-left space-y-4">
                    <h5 className="font-serif font-bold text-white text-sm border-b border-slate-800 pb-2">Analysis List</h5>
                    
                    {testQuestions.map((q, idx) => {
                      const userAns = testAnswers[q.id];
                      const isCorrect = userAns === q.answer;
                      return (
                        <div key={q.id} className="p-3 bg-slate-900/60 rounded text-xs space-y-1">
                          <p className="font-medium text-slate-200">
                            {idx + 1}. {q.question.split('\n')[0]}...
                          </p>
                          <div className="flex justify-between font-mono text-[10px] text-slate-400">
                            <span>Answered: <strong className={isCorrect ? 'text-emerald-400' : 'text-rose-400'}>{userAns || "Skipped"}</strong></span>
                            <span>Correct: <strong className="text-[#E0A96D]">{q.answer}</strong></span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setTestState('setup')}
                    className="px-6 py-2 bg-slate-800 text-white rounded text-xs"
                  >
                    Retake Test
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: SECTION NOTES */}
          {activeTab === 'notes' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="pb-3 border-b border-slate-800/40">
                <h3 className="font-serif font-bold text-white text-base">Section-Specific Notes & Doubts</h3>
                <p className="text-xs text-slate-400">Save notes or mark doubts for resolution. Doubts populate the unsolved Doubt Bank.</p>
              </div>

              {/* Creator */}
              <div className="p-4 bg-slate-900/30 rounded border border-slate-700/30 space-y-3">
                <label className="text-xs text-slate-300 block font-medium">Create Note for: <code className="text-[#E0A96D]">{currentSection?.title}</code></label>
                <textarea
                  value={sectionNoteText}
                  onChange={(e) => setSectionNoteText(e.target.value)}
                  placeholder="Paste legal excerpts, summarize concepts in own simpler words, or flag unresolved question indicators..."
                  rows={4}
                  className="w-full text-xs p-3 rounded bg-slate-950/60 text-slate-100 border border-[#3A506B]/20 focus:outline-none focus:border-[#E0A96D]/60"
                />

                <div className="flex items-center justify-between">
                  {/* Mark as Doubt */}
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={sectionDoubtFlag}
                      onChange={(e) => setSectionDoubtFlag(e.target.checked)}
                      className="accent-[#E0A96D]"
                    />
                    <span>Unresolved Doubt / Candidate Trap</span>
                  </label>

                  <button
                    onClick={handleSaveSectionNote}
                    className="px-4 py-2 bg-gradient-to-r from-[#D97706] to-[#E0A96D] hover:from-[#B45309] hover:to-[#D97706] text-slate-950 rounded font-bold text-xs flex items-center gap-1.5"
                  >
                    <Save size={12} /> Save Note
                  </button>
                </div>
              </div>

              {/* Existing notes list */}
              <div className="space-y-3">
                <h4 className="text-xs text-slate-400 font-mono">Stored Notes within this Section ({currentChapterNotes.length})</h4>
                {currentChapterNotes.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No notes created yet for this specific section.</p>
                ) : (
                  currentChapterNotes.map((note) => (
                    <div key={note.id} className="p-4 bg-slate-900/40 rounded border border-slate-800 space-y-2 relative">
                      <button
                        onClick={() => onDeleteNote(note.id)}
                        className="absolute top-3 right-3 p-1 rounded text-slate-500 hover:text-rose-400 transition"
                      >
                        <Trash2 size={13} />
                      </button>

                      <div className="flex items-center gap-2">
                        {note.isDoubt && (
                          <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${note.isResolved ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                            {note.isResolved ? '✓ Resolved Doubt' : '⚠️ Unresolved Doubt'}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed font-serif whitespace-pre-wrap">
                        {note.text}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 7: CURRENT AFFAIRS BRIDGE */}
          {activeTab === 'ca' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="pb-3 border-b border-slate-800/40">
                <h3 className="font-serif font-bold text-white text-base">Current Affairs Custom Bridge</h3>
                <p className="text-xs text-slate-400">Paste UPSC relevant current affair notes, PIB articles, or newspapers. Classified findings append automatically.</p>
              </div>

              <div className="p-4 bg-slate-900/30 rounded border border-slate-700/30 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 block font-medium">Paste News Article / Note</label>
                  <textarea
                    value={caText}
                    onChange={(e) => setCaText(e.target.value)}
                    placeholder="E.g., 2026 Presidential electoral adjustments proposed in legislature following census update guidelines..."
                    rows={4}
                    className="w-full text-xs p-3 rounded bg-slate-950/60 text-slate-100 border border-[#3A506B]/20 focus:outline-none focus:border-[#E0A96D]/60"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400">Mapped subject: {chapter.metadata.subject}</span>
                  <button
                    onClick={handleClassifyCurrentAffairs}
                    disabled={caClassifyLoading}
                    className="px-4 py-2 bg-[#E0A96D] hover:bg-[#D97706] text-slate-950 rounded font-bold text-xs flex items-center gap-1"
                  >
                    {caClassifyLoading ? "Analyzing..." : "Link With Chapter"}
                  </button>
                </div>
              </div>

              {caStructuredOutput && (
                <div className="p-4 bg-amber-500/5 rounded border border-[#E0A96D]/40 space-y-3 text-xs">
                  <div className="flex items-center gap-1.5 text-[#E0A96D] font-bold">
                    <Sparkles size={14} /> METADATA UPSC AUTOMATIC BRIDGE CLASSIFICATION
                  </div>

                  {caStructuredOutput.rawAI ? (
                    <div className="p-3 bg-slate-950/40 rounded border border-slate-800/60 text-slate-300 whitespace-pre-wrap font-serif">
                      {caStructuredOutput.rawAI}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      <div className="space-y-1 bg-slate-950/30 p-2.5 rounded border border-slate-800/40">
                        <span className="text-slate-400 font-bold block">Syllabus Area:</span>
                        <p className="text-slate-200">{caStructuredOutput.syllabusArea}</p>
                      </div>
                      <div className="space-y-1 bg-slate-950/30 p-2.5 rounded border border-slate-800/40">
                        <span className="text-slate-400 font-bold block">Prelims Lens:</span>
                        <p className="text-slate-200">{caStructuredOutput.prelimsFact}</p>
                      </div>
                      <div className="space-y-1 bg-slate-950/30 p-2.5 rounded border border-slate-800/40">
                        <span className="text-slate-400 font-bold block">Mains Dimension:</span>
                        <p className="text-slate-200">{caStructuredOutput.mainsIssue}</p>
                      </div>
                      <div className="space-y-1 bg-slate-950/30 p-2.5 rounded border border-slate-800/40 col-span-1 md:col-span-2">
                        <span className="text-[#E0A96D] font-bold block">20-Word Flash Revision:</span>
                        <p className="text-slate-100 italic">"{caStructuredOutput.revisionNote20Words}"</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </main>

        {/* --- RIGHT SIDE: ACTIVE AI TOOLS & ASSISTANT DRAWER PANEL --- */}
        <aside className="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-800 bg-[#111827]/45 p-4 overflow-y-auto space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 text-xs font-serif uppercase tracking-wider text-[#E0A96D] font-bold">
              <Sparkles size={14} className="text-[#E0A96D]" /> MENTOR INTELLIGENCE
            </div>

            {/* Custom Prompt Input */}
            <div className="p-3 rounded bg-slate-900 border border-slate-800 space-y-2">
              <label className="text-[10px] text-slate-400 font-mono block">Ask custom UPSC question regarding active section</label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={customAiPrompt}
                  onChange={(e) => setCustomAiPrompt(e.target.value)}
                  placeholder="List historical amendments / compare with US"
                  className="flex-1 text-xs bg-slate-950 p-2 rounded text-white border border-slate-850 focus:outline-none"
                />
                <button
                  onClick={() => runAssistantTool('custom', customAiPrompt)}
                  className="p-2 bg-[#E0A96D] hover:bg-[#D97706] text-slate-950 rounded flex items-center justify-center transition"
                >
                  <Send size={12} />
                </button>
              </div>
            </div>

            {/* AI Assistant Output Card */}
            {assistantLoading ? (
              <div className="p-4 rounded border border-slate-800 bg-slate-950/30 text-center space-y-2 animate-pulse">
                <Clock size={20} className="mx-auto text-[#E0A96D] animate-spin" />
                <p className="text-xs text-slate-400 font-mono">Mapping constitutional variables via Gemini...</p>
              </div>
            ) : assistantOutput ? (
              <div className="p-4 rounded bg-slate-950/60 border border-[#E0A96D]/30 space-y-2.5 max-h-[360px] overflow-y-auto">
                <div className="flex items-center justify-between text-[10px] pb-1.5 border-b border-slate-850">
                  <span className="font-serif font-bold text-[#E0A96D]">{assistantOutput.title}</span>
                  <span className="bg-[#E0A96D]/15 text-[#E0A96D] px-1.5 py-0.5 rounded font-mono">AI Generated</span>
                </div>
                <div className="text-xs text-slate-200 leading-relaxed font-serif whitespace-pre-line">
                  {assistantOutput.content}
                </div>
                <button
                  onClick={() => {
                    onSaveNote({
                      chapterId: chapter.metadata.id,
                      sectionId: selectedSectionId,
                      title: `AI Assist: ${assistantOutput.title}`,
                      text: `[${assistantOutput.title} on Section: ${currentSection?.title}]\n\n${assistantOutput.content}`,
                      isDoubt: false,
                      isResolved: true
                    });
                    setAssistantOutput(null);
                  }}
                  className="w-full text-[10px] uppercase font-bold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-850 p-1.5 rounded text-center transition"
                >
                  Save Output to my Section Notes
                </button>
              </div>
            ) : (
              <div className="p-4 rounded bg-slate-950/20 text-center border border-dashed border-slate-800 text-slate-500">
                <CpuIcon size={24} className="mx-auto text-slate-600 mb-2" />
                <p className="text-xs">No active AI assist generated yet. Tap any tool below the section text blocks to invoke premium Gemini guidance.</p>
              </div>
            )}
          </div>

          {/* Quick Stats sidebar footer */}
          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded space-y-2 text-xs">
            <span className="text-[#E0A96D] font-bold block font-serif">Local Retention Metrics</span>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
              <div>
                <span>Chapter Read:</span>
                <p className="text-white font-bold">
                  {Object.keys(readSections).length} / {chapter.sections.length} Sections
                </p>
              </div>
              <div>
                <span>Notes Count:</span>
                <p className="text-white font-bold">
                  {notes.filter(n => n.chapterId === chapter.metadata.id).length} Saved
                </p>
              </div>
              <div>
                <span>PYQ Answered:</span>
                <p className="text-white font-bold">
                  {Object.keys(pyqAnswerState).length} Answered
                </p>
              </div>
              <div>
                <span>Flashcards due:</span>
                <p className="text-white font-bold">
                  {cardSchedules.filter(c => c.chapterId === chapter.metadata.id).length} Active
                </p>
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}

// Simple Helper Lucide substitution
function CpuIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="16" height="16" x="4" y="4" rx="2" />
      <rect width="6" height="6" x="9" y="9" rx="1" />
      <path d="M9 1v3" />
      <path d="M15 1v3" />
      <path d="M9 20v3" />
      <path d="M15 20v3" />
      <path d="M20 9h3" />
      <path d="M20 15h3" />
      <path d="M1 9h3" />
      <path d="M1 15h3" />
    </svg>
  );
}

const DEMO_PYQS_LOCAL = [
  {
    id: "mcq-pres-001",
    question: "With reference to the election of the President of India, consider the following statements:\n1. The value of the vote of each MLA varies from State to State.\n2. The value of the vote of MPs of the Lok Sabha is more than the value of the vote of MPs of the Rajya Sabha.\n\nWhich of the statements given above is/are correct?",
    options: ["1 only", "2 only", "Both 1 and 2", "Neither 1 nor 2"],
    answer: "A",
    explanation: "Value of vote of each MLA depends on population of states and varies (UP value 208, Sikkim value 7). All elected MPs have equal vote value calculated from total value of MLA votes divided by total elected MPs.",
    topic: "Electoral Math"
  },
  {
    id: "mcq-pres-002",
    question: "Which of the following elements does NOT form part of the Electoral College for the election of the President of India?\n1. Nominated members of Lok Sabha\n2. Elected members of legislative councils of states\n3. Nominated members of Delhi and Puducherry assemblies\n\nSelect the correct answer using the codes below:",
    options: ["1 and 2 only", "2 and 3 only", "1 and 3 only", "1, 2 and 3"],
    answer: "D",
    explanation: "Nominated MPs, nominated MLAs, and all Members of state Legislative Councils (MLCs) are excluded from voting in the Presidential Election."
  }
];
