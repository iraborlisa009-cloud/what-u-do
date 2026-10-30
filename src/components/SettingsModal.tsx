/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Sparkles, CheckCircle2, AlertCircle, RefreshCw, Key, Shield } from 'lucide-react';
import { checkServerStatus } from '../services/api';
import { getCustomOpenRouterKey, setCustomOpenRouterKey } from '../services/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferredModel: string;
  onSelectPreferredModel: (model: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  preferredModel,
  onSelectPreferredModel,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [serverStatus, setServerStatus] = useState<{
    status: string;
    openRouterConfigured: boolean;
    primaryModel: string;
    fallbackModel: string;
  } | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(getCustomOpenRouterKey());
      loadStatus();
    }
  }, [isOpen]);

  const loadStatus = async () => {
    setIsChecking(true);
    const res = await checkServerStatus();
    setServerStatus(res);
    setIsChecking(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomOpenRouterKey(apiKey);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-700" />
            <div>
              <h3 className="text-lg font-bold font-editorial text-stone-900">
                Gemma 4 & OpenRouter Settings
              </h3>
              <p className="text-xs text-stone-500">
                Official Google Gemma 4 integration via OpenRouter
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Server Status Indicator */}
        <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl mb-5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-stone-700">OpenRouter Integration Status:</span>
            <button
              onClick={loadStatus}
              className="text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {serverStatus?.openRouterConfigured || apiKey ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>API Key Connected</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-amber-800 font-semibold bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Using Smart Heuristic Fallback (Key Not Set)</span>
              </span>
            )}
          </div>

          <p className="text-[11px] text-stone-500 leading-relaxed pt-1">
            Primary Model: <code className="font-mono-num font-medium text-stone-700">google/gemma-4-31b-it</code>
            <br />
            Automatic Fallback: <code className="font-mono-num font-medium text-stone-700">google/gemma-4-26b-a4b-it</code>
          </p>
        </div>

        {/* Preferred Endpoint Mode */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-stone-800 mb-2">
            Target Gemma 4 Endpoint:
          </label>
          <div className="space-y-2">
            {[
              {
                id: 'google/gemma-4-31b-it',
                label: 'google/gemma-4-31b-it (Recommended)',
                desc: 'Full-precision flagship Gemma 4 instruction-tuned model.',
              },
              {
                id: 'google/gemma-4-26b-a4b-it',
                label: 'google/gemma-4-26b-a4b-it (Fallback)',
                desc: 'High-throughput active parameter variant.',
              },
              {
                id: 'google/gemma-4-31b-it:free',
                label: 'google/gemma-4-31b-it:free (Free Tier)',
                desc: 'Rate-limited free endpoint on OpenRouter.',
              },
            ].map((m) => (
              <label
                key={m.id}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  preferredModel === m.id
                    ? 'border-stone-900 bg-stone-50/80 ring-1 ring-stone-900'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <input
                  type="radio"
                  name="preferredModel"
                  value={m.id}
                  checked={preferredModel === m.id}
                  onChange={() => onSelectPreferredModel(m.id)}
                  className="mt-0.5 text-stone-900 focus:ring-stone-900"
                />
                <div>
                  <p className="text-xs font-bold text-stone-900 font-mono-num">{m.label}</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">{m.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Custom OpenRouter Key (Optional Dev Override) */}
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-stone-500" />
                <span>OpenRouter API Key (Optional Override)</span>
              </span>
              <span className="text-[10px] text-stone-400">Stored locally in session</span>
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-or-v1-..."
              className="w-full text-xs p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 font-mono-num bg-stone-50/40"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-emerald-700 font-medium">
              {savedSuccess ? 'Key saved successfully!' : ''}
            </span>
            <button
              type="submit"
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Update Key
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
