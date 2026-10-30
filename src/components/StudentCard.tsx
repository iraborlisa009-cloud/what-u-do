/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Student, Project } from '../types';
import { ShieldCheck, Star, ExternalLink, ArrowUpRight } from 'lucide-react';

interface StudentCardProps {
  student: Student;
  onViewProfile: (student: Student) => void;
  onSelectProject: (project: Project, student: Student) => void;
  onRequestCollab: (student: Student) => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({
  student,
  onViewProfile,
  onSelectProject,
  onRequestCollab,
}) => {
  const featuredProject = (student.projects && student.projects.length > 0)
    ? student.projects[0]
    : null;

  return (
    <article className="group bg-white rounded-xl border border-stone-200/90 hover:border-stone-400 transition-all shadow-xs flex flex-col justify-between overflow-hidden">
      <div>
        {/* Portfolio Visual Showcase Area */}
        {featuredProject ? (
          <div
            onClick={() => onSelectProject(featuredProject, student)}
            className="relative w-full aspect-16/10 bg-stone-100 overflow-hidden cursor-pointer border-b border-stone-100"
          >
            <img
              src={featuredProject.coverImage}
              alt={featuredProject.title}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300 filter contrast-[1.02]"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fallback styled surface
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            {/* Quick Project Title Overlay on Hover */}
            <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white">
              <span className="text-[11px] font-medium text-stone-300 uppercase tracking-wider">
                Featured Work
              </span>
              <p className="text-sm font-semibold truncate flex items-center justify-between">
                <span>{featuredProject.title}</span>
                <ArrowUpRight className="w-4 h-4 ml-1 shrink-0" />
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full h-24 bg-stone-100 border-b border-stone-200/60 flex items-center justify-center text-xs text-stone-400">
            Portfolio projects in preparation
          </div>
        )}

        {/* Card Body */}
        <div className="p-5">
          {/* Unboxed Metadata (Zero-Pill discipline) */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500 mb-2">
            <span className="font-medium text-stone-700">{student.university.split('(')[1]?.replace(')', '') || student.university}</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span>{student.academicLevel}</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span className="truncate max-w-[140px]">{student.department}</span>
          </div>

          {/* Student Header */}
          <div className="flex items-start gap-3 mb-3">
            <img
              src={student.avatar}
              alt={student.name}
              className="w-11 h-11 rounded-full object-cover border border-stone-200 shrink-0 mt-0.5"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';
              }}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => onViewProfile(student)}
                  className="font-semibold text-stone-900 hover:text-stone-700 text-base truncate text-left focus:outline-none cursor-pointer"
                >
                  {student.name}
                </button>
                {student.isDemo && (
                  <span className="text-[10px] text-stone-400 tracking-tight shrink-0 font-mono-num" title="Fictional sample record">
                    Demo
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-600 line-clamp-1 mt-0.5">
                {student.headline}
              </p>
            </div>
          </div>

          {/* Student Bio Snippet */}
          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-4">
            {student.bio}
          </p>

          {/* Skills List as Clean Unboxed Text with Separators */}
          <div className="text-xs text-stone-600 border-t border-stone-100 pt-3 mb-4">
            <span className="text-[11px] font-medium text-stone-400 block mb-1">
              Core Skills
            </span>
            <p className="truncate text-stone-800">
              {student.skills.slice(0, 4).join('  ·  ')}
            </p>
          </div>
        </div>
      </div>

      {/* Card Footer: Reputation Metrics & Actions */}
      <div className="px-5 py-3.5 bg-stone-50 border-t border-stone-200/80 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          {/* Reputation Indicator */}
          <div className="flex items-center gap-1 text-stone-800" title={`Reputation Score: ${student.reputation?.score}/100`}>
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span className="font-mono-num font-semibold">{student.reputation?.score ?? 85}</span>
            <span className="text-stone-400 text-[11px]">/100</span>
          </div>

          {/* Completed Collaborations */}
          <div className="text-stone-500">
            <span className="font-mono-num font-medium text-stone-700">{student.reputation?.completedCollabs ?? 0}</span>
            <span className="text-[11px] ml-1">collabs</span>
          </div>
        </div>

        {/* Action Triggers */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewProfile(student)}
            className="px-2.5 py-1 text-xs text-stone-700 hover:text-stone-950 font-medium hover:underline transition-colors cursor-pointer"
          >
            Portfolio
          </button>
          <button
            onClick={() => onRequestCollab(student)}
            className="px-3 py-1 bg-stone-900 hover:bg-stone-800 text-stone-50 font-medium rounded-md transition-colors text-xs cursor-pointer"
          >
            Collaborate
          </button>
        </div>
      </div>
    </article>
  );
};
