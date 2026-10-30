/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Student, CollaborationRequest } from '../types';
import { X, Send, Clock, Target, FileText } from 'lucide-react';

interface CollaborationModalProps {
  targetStudent: Student | null;
  currentUser: Student;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: CollaborationRequest) => void;
}

export const CollaborationModal: React.FC<CollaborationModalProps> = ({
  targetStudent,
  currentUser,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [projectDescription, setProjectDescription] = useState('');
  const [expectedOutcome, setExpectedOutcome] = useState('');
  const [timeframe, setTimeframe] = useState('2 Weeks');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !targetStudent) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectDescription.trim() || !expectedOutcome.trim()) return;

    setIsSubmitting(true);
    const newRequest: CollaborationRequest = {
      id: `collab-${Date.now()}`,
      fromStudentId: currentUser.id,
      fromStudentName: currentUser.name,
      fromStudentAvatar: currentUser.avatar,
      fromStudentUniversity: currentUser.university,
      toStudentId: targetStudent.id,
      toStudentName: targetStudent.name,
      projectDescription: projectDescription.trim(),
      expectedOutcome: expectedOutcome.trim(),
      timeframe,
      message: message.trim() || undefined,
      status: 'pending',
      createdAt: new Date().toISOString(),
      bothConfirmed: false,
    };

    setTimeout(() => {
      onSubmit(newRequest);
      setIsSubmitting(false);
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 p-6 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-5">
          <div>
            <h3 className="text-xl font-bold font-editorial text-stone-900">
              Request Collaboration
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Send a project proposal to <strong className="text-stone-800">{targetStudent.name}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-stone-500" />
              <span>Project Description</span>
            </label>
            <textarea
              required
              rows={3}
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="e.g. Redesigning the student union cultural night identity and digital booklet..."
              className="w-full text-xs sm:text-sm p-3 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 bg-stone-50/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-stone-500" />
              <span>Expected Deliverable / Outcome</span>
            </label>
            <input
              type="text"
              required
              value={expectedOutcome}
              onChange={(e) => setExpectedOutcome(e.target.value)}
              placeholder="e.g. 5 poster layouts in Figma and 3 print PDFs"
              className="w-full text-xs sm:text-sm p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 bg-stone-50/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-stone-500" />
                <span>Target Timeframe</span>
              </label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full text-xs sm:text-sm p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 bg-stone-50/50"
              >
                <option value="1 Week">1 Week</option>
                <option value="2 Weeks">2 Weeks</option>
                <option value="1 Month">1 Month</option>
                <option value="Semester Long">Semester Long</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Your University
              </label>
              <input
                type="text"
                disabled
                value={currentUser.university.split('(')[1]?.replace(')', '') || currentUser.university}
                className="w-full text-xs p-2.5 border border-stone-200 rounded-lg bg-stone-100 text-stone-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Personal Note / Context (Optional)
            </label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Say hello and mention what you liked about their work..."
              className="w-full text-xs sm:text-sm p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 bg-stone-50/50"
            />
          </div>

          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Sending Request...' : 'Send Proposal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
