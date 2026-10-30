/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';

interface FooterProps {
  onOpenSettings: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenSettings }) => {
  return (
    <footer className="border-t border-stone-200 bg-stone-100/70 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-stone-200">
          <div>
            <span className="text-xl font-bold font-editorial text-stone-900">
              What U Do?
            </span>
            <p className="text-xs text-stone-600 mt-1 max-w-md">
              Discover what your coursemates can do. Premium student talent discovery across Nigerian universities, powered by Google Gemma 4.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-stone-600 font-medium">
            <a href="#featured-talent" className="hover:text-stone-900 transition-colors">
              Featured Talent
            </a>
            <a href="#how-it-works" className="hover:text-stone-900 transition-colors">
              Reputation Mechanics
            </a>
            <button
              onClick={onOpenSettings}
              className="hover:text-stone-900 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Gemma 4 Settings</span>
            </button>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-stone-500">
          <p>© 2026 What U Do? · Built for university students.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Deterministic Trust Protocol</span>
            </span>
            <span>·</span>
            <span>All student sample data labeled transparently</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
