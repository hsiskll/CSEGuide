/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  FileCheck, FileWarning, Clipboard, Plus, ShieldCheck, CheckCircle2,
  Table, Sparkles, BookOpen, FileCode, Check, AlertTriangle
} from "lucide-react";
import { ChapterJson } from "../types";
import { DEMO_CHAPTER_POLITY, DEMO_PYQS } from "../data";

interface JsonImporterProps {
  onImportChapter: (chapter: ChapterJson, overwritePolicy?: 'replace' | 'keep_both' | 'cancel') => void;
  existingChapters: ChapterJson[];
}

export default function JsonImporter({ onImportChapter, existingChapters }: JsonImporterProps) {
  const [jsonText, setJsonText] = useState<string>("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<ChapterJson | null>(null);
  const [pastedStatus, setPastedStatus] = useState<boolean>(false);

  const validateAndSetupPreview = (rawText: string) => {
    setValidationError(null);
    setParsedPreview(null);
    
    if (!rawText.trim()) return;

    try {
      const obj = JSON.parse(rawText);

      // Validate base schema fields
      if (!obj.schemaVersion) {
        setValidationError("Schema version is missing. Expected '1.0'.");
        return;
      }
      if (obj.type !== "chapter") {
        setValidationError("Unknown package type. Expected 'chapter'.");
        return;
      }
      if (!obj.metadata?.id || !obj.metadata?.chapterTitle || !obj.metadata?.subject) {
        setValidationError("Required Chapter Metadata is missing (id, chapterTitle, subject are mandatory).");
        return;
      }
      if (!Array.isArray(obj.sections) || obj.sections.length === 0) {
        setValidationError("No syllabus text sections list found in this chapter.");
        return;
      }

      setParsedPreview(obj);
    } catch (e: any) {
      setValidationError(`Syntax Error. Invalid JSON format: ${e.message}`);
    }
  };

  const handleTextChange = (val: string) => {
    setJsonText(val);
    validateAndSetupPreview(val);
  };

  const handleLoadDemoChapter = () => {
    const demoString = JSON.stringify(DEMO_CHAPTER_POLITY, null, 2);
    setJsonText(demoString);
    validateAndSetupPreview(demoString);
    setPastedStatus(true);
  };

  const triggerConfirmImport = () => {
    if (!parsedPreview) return;

    // Check key duplicate conflicts
    const isDuplicate = existingChapters.some(c => c.metadata.id === parsedPreview.metadata.id);
    if (isDuplicate) {
      const policy = confirm(`Conflict detected: Chapter titled "${parsedPreview.metadata.chapterTitle}" is already imported. Do you want to REPLACE the existing chapter? Click OK to Replace, Cancel to keep both.`)
        ? "replace"
        : "keep_both";
      
      onImportChapter(parsedPreview, policy);
    } else {
      onImportChapter(parsedPreview);
    }

    // Reset fields
    setJsonText("");
    setParsedPreview(null);
    setPastedStatus(false);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-4 md:p-6 pb-20">
      
      {/* Importer greeting */}
      <div className="space-y-1.5 border-b border-slate-800 pb-3">
        <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
          <FileCode size={20} className="text-[#E0A96D]" /> JSON Material Import Deck
        </h2>
        <p className="text-xs text-slate-400">
          Load structured UPSC chapters, syllabus units, or custom test banks legally sourced from your text documents.
        </p>
      </div>

      {/* Upload types / buttons selector */}
      <div className="flex gap-2">
        <button
          onClick={handleLoadDemoChapter}
          className="flex-1 py-3 px-4 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded font-bold text-xs text-[#E0A96D] transition flex items-center justify-center gap-2"
        >
          <Sparkles size={14} /> Populate Demo Chapter ("President")
        </button>

        <button
          onClick={async () => {
            try {
              const clip = await navigator.clipboard.readText();
              handleTextChange(clip);
              setPastedStatus(true);
            } catch (e) {
              alert("Could not access clipboards instantly. Please manually paste raw JSON contents into the text area!");
            }
          }}
          className="flex-1 py-3 px-4 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded font-semibold text-xs text-slate-300 transition flex items-center justify-center gap-2"
        >
          <Clipboard size={14} /> Paste from Clipboard
        </button>
      </div>

      {/* Editor block */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Active JSON Content Editor</span>
          {pastedStatus && <span className="text-emerald-400 font-bold">✓ Source Loaded Succesfully</span>}
        </div>
        
        <textarea
          value={jsonText}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder='{"schemaVersion": "1.0", "type": "chapter", "metadata": { "id":"polity-pres", "chapterTitle":"President" }...}'
          className="w-full h-44 text-xs font-mono p-4 rounded bg-slate-950 border border-[#3A506B]/20 text-slate-300 focus:outline-none focus:border-[#E0A96D]/60"
        />
      </div>

      {/* Parsing validations / preview screen */}
      {validationError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 rounded-lg flex items-start gap-2">
          <FileWarning className="shrink-0 text-rose-400" size={16} />
          <div>
            <strong className="block font-bold mb-0.5 font-serif">Schema Validation Failed</strong>
            <p className="leading-relaxed">{validationError}</p>
          </div>
        </div>
      )}

      {parsedPreview && (
        <div className="p-5 bg-emerald-500/5 rounded-lg border border-emerald-500/25 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-serif font-bold text-sm">
            <CheckCircle2 size={16} /> VALIDATION SUCCESSFUL - READY TO HYDRATE
          </div>

          <div className="text-xs text-slate-300 grid grid-cols-2 gap-y-3 gap-x-4">
            <div>
              <span className="text-slate-500 font-mono block">Book / Textbook Source</span>
              <p className="text-slate-100 font-bold">{parsedPreview.metadata.book} ({parsedPreview.metadata.author})</p>
            </div>
            <div>
              <span className="text-slate-500 font-mono block">Syllabus Subject Topic</span>
              <p className="text-slate-100 font-bold">{parsedPreview.metadata.subject}</p>
            </div>
            <div>
              <span className="text-slate-500 font-mono block">Chapter Title</span>
              <p className="text-[#E0A96D] font-serif font-bold text-base">Ch {parsedPreview.metadata.chapterNumber}. {parsedPreview.metadata.chapterTitle}</p>
            </div>
            <div>
              <span className="text-slate-500 font-mono block">Tags</span>
              <p className="text-slate-200">{parsedPreview.metadata.tags?.join(", ") || "None specified"}</p>
            </div>
          </div>

          {/* Stats counts banner */}
          <div className="p-3 bg-slate-950/40 rounded border border-slate-800 grid grid-cols-4 gap-2 text-center text-xs">
            <div>
              <span className="block text-slate-500 font-mono text-[9px] uppercase">Sections</span>
              <strong className="text-white font-bold">{parsedPreview.sections.length} Units</strong>
            </div>
            <div>
              <span className="block text-slate-500 font-mono text-[9px] uppercase">Slides</span>
              <strong className="text-white font-bold">
                {parsedPreview.lessonMode?.lessons[0]?.slides.length || 0} Slides
              </strong>
            </div>
            <div>
              <span className="block text-slate-500 font-mono text-[9px] uppercase">PYQs</span>
              <strong className="text-white font-bold">{parsedPreview.practice?.mcqs?.length || 0} Mapped</strong>
            </div>
            <div>
              <span className="block text-slate-500 font-mono text-[9px] uppercase">Flashcards</span>
              <strong className="text-white font-bold">{parsedPreview.practice?.flashcards?.length || 0} Flash</strong>
            </div>
          </div>

          <button
            onClick={triggerConfirmImport}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 font-bold text-white uppercase rounded text-xs tracking-wider transition shadow-lg"
          >
            Confirm Syllabus Import & Assign Folder
          </button>
        </div>
      )}

      {/* Safety guidelines Box */}
      <div className="p-4 bg-[#E0A96D]/5 border border-[#E0A96D]/15 rounded-lg text-xs space-y-2 mt-4 text-slate-300">
        <div className="flex items-center gap-1.5 text-[#E0A96D] font-bold font-serif uppercase">
          <ShieldCheck size={14} /> Personal Device Protection Security Checklist
        </div>
        <p className="leading-relaxed font-serif">
          CSEGuide strictly preserves local-first behavior. Your pasted text or files are parsed and nested directly inside your browser cache (<strong className="text-slate-100">LocalStorage/IndexedDB</strong>). No telemetry parameters are emitted, keeping your preparation isolated.
        </p>
      </div>

    </div>
  );
}
