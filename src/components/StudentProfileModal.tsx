/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Student, Project, Review } from '../types';
import { getReviewsForStudent, getProjectsByStudent } from '../services/storage';
import {
  X,
  ShieldCheck,
  Star,
  ExternalLink,
  Github,
  Figma,
  Linkedin,
  Twitter,
  Globe,
  Award,
  Calendar,
  CheckCircle2,
  FolderGit2,
  MessageSquare
} from 'lucide-react';

interface StudentProfileModalProps {
  student: Student | null;
  onClose: () => void;
  onSelectProject: (project: Project, student: Student) => void;
  onRequestCollab: (student: Student) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  student,
  onClose,
  onSelectProject,
  onRequestCollab,
}) => {
  const [activeTab, setActiveTab] = useState<'portfolio' | 'reviews' | 'reputation'>('portfolio');

  if (!student) return null;

  const projects = getProjectsByStudent(student.id);
  const reviews = getReviewsForStudent(student.id);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        className="relative bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl border border-stone-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span>Student Profile</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span className="font-medium text-stone-800">{student.university}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
            aria-label="Close profile"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-6 sm:p-8">
          {/* Top Profile Intro Block */}
          <div className="flex flex-col sm:flex-row items-start gap-6 pb-8 border-b border-stone-200">
            <img
              src={student.avatar}
              alt={student.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-stone-300 shadow-xs shrink-0"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
              }}
            />

            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl sm:text-3xl font-bold font-editorial text-stone-900">
                      {student.name}
                    </h2>
                    {student.isDemo && (
                      <span className="text-[11px] font-mono-num text-stone-400">
                        (Demo Profile)
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-stone-700 mt-0.5">
                    {student.headline}
                  </p>
                </div>

                <button
                  onClick={() => onRequestCollab(student)}
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-semibold rounded-lg transition-colors shrink-0 shadow-xs cursor-pointer self-start sm:self-auto"
                >
                  Request Collaboration
                </button>
              </div>

              {/* Unboxed Metadata Line */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500 mb-3">
                <span className="font-medium text-stone-800">{student.university}</span>
                <span aria-hidden="true" className="text-stone-300">·</span>
                <span>{student.faculty}</span>
                <span aria-hidden="true" className="text-stone-300">·</span>
                <span>{student.academicLevel}</span>
              </div>

              {/* Bio */}
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-2xl mb-4">
                {student.bio}
              </p>

              {/* Social Proof & External Links */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600">
                {student.socialLinks?.github && (
                  <a
                    href={student.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-stone-950 font-medium transition-colors"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                  </a>
                )}
                {student.socialLinks?.figma && (
                  <a
                    href={student.socialLinks.figma}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-stone-950 font-medium transition-colors"
                  >
                    <Figma className="w-3.5 h-3.5" />
                    <span>Figma</span>
                  </a>
                )}
                {student.socialLinks?.behance && (
                  <a
                    href={student.socialLinks.behance}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-stone-950 font-medium transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Behance</span>
                  </a>
                )}
                {student.socialLinks?.linkedin && (
                  <a
                    href={student.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-stone-950 font-medium transition-colors"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Navigation Tabs (Clean segmented control) */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg max-w-md my-6">
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === 'portfolio'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Portfolio Projects ({projects.length})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === 'reviews'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Peer Reviews ({reviews.length})
            </button>
            <button
              onClick={() => setActiveTab('reputation')}
              className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === 'reputation'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Reputation ({student.reputation?.score ?? 85}/100)
            </button>
          </div>

          {/* Tab 1: Portfolio Showcase */}
          {activeTab === 'portfolio' && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    onClick={() => onSelectProject(proj, student)}
                    className="group border border-stone-200 rounded-xl overflow-hidden hover:border-stone-400 transition-all cursor-pointer flex flex-col justify-between bg-white"
                  >
                    <div className="relative aspect-16/10 bg-stone-100 overflow-hidden">
                      <img
                        src={proj.coverImage}
                        alt={proj.title}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300 filter contrast-[1.02]"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1">
                        <span>{proj.completionDate}</span>
                        <span className="font-medium text-stone-600 capitalize">{proj.evidencePlatform || 'Portfolio'}</span>
                      </div>
                      <h4 className="text-sm font-bold text-stone-900 line-clamp-1 group-hover:text-stone-700 transition-colors">
                        {proj.title}
                      </h4>
                      <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                        {proj.description}
                      </p>
                      <div className="mt-3 pt-2 border-t border-stone-100 text-[11px] text-stone-600 truncate">
                        {proj.skills.join('  ·  ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {projects.length === 0 && (
                <div className="text-center py-12 text-stone-400 text-xs border border-dashed border-stone-200 rounded-xl">
                  No public projects added yet.
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Authentic Reviews */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 border border-stone-200 rounded-xl bg-stone-50/50"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={rev.authorAvatar}
                        alt={rev.authorName}
                        className="w-9 h-9 rounded-full object-cover border border-stone-300"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <p className="text-xs font-bold text-stone-900">{rev.authorName}</p>
                        <p className="text-[11px] text-stone-500">
                          Collaborated on: <span className="font-medium text-stone-700">{rev.projectTitle}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-amber-700 text-xs font-mono-num font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{rev.rating}.0</span>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed italic mt-2">
                    "{rev.feedback}"
                  </p>
                  <p className="text-[10px] text-stone-400 font-mono-num mt-2">
                    Confirmed Collaboration Review · {new Date(rev.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}

              {reviews.length === 0 && (
                <div className="text-center py-12 text-stone-500 text-xs border border-dashed border-stone-200 rounded-xl">
                  Reviews unlock automatically once a peer collaboration is confirmed and marked completed by both participants.
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Reputation Score Math Breakdown */}
          {activeTab === 'reputation' && (
            <div className="p-6 border border-stone-200 rounded-xl bg-white space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold font-editorial text-stone-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-700" />
                    <span>Transparent Reputation Index: {student.reputation?.score ?? 85}/100</span>
                  </h3>
                  <span className="text-xs text-stone-400 font-mono-num">Deterministic Algorithm</span>
                </div>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Unlike traditional platforms that rely on arbitrary review counts or paid promotions, What U Do? calculates trust deterministically from verifiable on-campus actions.
                </p>
              </div>

              {/* 4 Pillars Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Pillar 1 */}
                <div className="p-4 border border-stone-200/90 rounded-lg bg-stone-50">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-stone-800">1. Confirmed Collaborations (40%)</span>
                    <span className="font-mono-num text-emerald-800 font-bold">
                      {Math.min(Math.round(((student.reputation?.completedCollabs ?? 0) / 10) * 40), 40)} / 40 pts
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    {student.reputation?.completedCollabs ?? 0} two-way confirmed collaborations completed with fellow coursemates.
                  </p>
                </div>

                {/* Pillar 2 */}
                <div className="p-4 border border-stone-200/90 rounded-lg bg-stone-50">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-stone-800">2. Review Confidence (30%)</span>
                    <span className="font-mono-num text-emerald-800 font-bold">
                      {Math.round(((student.reputation?.ratingAverage ?? 5) / 5) * 30 * Math.min((student.reputation?.reviewCount ?? 1) / 5, 1))} / 30 pts
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Average {student.reputation?.ratingAverage ?? 5.0}★ from {student.reputation?.reviewCount ?? 0} authentic peer reviews.
                  </p>
                </div>

                {/* Pillar 3 */}
                <div className="p-4 border border-stone-200/90 rounded-lg bg-stone-50">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-stone-800">3. Portfolio Proof (20%)</span>
                    <span className="font-mono-num text-emerald-800 font-bold">
                      {Math.round(((student.reputation?.portfolioScore ?? 85) / 100) * 20)} / 20 pts
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Public evidence links verified across GitHub, Behance, Figma, and Drive.
                  </p>
                </div>

                {/* Pillar 4 */}
                <div className="p-4 border border-stone-200/90 rounded-lg bg-stone-50">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-stone-800">4. Profile Completeness (10%)</span>
                    <span className="font-mono-num text-emerald-800 font-bold">
                      {Math.round(((student.reputation?.profileCompleteness ?? 100) / 100) * 10)} / 10 pts
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Comprehensive bio, skill tags, academic level, and contact proof provided.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
