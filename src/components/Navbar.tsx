/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Student } from '../types';
import { Sparkles, User, Settings2 } from 'lucide-react';

interface NavbarProps {
  currentUser: Student;
  currentView: 'explore' | 'dashboard';
  onNavigate: (view: 'explore' | 'dashboard') => void;
  onOpenSettings: () => void;
  onOpenOnboarding: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentView,
  onNavigate,
  onOpenSettings,
  onOpenOnboarding,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-stone-50/95 backdrop-blur-md border-b border-stone-200 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <button
          onClick={() => onNavigate('explore')}
          className="text-left group cursor-pointer focus:outline-none"
        >
          <span className="text-xl font-bold tracking-tight text-stone-900 font-editorial group-hover:text-stone-700 transition-colors whitespace-nowrap shrink-0">
            What U Do?
          </span>
        </button>

        {/* Zone 2: Navigation Links (Clean unboxed single-line typography) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
          <button
            onClick={() => onNavigate('explore')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentView === 'explore'
                ? 'text-stone-950 font-semibold border-b-2 border-stone-900'
                : 'hover:text-stone-950'
            }`}
          >
            Explore Talent
          </button>
          <a
            href="#featured-talent"
            onClick={(e) => {
              if (currentView !== 'explore') {
                e.preventDefault();
                onNavigate('explore');
                setTimeout(() => {
                  document.getElementById('featured-talent')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            className="whitespace-nowrap shrink-0 transition-colors hover:text-stone-950"
          >
            Featured Portfolios
          </a>
          <a
            href="#how-it-works"
            onClick={(e) => {
              if (currentView !== 'explore') {
                e.preventDefault();
                onNavigate('explore');
                setTimeout(() => {
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            className="whitespace-nowrap shrink-0 transition-colors hover:text-stone-950"
          >
            Reputation Scoring
          </a>
          <button
            onClick={() => onNavigate('dashboard')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentView === 'dashboard'
                ? 'text-stone-950 font-semibold border-b-2 border-stone-900'
                : 'hover:text-stone-950'
            }`}
          >
            My Collaborations
          </button>
        </nav>

        {/* Zone 3: Primary Action & Profile Switcher */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Gemma 4 status pill indicator button */}
          <button
            onClick={onOpenSettings}
            title="AI Model & OpenRouter Configuration"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-stone-600 hover:text-stone-900 border border-stone-200 hover:border-stone-400 rounded-md transition-colors bg-white/60"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span className="font-mono-num font-medium text-[11px]">Gemma 4</span>
          </button>

          {/* Profile Trigger / Dashboard */}
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-stone-200 hover:border-stone-300 bg-white transition-all text-xs text-stone-800"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-6 h-6 rounded-full object-cover border border-stone-200"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fallback avatar
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';
              }}
            />
            <span className="font-medium max-w-[100px] truncate hidden sm:inline">
              {currentUser.name.split(' ')[0]}
            </span>
          </button>

          {/* Primary CTA */}
          <button
            onClick={onOpenOnboarding}
            className="px-4 py-2 text-xs font-semibold text-stone-50 bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors whitespace-nowrap shadow-xs cursor-pointer"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </header>
  );
};
