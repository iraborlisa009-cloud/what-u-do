/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MessageCircle, X, Sparkles, HelpCircle, ChevronRight, BookOpen, ShieldCheck, UserCheck } from 'lucide-react';

interface DialogflowWidgetProps {
  onOpenOnboarding: () => void;
  onOpenNewProject: () => void;
}

export const DialogflowWidget: React.FC<DialogflowWidgetProps> = ({
  onOpenOnboarding,
  onOpenNewProject,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const guideTopics = [
    {
      id: 'onboarding',
      title: 'How do I set up my student profile?',
      icon: UserCheck,
      body: 'Click "Edit Profile" in the top bar. Enter your university, academic level (100L - 500L), headline, and skills. Adding genuine portfolio links instantly increases your Profile Completeness score.',
      actionText: 'Open Profile Editor',
      action: onOpenOnboarding,
    },
    {
      id: 'portfolio',
      title: 'How do I add a project with AI polish?',
      icon: BookOpen,
      body: 'Go to your Dashboard and click "Publish Project". Enter your project description, then click "Improve with AI" to have Google Gemma 4 polish grammar and highlight your grounded achievements.',
      actionText: 'Publish Project',
      action: onOpenNewProject,
    },
    {
      id: 'reputation',
      title: 'How is the Reputation Score calculated?',
      icon: ShieldCheck,
      body: 'Your 0-100 score is deterministic: 40% confirmed collaborations, 30% verified peer ratings, 20% portfolio evidence links, and 10% profile completeness. Spamming and self-reviews are blocked.',
    },
    {
      id: 'collabs',
      title: 'How do peer collaborations work?',
      icon: HelpCircle,
      body: 'When you find a coursemate whose work you admire, click "Collaborate" on their card. State your project goal and timeline. Once finished, both participants confirm completion to earn reputation points.',
    },
  ];

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-full shadow-lg border border-stone-700 transition-all cursor-pointer group"
          title="Campus Assistant & Guidelines"
        >
          <MessageCircle className="w-4 h-4 text-stone-300 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-semibold">Campus Guide</span>
        </button>
      ) : (
        <div className="bg-white rounded-2xl w-80 sm:w-96 shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="p-4 bg-stone-900 text-stone-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-stone-300" />
              <div>
                <h4 className="text-xs font-bold font-editorial">What U Do? Campus Assistant</h4>
                <p className="text-[10px] text-stone-400">Dialogflow CX Support Hub</p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                setSelectedTopic(null);
              }}
              className="p-1 rounded-md hover:bg-stone-800 text-stone-300 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 max-h-96 overflow-y-auto">
            {selectedTopic ? (
              <div>
                {(() => {
                  const topic = guideTopics.find(t => t.id === selectedTopic);
                  if (!topic) return null;
                  return (
                    <div className="space-y-3">
                      <button
                        onClick={() => setSelectedTopic(null)}
                        className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
                      >
                        ← Back to guide topics
                      </button>
                      <h5 className="text-sm font-bold text-stone-900">{topic.title}</h5>
                      <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-200">
                        {topic.body}
                      </p>
                      {topic.action && (
                        <button
                          onClick={() => {
                            topic.action?.();
                            setIsOpen(false);
                          }}
                          className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          {topic.actionText}
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-stone-500 mb-3">
                  Frequently asked questions about finding coursemates and building your student portfolio:
                </p>
                {guideTopics.map((topic) => {
                  const Icon = topic.icon;
                  return (
                    <button
                      key={topic.id}
                      onClick={() => setSelectedTopic(topic.id)}
                      className="w-full text-left p-2.5 rounded-xl border border-stone-200 hover:border-stone-400 hover:bg-stone-50 transition-all flex items-center justify-between gap-2 group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className="w-4 h-4 text-stone-500 shrink-0" />
                        <span className="text-xs font-medium text-stone-800 truncate">
                          {topic.title}
                        </span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
