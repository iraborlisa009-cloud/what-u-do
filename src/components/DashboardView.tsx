/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Student, Project, CollaborationRequest, Review } from '../types';
import {
  getProjectsByStudent,
  getCollabsForStudent,
  updateCollabStatus,
  addReview,
  getAllStudents,
  setCurrentUser,
  getReviewsForStudent
} from '../services/storage';
import {
  Plus,
  ShieldCheck,
  Star,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Edit3,
  Trash2,
  Send,
  MessageSquare,
  Users,
  AlertCircle
} from 'lucide-react';

interface DashboardViewProps {
  currentUser: Student;
  onRefreshUser: () => void;
  onEditProfile: () => void;
  onOpenNewProject: () => void;
  onEditProject: (project: Project) => void;
  onSelectProject: (project: Project, student: Student) => void;
  onSwitchStudent: (studentId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  onRefreshUser,
  onEditProfile,
  onOpenNewProject,
  onEditProject,
  onSelectProject,
  onSwitchStudent,
}) => {
  const [activeTab, setActiveTab] = useState<'projects' | 'inbound' | 'outbound' | 'reputation'>('projects');

  // Review submission state for completed collabs
  const [reviewCollab, setReviewCollab] = useState<CollaborationRequest | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [reviewError, setReviewError] = useState<string | null>(null);

  const myProjects = getProjectsByStudent(currentUser.id);
  const collabs = getCollabsForStudent(currentUser.id);
  const allStudents = getAllStudents();
  const myReviews = getReviewsForStudent(currentUser.id);

  const handleUpdateStatus = (
    collabId: string,
    newStatus: CollaborationRequest['status']
  ) => {
    const res = updateCollabStatus(collabId, newStatus, currentUser.id);
    if (res.success) {
      onRefreshUser();
    } else {
      alert(res.error || 'Failed to update collaboration');
    }
  };

  const handleOpenReviewModal = (collab: CollaborationRequest) => {
    setReviewCollab(collab);
    setReviewRating(5);
    setReviewFeedback('');
    setReviewError(null);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewCollab) return;

    // Target student is the other party
    const targetStudentId = reviewCollab.toStudentId === currentUser.id
      ? reviewCollab.fromStudentId
      : reviewCollab.toStudentId;

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      collaborationId: reviewCollab.id,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      targetStudentId,
      rating: reviewRating,
      feedback: reviewFeedback.trim(),
      createdAt: new Date().toISOString(),
      projectTitle: reviewCollab.projectDescription.slice(0, 40) + '...',
    };

    const res = addReview(newReview);
    if (res.success) {
      setReviewCollab(null);
      onRefreshUser();
      alert('Review published successfully to student profile!');
    } else {
      setReviewError(res.error || 'Failed to submit review');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Banner: Profile Overview & Quick Persona Switcher */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 mb-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-stone-100">
          <div className="flex items-start gap-4 sm:gap-5">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-stone-300 shadow-xs shrink-0"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
              }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold font-editorial text-stone-900">
                  {currentUser.name}
                </h1>
                {currentUser.isDemo && (
                  <span className="text-[10px] font-mono-num text-stone-400">
                    (Demo Record)
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-stone-600 font-medium mt-0.5">
                {currentUser.headline}
              </p>
              {/* Unboxed Metadata (Zero-Pill discipline) */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500 mt-2">
                <span className="font-semibold text-stone-800">{currentUser.university}</span>
                <span aria-hidden="true" className="text-stone-300">·</span>
                <span>{currentUser.department}</span>
                <span aria-hidden="true" className="text-stone-300">·</span>
                <span>{currentUser.academicLevel}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons & Persona Switcher */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Quick Switch Persona for Demonstration Testing */}
            <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-lg text-xs">
              <Users className="w-3.5 h-3.5 text-stone-500 shrink-0" />
              <span className="text-stone-500 whitespace-nowrap">Testing as:</span>
              <select
                value={currentUser.id}
                onChange={(e) => onSwitchStudent(e.target.value)}
                className="bg-transparent font-medium text-stone-800 focus:outline-none cursor-pointer text-xs"
              >
                {allStudents.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.university.split('(')[1]?.replace(')', '') || 'Campus'})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onEditProfile}
              className="px-4 py-2 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer text-center"
            >
              Edit Profile
            </button>
            <button
              onClick={onOpenNewProject}
              className="px-4 py-2 text-xs font-semibold text-stone-50 bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Publish Project</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Strip (Quiet, tabular figures without vanity sparklines) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-0.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Reputation Score</span>
            </div>
            <p className="text-2xl font-bold font-mono-num text-stone-900">
              {currentUser.reputation?.score ?? 85}
              <span className="text-xs text-stone-400 font-normal"> /100</span>
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-0.5">
              <CheckCircle2 className="w-4 h-4 text-stone-500" />
              <span>Completed Collabs</span>
            </div>
            <p className="text-2xl font-bold font-mono-num text-stone-900">
              {currentUser.reputation?.completedCollabs ?? 0}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-0.5">
              <Star className="w-4 h-4 text-amber-600" />
              <span>Peer Rating</span>
            </div>
            <p className="text-2xl font-bold font-mono-num text-stone-900">
              {currentUser.reputation?.ratingAverage ?? 5.0}★
              <span className="text-xs text-stone-400 font-normal"> ({currentUser.reputation?.reviewCount ?? 0})</span>
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-0.5">
              <Clock className="w-4 h-4 text-stone-500" />
              <span>Pending Requests</span>
            </div>
            <p className="text-2xl font-bold font-mono-num text-stone-900">
              {collabs.inbound.filter(c => c.status === 'pending').length}
            </p>
          </div>
        </div>
      </div>

      {/* Workspace Navigation Tabs (Clean segmented control) */}
      <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg max-w-xl mb-6">
        <button
          onClick={() => setActiveTab('projects')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-md transition-all cursor-pointer ${
            activeTab === 'projects'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          My Projects ({myProjects.length})
        </button>
        <button
          onClick={() => setActiveTab('inbound')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-md transition-all cursor-pointer ${
            activeTab === 'inbound'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Inbound Proposals ({collabs.inbound.length})
        </button>
        <button
          onClick={() => setActiveTab('outbound')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-md transition-all cursor-pointer ${
            activeTab === 'outbound'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Outbound Sent ({collabs.outbound.length})
        </button>
        <button
          onClick={() => setActiveTab('reputation')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-md transition-all cursor-pointer ${
            activeTab === 'reputation'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Score Breakdown
        </button>
      </div>

      {/* Tab 1: My Projects */}
      {activeTab === 'projects' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myProjects.map((proj) => (
              <div
                key={proj.id}
                className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div
                    onClick={() => onSelectProject(proj, currentUser)}
                    className="relative aspect-16/10 bg-stone-100 overflow-hidden cursor-pointer"
                  >
                    <img
                      src={proj.coverImage}
                      alt={proj.title}
                      className="w-full h-full object-cover filter contrast-[1.02] hover:scale-102 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1">
                      <span>{proj.completionDate}</span>
                      <span className="capitalize font-medium text-stone-700">{proj.evidencePlatform}</span>
                    </div>
                    <h3
                      onClick={() => onSelectProject(proj, currentUser)}
                      className="font-bold text-sm text-stone-900 hover:text-stone-700 cursor-pointer line-clamp-1 transition-colors"
                    >
                      {proj.title}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                      {proj.description}
                    </p>
                    <div className="mt-3 pt-2 border-t border-stone-100 text-[11px] text-stone-600 truncate">
                      {proj.skills.join('  ·  ')}
                    </div>
                  </div>
                </div>

                <div className="px-4 py-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-800 font-medium">
                    Verified Link Attached
                  </span>
                  <button
                    onClick={() => onEditProject(proj)}
                    className="text-xs font-semibold text-stone-800 hover:text-stone-950 flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {myProjects.length === 0 && (
            <div className="text-center py-16 bg-white border border-dashed border-stone-300 rounded-2xl p-6">
              <h3 className="text-base font-bold font-editorial text-stone-900 mb-1">
                You haven't published any portfolio projects yet.
              </h3>
              <p className="text-xs text-stone-500 mb-4 max-w-md mx-auto">
                Showcase your design work, code repositories, photography or writing with verifiable links to boost your campus reputation.
              </p>
              <button
                onClick={onOpenNewProject}
                className="px-4 py-2 bg-stone-900 text-stone-50 font-semibold text-xs rounded-lg cursor-pointer"
              >
                Publish First Project
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Inbound Collaboration Requests */}
      {activeTab === 'inbound' && (
        <div className="space-y-4">
          {collabs.inbound.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              <div className="flex items-start gap-4 flex-1">
                <img
                  src={c.fromStudentAvatar}
                  alt={c.fromStudentName}
                  className="w-11 h-11 rounded-full object-cover border border-stone-300 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-stone-900">{c.fromStudentName}</span>
                    <span aria-hidden="true" className="text-stone-300">·</span>
                    <span className="text-xs text-stone-500">{c.fromStudentUniversity}</span>
                    <span aria-hidden="true" className="text-stone-300">·</span>
                    <span className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                      c.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : c.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-800'
                        : c.status === 'accepted'
                        ? 'bg-amber-100 text-amber-800'
                        : c.status === 'declined'
                        ? 'bg-stone-200 text-stone-600'
                        : 'bg-stone-100 text-stone-800'
                    }`}>
                      {c.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-medium text-stone-800 mb-1">
                    "{c.projectDescription}"
                  </p>
                  <p className="text-xs text-stone-500">
                    <strong>Deliverable:</strong> {c.expectedOutcome} · <strong>Timeframe:</strong> {c.timeframe}
                  </p>
                  {c.message && (
                    <p className="text-xs text-stone-600 italic mt-2 bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                      "{c.message}"
                    </p>
                  )}
                </div>
              </div>

              {/* Status Action Controls */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                {c.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(c.id, 'accepted')}
                      className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-semibold rounded-lg cursor-pointer"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(c.id, 'declined')}
                      className="px-3 py-1.5 border border-stone-200 text-stone-600 hover:text-stone-900 text-xs font-medium rounded-lg cursor-pointer"
                    >
                      Decline
                    </button>
                  </>
                )}

                {c.status === 'accepted' && (
                  <button
                    onClick={() => handleUpdateStatus(c.id, 'in_progress')}
                    className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Mark In Progress
                  </button>
                )}

                {c.status === 'in_progress' && (
                  <button
                    onClick={() => handleUpdateStatus(c.id, 'completed')}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg cursor-pointer flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm Completed</span>
                  </button>
                )}

                {c.status === 'completed' && (
                  <button
                    onClick={() => handleOpenReviewModal(c)}
                    className="px-3 py-1.5 border border-stone-300 hover:border-stone-500 text-stone-800 text-xs font-semibold rounded-lg cursor-pointer flex items-center gap-1"
                  >
                    <Star className="w-3.5 h-3.5 text-amber-600" />
                    <span>Rate Partner</span>
                  </button>
                )}
              </div>
            </div>
          ))}

          {collabs.inbound.length === 0 && (
            <div className="text-center py-16 bg-white border border-stone-200 rounded-2xl p-6 text-xs text-stone-500">
              No inbound collaboration proposals yet. When other students discover your profile, their requests will appear here.
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Outbound Sent Requests */}
      {activeTab === 'outbound' && (
        <div className="space-y-4">
          {collabs.outbound.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-stone-500">Proposal sent to:</span>
                  <span className="font-bold text-sm text-stone-900">{c.toStudentName}</span>
                  <span aria-hidden="true" className="text-stone-300">·</span>
                  <span className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                    c.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : c.status === 'in_progress'
                      ? 'bg-blue-100 text-blue-800'
                      : c.status === 'accepted'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-stone-100 text-stone-800'
                  }`}>
                    {c.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-stone-800 mb-1">
                  "{c.projectDescription}"
                </p>
                <p className="text-xs text-stone-500">
                  <strong>Expected Outcome:</strong> {c.expectedOutcome} · <strong>Timeframe:</strong> {c.timeframe}
                </p>
              </div>

              {c.status === 'completed' && (
                <button
                  onClick={() => handleOpenReviewModal(c)}
                  className="px-3 py-1.5 border border-stone-300 hover:border-stone-500 text-stone-800 text-xs font-semibold rounded-lg cursor-pointer flex items-center gap-1 self-end md:self-auto"
                >
                  <Star className="w-3.5 h-3.5 text-amber-600" />
                  <span>Leave Review</span>
                </button>
              )}
            </div>
          ))}

          {collabs.outbound.length === 0 && (
            <div className="text-center py-16 bg-white border border-stone-200 rounded-2xl p-6 text-xs text-stone-500">
              You haven't sent any collaboration proposals yet. Browse coursemates in Explore Talent and click "Collaborate".
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Reputation Math */}
      {activeTab === 'reputation' && (
        <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-200">
            <div>
              <h3 className="text-xl font-bold font-editorial text-stone-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <span>Deterministic Campus Reputation: {currentUser.reputation?.score ?? 85}/100</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Calculated strictly from verified peer collaborations, authentic reviews, and verified portfolio proofs.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 border border-stone-200 rounded-xl bg-stone-50/50">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-stone-800">1. Confirmed Collaborations (40%)</span>
                <span className="text-xs font-mono-num font-bold text-emerald-800">
                  {Math.min(Math.round(((currentUser.reputation?.completedCollabs ?? 0) / 10) * 40), 40)} / 40 pts
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                Requires mutual completion confirmation from both student participants.
              </p>
            </div>

            <div className="p-4 border border-stone-200 rounded-xl bg-stone-50/50">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-stone-800">2. Review Confidence (30%)</span>
                <span className="text-xs font-mono-num font-bold text-emerald-800">
                  {Math.round(((currentUser.reputation?.ratingAverage ?? 5) / 5) * 30 * Math.min((currentUser.reputation?.reviewCount ?? 1) / 5, 1))} / 30 pts
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                Self-reviews and duplicate reviews are strictly prohibited.
              </p>
            </div>

            <div className="p-4 border border-stone-200 rounded-xl bg-stone-50/50">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-stone-800">3. Portfolio Proof (20%)</span>
                <span className="text-xs font-mono-num font-bold text-emerald-800">
                  {Math.round(((currentUser.reputation?.portfolioScore ?? 85) / 100) * 20)} / 20 pts
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                Verified links to GitHub, Behance, Figma, and Drive.
              </p>
            </div>

            <div className="p-4 border border-stone-200 rounded-xl bg-stone-50/50">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-stone-800">4. Profile Completeness (10%)</span>
                <span className="text-xs font-mono-num font-bold text-emerald-800">
                  {Math.round(((currentUser.reputation?.profileCompleteness ?? 100) / 100) * 10)} / 10 pts
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                Complete academic data, verified department, and skill tags.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Review Submission Modal */}
      {reviewCollab && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="text-lg font-bold font-editorial text-stone-900 mb-1">
              Rate Collaboration Partner
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Leave genuine feedback on your completed project with{' '}
              <strong>
                {reviewCollab.toStudentId === currentUser.id
                  ? reviewCollab.fromStudentName
                  : reviewCollab.toStudentName}
              </strong>
            </p>

            {reviewError && (
              <div className="p-3 mb-4 bg-red-50 text-red-800 border border-red-200 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{reviewError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Rating (1 to 5 Stars)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 cursor-pointer focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= reviewRating
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold font-mono-num ml-2 text-stone-800">
                    {reviewRating}.0 / 5.0
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Written Feedback
                </label>
                <textarea
                  required
                  rows={3}
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  placeholder="Describe how they communicated, the quality of their deliverable, and their technical craftsmanship..."
                  className="w-full text-xs sm:text-sm p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 bg-stone-50/50"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setReviewCollab(null)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Submit Verified Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
