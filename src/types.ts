/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// --- CHAPTER SCHEMA ---

export interface SectionAssistant {
  simpleExplanation?: string;
  prelimsLens?: string;
  mainsLens?: string;
  trapAlerts?: string[];
  socraticPrompts?: string[];
  linkedPYQs?: string[];
  revisionCards?: any[];
  currentAffairsLinks?: any[];
}

export interface ChapterSection {
  id: string;
  title: string;
  level: number;
  pageHint?: string;
  sourceText: string;
  tables?: any[];
  images?: any[];
  footnotes?: string[];
  assistant?: SectionAssistant;
}

export interface LessonSlide {
  id: string;
  type: 'concept' | 'trap' | 'pyq' | 'mains' | 'comparison' | 'flowchart' | 'timeline' | 'revision';
  title: string;
  content: string;
  linkedSectionIds?: string[];
}

export interface Lesson {
  id: string;
  title: string;
  slides: LessonSlide[];
}

export interface PracticeMcq {
  id: string;
  question: string;
  options: string[];
  answer: string; // "A", "B", "C", "D"
  explanation: string;
  topic?: string;
}

export interface PracticeMainsQuestion {
  id: string;
  question: string;
  tokens?: string[];
  modelAnswerSketch?: string;
  guidelines?: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category?: 'article' | 'definition' | 'comparison' | 'timeline' | 'trap';
}

export interface PracticeMode {
  mcqs?: PracticeMcq[];
  mainsQuestions?: PracticeMainsQuestion[];
  flashcards?: Flashcard[];
}

export interface ChapterMetadata {
  id: string;
  app: string;
  book: string;
  author: string;
  edition?: string;
  subject: string;
  paper?: string;
  chapterNumber: number;
  chapterTitle: string;
  part?: string;
  pageStart?: number;
  pageEnd?: number;
  tags?: string[];
}

export interface ChapterJson {
  schemaVersion: string;
  type: 'chapter';
  metadata: ChapterMetadata;
  sections: ChapterSection[];
  lessonMode?: {
    lessons: Lesson[];
  };
  practice?: PracticeMode;
}

// --- PYQ BANK SCHEMA ---

export interface PyqItem {
  id: string;
  year: number;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  subject: string;
  topic?: string;
  subtopic?: string;
  linkedChapterIds?: string[];
  tags?: string[];
}

export interface PyqBankJson {
  schemaVersion: string;
  type: 'pyqBank';
  metadata: {
    subject: string;
    exam: string;
    years: string;
  };
  pyqs: PyqItem[];
}

// --- APP LOCAL STATE / LOCAL STORAGE PERSISTENCE MODELS ---

export interface SubjectFolder {
  id: string;
  name: string;
  isDefault: boolean;
  iconName: string;
}

export interface StudyActivity {
  date: string; // YYYY-MM-DD
  minutes: number;
  chaptersCompleted: number;
  pyqsAttempted: number;
  cardsReviewed: number;
}

export interface SearchResult {
  id: string;
  type: 'chapter' | 'section' | 'note' | 'pyq' | 'flashcard' | 'ca';
  subject: string;
  chapterTitle: string;
  targetId: string; // Section ID / PYQ ID etc
  title: string;
  snippet: string;
}

export interface AppNote {
  id: string;
  chapterId: string;
  sectionId: string;
  title: string;
  text: string;
  isDoubt: boolean;
  isResolved: boolean;
  createdAt: string;
}

export interface HighlightBookmark {
  id: string;
  chapterId: string;
  sectionId: string;
  textSelection?: string; // If highlight, text; if empty, bookmark
  color?: string; // for highlights
  createdAt: string;
}

export interface PyqAttempt {
  pyqId: string;
  userAnswer: string;
  isCorrect: boolean;
  confidence: 'sure' | 'somewhat' | 'guess' | 'unknown';
  timestamp: string;
}

// Spaced repetition flashcard schedule
export interface CardSchedule {
  cardId: string;
  chapterId: string;
  box: number; // 0 to 5 (leitner scale or simplified card status)
  dueDate: string; // YYYY-MM-DD
  status: 'new' | 'fragile' | 'stable' | 'strong' | 'misconception' | 'forgotten';
}

export interface CurrentAffairsNote {
  id: string;
  title: string;
  text: string;
  subject?: string;
  linkedChapterId?: string;
  syllabusArea?: string;
  prelimsFact?: string;
  mainsIssue?: string;
  upscAngle?: string;
  revisionNote20Words?: string;
  createdAt: string;
}

export interface UserSettings {
  fontSize: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  lineSpacing: 'compact' | 'normal' | 'relaxed' | 'spacious';
  paragraphSpacing: 'compact' | 'normal' | 'spacious';
  fontFamily: 'sans' | 'serif' | 'academic' | 'dyslexic' | 'mono';
  theme: 'scholar' | 'sepia' | 'clean' | 'night' | 'forest' | 'highcontrast';
}
