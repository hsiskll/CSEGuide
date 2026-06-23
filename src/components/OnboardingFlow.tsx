/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { BookOpen, HelpCircle, HardDrive, FolderKanban, Sparkles, ChevronRight, ChevronLeft, Landmark } from "lucide-react";

interface OnboardingFlowProps {
  onComplete: (action: 'explore_demo' | 'import_now' | 'dashboard') => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<number>(1);

  const totalSteps = 5;

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 flex flex-col items-center justify-center p-4">
      {/* Visual Header Decoration */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 rounded bg-[#E0A96D]/10 border border-[#E0A96D]/40 flex items-center justify-center text-[#E0A96D]">
          <Landmark size={22} id="onboarding-logo-icon" />
        </div>
        <span className="font-serif text-2xl font-bold uppercase tracking-widest text-slate-100">
          CSE<span className="text-[#E0A96D]">Guide</span>
        </span>
      </div>

      {/* Main Stepper Card */}
      <div className="w-full max-w-lg bg-[#1C2541] border border-[#3A506B]/50 rounded-lg p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[440px]">
        
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#E0A96D]/5 rounded-full blur-2xl pointer-events-none" />

        {/* Dynamic Screens */}
        <div className="flex-1 flex flex-col">
          {step === 1 && (
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 rounded-full bg-[#E0A96D]/10 text-[#E0A96D] mb-2 border border-[#E0A96D]/20">
                <BookOpen size={40} />
              </div>
              <h2 className="text-2xl font-serif font-semibold tracking-tight text-white mb-2">
                Welcome to CSEGuide
              </h2>
              <p className="text-lg text-[#E0A96D] font-medium italic">
                “Your personal UPSC CSE Smart Reader.”
              </p>
              <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
                A serious, local-first reading and revision companion tailored specifically for UPSC Civil Services scholars. Designed for complete offline retention.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col space-y-4 mb-4">
              <h3 className="text-xl font-serif font-semibold text-white text-center pb-2 border-b border-[#3A506B]/30">
                How CSEGuide Works
              </h3>
              <ul className="space-y-4 pt-2">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold mt-0.5">1</div>
                  <div>
                    <strong className="text-slate-100 text-sm">Import Source JSON</strong>
                    <p className="text-xs text-slate-300">Load structured chapters or PYQ sets legally sourced or pre-formatted from your PDFs.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold mt-0.5">2</div>
                  <div>
                    <strong className="text-slate-100 text-sm">Active & Focused Reading</strong>
                    <p className="text-xs text-slate-300">Read unmodified original text in our eye-care reader. Access simplifying, trap-alerts, and notes instantly.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold mt-0.5">3</div>
                  <div>
                    <strong className="text-slate-100 text-sm">Multi-Mode Learning Suite</strong>
                    <p className="text-xs text-slate-300">Switch tabs seamlessly to study lesson slides, official PYQs, dynamic tests, or smart flashcards about the active section.</p>
                  </div>
                </li>
              </ul>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 mb-1">
                <HardDrive size={34} />
              </div>
              <h3 className="text-xl font-serif font-semibold text-white">
                Personal-Use Disclaimer
              </h3>
              <div className="bg-slate-900/40 p-4 rounded text-left space-y-3 border border-[#3A506B]/30 text-xs text-slate-300 max-w-md">
                <p>
                  • <strong className="text-slate-100">Absolute Privacy:</strong> All materials you read are saved solely on your device. CSEGuide has no personal cloud storage, never tracks or uploads your readings or notes to any external databases.
                </p>
                <p>
                  • <strong className="text-slate-100">Copyright Safe:</strong> The application does NOT pre-bundle copyrighted books or answers. It acts exclusively as an offline processing utility reader for your own material.
                </p>
                <p>
                  • <strong className="text-slate-100">Personal Study:</strong> Intended for individual study use only. There are no social networks, leaderboards, public uploads, sharing features, or hidden coach platform modules.
                </p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col space-y-4 mb-4">
              <h3 className="text-xl font-serif font-semibold text-white text-center pb-2 border-b border-[#3A506B]/30">
                UPSC Standard Folders
              </h3>
              <div className="flex items-start gap-4 p-4 rounded bg-[#0B132B] border border-[#3A506B]/35">
                <div className="text-[#E0A96D]"><FolderKanban size={34} /></div>
                <div>
                  <p className="text-sm text-slate-100 font-medium">Automatic Folder Allocation</p>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    CSEGuide initializes 18 pre-configured folders representing standard GS titles (Polity & Governance, Modern History, Economy, Society, etc.).
                    When you import any JSON, the app scans the <code className="text-[#E0A96D] bg-slate-800/60 p-0.5 rounded text-[10px]">metadata.subject</code> parameters and places it instantly in the correct folder!
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-400 text-center italic">
                Note: You can easily create, rename, and move chapters to Custom Folders too.
              </p>
            </div>
          )}

          {step === 5 && (
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="p-3 rounded-full bg-[#E0A96D]/20 text-[#E0A96D] animate-pulse">
                <Sparkles size={36} />
              </div>
              <div>
                <h3 className="text-2xl font-serif font-semibold text-white mb-2">
                  Ready for Prime Studies
                </h3>
                <p className="text-sm text-slate-300 max-w-xs mx-auto mb-4">
                  Let's jump into your personal learning suite. Select one of the entry-points below:
                </p>
              </div>

              <div className="w-full flex flex-col gap-3">
                <button
                  id="onboard-explore-demo-btn"
                  onClick={() => onComplete('explore_demo')}
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#D97706] to-[#E0A96D] hover:from-[#B45309] hover:to-[#D97706] text-[#0B132B] font-bold rounded shadow transition-all duration-150 text-sm uppercase tracking-wider"
                >
                  Explore Demo Polity Chapter
                </button>
                
                <div className="flex gap-2">
                  <button
                    id="onboard-import-btn"
                    onClick={() => onComplete('import_now')}
                    className="flex-1 py-2.5 px-3 bg-slate-800 border border-[#3A506B] hover:bg-slate-700 text-slate-100 font-medium rounded text-xs transition-all duration-150"
                  >
                    Import Chapter JSON
                  </button>
                  <button
                    id="onboard-dashboard-btn"
                    onClick={() => onComplete('dashboard')}
                    className="flex-1 py-2.5 px-3 bg-slate-800 border border-[#3A506B] hover:bg-slate-700 text-slate-100 font-medium rounded text-xs transition-all duration-150"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Card Controls */}
        {step < 5 && (
          <div className="flex items-center justify-between border-t border-[#3A506B]/30 pt-4 mt-6">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded transition ${
                step === 1 ? 'text-slate-500 cursor-not-allowed' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ChevronLeft size={16} /> Backward
            </button>

            {/* Step indicators */}
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    s === step ? 'w-6 bg-[#E0A96D]' : 'w-2 bg-slate-600'
                  }`}
                />
              ))}
            </div>

            <button
              id="onboarding-next-btn"
              onClick={nextStep}
              className="flex items-center gap-1 text-xs font-bold text-[#E0A96D] hover:text-white px-3 py-1.5 rounded bg-slate-800 border border-[#3A506B] hover:bg-slate-700 transition"
            >
              Forward <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
