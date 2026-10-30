/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Sparkles, ArrowRight, CornerDownLeft, Loader2 } from 'lucide-react';

interface HeroProps {
  onSearch: (query: string) => void;
  isSearching: boolean;
  activeModelName?: string;
}

export const Hero: React.FC<HeroProps> = ({
  onSearch,
  isSearching,
  activeModelName = 'Google Gemma 4',
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const quickPrompts = [
    'Graphic designer at UNIBEN',
    'Mobile app developer at UNILAG',
    '3D architectural visualizer',
    'Campus documentary photographer',
    'Who knows React and Python?',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleSelectQuickPrompt = (prompt: string) => {
    setSearchQuery(prompt);
    onSearch(prompt);
  };

  return (
    <section className="border-b border-stone-200 bg-stone-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {/* Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-stretch">
          {/* Left Column: Typographic Hierarchy & Search */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Editorial Kicker */}
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-600 mb-4 tracking-wider uppercase">
              <span>University Skill Discovery</span>
              <span aria-hidden="true" className="text-stone-400">·</span>
              <span className="flex items-center gap-1 text-amber-800">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Powered by {activeModelName}</span>
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-stone-900 font-editorial leading-[1.12] mb-5 [text-wrap:balance]">
              You know their faces. Now discover what they do.
            </h1>

            {/* Lead Copy */}
            <p className="text-base sm:text-lg text-stone-600 mb-8 max-w-2xl leading-relaxed">
              Students spend years studying alongside brilliant coursemates whose craft they never see.
              What U Do? connects campus designers, engineers, photographers, and builders through verified portfolio proof and collaborative reputations.
            </p>

            {/* AI Talent Finder Search Bar (Gemma 4) */}
            <div className="bg-white border border-stone-300 rounded-xl p-2 sm:p-2.5 shadow-sm transition-all focus-within:border-stone-900 focus-within:ring-1 focus-within:ring-stone-900 mb-4">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <div className="pl-2 text-stone-400">
                  <Search className="w-5 h-5 text-stone-500" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ask Gemma 4: 'Find a UI designer in 300L' or 'Photographer for a campus project'..."
                  className="w-full text-sm sm:text-base text-stone-900 placeholder:text-stone-400 focus:outline-none bg-transparent"
                />
                <button
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()}
                  className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed text-stone-50 text-xs sm:text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors shrink-0 cursor-pointer"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="hidden sm:inline">Interpreting...</span>
                    </>
                  ) : (
                    <>
                      <span>Find Talent</span>
                      <CornerDownLeft className="w-3.5 h-3.5 opacity-60 hidden sm:inline" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Quick Prompt Starters */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-stone-500">
              <span className="font-medium text-stone-700">Try queries:</span>
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectQuickPrompt(prompt)}
                  className="hover:text-stone-900 underline underline-offset-3 decoration-stone-300 hover:decoration-stone-600 transition-colors cursor-pointer text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: High-Fidelity Editorial Visual Asset */}
          <div className="lg:col-span-5 flex items-center">
            <div className="relative w-full aspect-4/3 lg:aspect-auto lg:h-full min-h-[320px] rounded-2xl overflow-hidden border border-stone-200 bg-stone-200 shadow-sm">
              <img
                src="/src/assets/images/WhatsApp Image 2026-10-30 at 15.45.29.jpeg"
                alt="University students collaborating in creative workshop studio"
                className="w-full h-full object-cover object-center filter saturate-[0.9] contrast-[1.05]"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              {/* Subtle caption overlay */}
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white">
                <p className="text-xs font-medium text-stone-200">
                  Campus Studio Session · Architecture & Design Cohort
                </p>
                <p className="text-[11px] text-stone-400">
                  Peer collaboration across faculties
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Adjacency Proof Row Below Split */}
        <div className="mt-12 pt-8 border-t border-stone-200/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-stone-900">
          <div>
            <p className="text-2xl sm:text-3xl font-bold font-mono-num tracking-tight">12</p>
            <p className="text-xs text-stone-500 mt-0.5">Sample Nigerian Campus Talents</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold font-mono-num tracking-tight">40+</p>
            <p className="text-xs text-stone-500 mt-0.5">Confirmed Collaborations</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold font-mono-num tracking-tight text-amber-800">Gemma 4</p>
            <p className="text-xs text-stone-500 mt-0.5">Structured OpenRouter Extraction</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold font-mono-num tracking-tight">100%</p>
            <p className="text-xs text-stone-500 mt-0.5">Grounded, Deterministic Scoring</p>
          </div>
        </div>
      </div>
    </section>
  );
};
