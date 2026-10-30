/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Project, Student } from '../types';
import { X, ExternalLink, Calendar, Code, CheckCircle, ArrowRight } from 'lucide-react';

interface ProjectDetailModalProps {
  project: Project | null;
  student: Student | null;
  onClose: () => void;
  onViewStudentProfile?: (student: Student) => void;
  onRequestCollab?: (student: Student) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  student,
  onClose,
  onViewStudentProfile,
  onRequestCollab,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        className="relative bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Controls */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-stone-900/60 hover:bg-stone-900 text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media Hero Showcase */}
        <div className="relative w-full aspect-16/9 bg-stone-100 max-h-[420px] overflow-hidden border-b border-stone-200">
          <img
            src={project.coverImage}
            alt={project.title}
            className="w-full h-full object-cover filter contrast-[1.02]"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8">
          {/* Metadata Row (Zero-Pill discipline) */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 mb-3">
            <span className="flex items-center gap-1 font-mono-num text-stone-700">
              <Calendar className="w-3.5 h-3.5" />
              {project.completionDate}
            </span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span>Platform: <strong className="text-stone-800 capitalize font-medium">{project.evidencePlatform || 'Direct Proof'}</strong></span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span className="flex items-center gap-1 text-emerald-800 font-medium">
              <CheckCircle className="w-3.5 h-3.5" />
              Verified Work Proof
            </span>
          </div>

          {/* Project Title */}
          <h2 className="text-2xl sm:text-3xl font-bold font-editorial text-stone-900 mb-4 [text-wrap:balance]">
            {project.title}
          </h2>

          {/* Skills Implemented */}
          <div className="text-xs text-stone-600 mb-6 bg-stone-50 p-3 rounded-lg border border-stone-200/70">
            <span className="text-[11px] font-medium text-stone-400 block mb-1">
              Skills Demonstrated in this Project:
            </span>
            <p className="font-medium text-stone-800">
              {project.skills.join('  ·  ')}
            </p>
          </div>

          {/* Project Description */}
          <div className="prose prose-stone text-stone-700 text-sm leading-relaxed mb-8">
            <p className="whitespace-pre-line">{project.description}</p>
          </div>

          {/* Author Details & Actions */}
          <div className="pt-6 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {student && (
              <div
                onClick={() => {
                  onClose();
                  onViewStudentProfile?.(student);
                }}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <img
                  src={student.avatar}
                  alt={student.name}
                  className="w-10 h-10 rounded-full object-cover border border-stone-200"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <p className="text-sm font-semibold text-stone-900 group-hover:text-stone-700 transition-colors flex items-center gap-1">
                    <span>{student.name}</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                  </p>
                  <p className="text-xs text-stone-500">
                    {student.university.split('(')[1]?.replace(')', '') || student.university} · {student.academicLevel}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 self-end sm:self-center">
              {project.evidenceLink && (
                <a
                  href={project.evidenceLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 border border-stone-300 hover:border-stone-500 text-stone-800 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  <span>View Proof Evidence</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              {student && onRequestCollab && (
                <button
                  onClick={() => {
                    onClose();
                    onRequestCollab(student);
                  }}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-50 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Collaborate on Project
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
