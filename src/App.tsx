/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Student,
  Project,
  CollaborationRequest,
  TalentSearchParams,
  TalentSearchResult
} from './types';
import {
  getAllStudents,
  getCurrentUser,
  setCurrentUser,
  saveStudent,
  saveProject,
  deleteProject,
  saveCollabRequest,
  initializeStorage
} from './services/storage';
import {
  parseTalentQueryWithGemma4,
  rankStudentsWithGemmaParams
} from './services/api';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { StudentCard } from './components/StudentCard';
import { StudentProfileModal } from './components/StudentProfileModal';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { CollaborationModal } from './components/CollaborationModal';
import { ProjectEditorModal } from './components/ProjectEditorModal';
import { OnboardingModal } from './components/OnboardingModal';
import { DashboardView } from './components/DashboardView';
import { SettingsModal } from './components/SettingsModal';
import { DialogflowWidget } from './components/DialogflowWidget';
import { Footer } from './components/Footer';
import {
  Sparkles,
  Filter,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Star,
  Users,
  Search,
  X,
  Compass,
  AlertTriangle
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUserState] = useState<Student>(() => {
    initializeStorage();
    return getCurrentUser();
  });
  const [students, setStudents] = useState<Student[]>(() => getAllStudents());
  const [currentView, setCurrentView] = useState<'explore' | 'dashboard'>('explore');

  // Filter and Category States
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedUniversity, setSelectedUniversity] = useState<string>('UNIBEN');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  // AI Talent Search State
  const [isSearching, setIsSearching] = useState(false);
  const [activeSearchQuery, setActiveSearchQuery] = useState<string | null>(null);
  const [gemmaParams, setGemmaParams] = useState<TalentSearchParams | null>(null);
  const [searchResults, setSearchResults] = useState<TalentSearchResult[] | null>(null);
  const [modelUsedInSearch, setModelUsedInSearch] = useState<string>('google/gemma-4-31b-it');
  const [searchWarning, setSearchWarning] = useState<string | null>(null);

  // Settings State
  const [preferredModel, setPreferredModel] = useState<string>('google/gemma-4-31b-it');

  // Modal States
  const [profileModalStudent, setProfileModalStudent] = useState<Student | null>(null);
  const [projectDetail, setProjectDetail] = useState<{ project: Project; student: Student } | null>(null);
  const [collabTarget, setCollabTarget] = useState<Student | null>(null);
  const [projectEditorOpen, setProjectEditorOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const refreshAllData = () => {
    const updated = getAllStudents();
    setStudents(updated);
    const updatedUser = getCurrentUser();
    setCurrentUserState(updatedUser);
  };

  const handleSwitchUser = (studentId: string) => {
    setCurrentUser(studentId);
    refreshAllData();
  };

  // Gemma 4 Talent Search Handler
  const handleAiSearch = async (query: string) => {
    setIsSearching(true);
    setActiveSearchQuery(query);
    setSearchWarning(null);

    try {
      const response = await parseTalentQueryWithGemma4(query, preferredModel);
      setGemmaParams(response.parameters);
      setModelUsedInSearch(response.modelUsed);
      if (response.warning) setSearchWarning(response.warning);

      // Perform grounded ranking using extracted parameters
      const ranked = rankStudentsWithGemmaParams(students, response.parameters);
      setSearchResults(ranked);
    } catch (err: any) {
      console.error('Talent search failed', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setActiveSearchQuery(null);
    setGemmaParams(null);
    setSearchResults(null);
    setSearchWarning(null);
  };

  // Category Filtering
  const categories = [
    { id: 'all', label: 'All Disciplines' },
    { id: 'design', label: 'Design & Brand', match: ['design', 'brand', 'typography', 'figma', 'ui/ux'] },
    { id: 'tech', label: 'Software & Mobile', match: ['react', 'mobile', 'flutter', 'python', 'go', 'engineering'] },
    { id: 'photo', label: 'Photography & Film', match: ['photo', 'documentary', 'motion', 'video'] },
    { id: 'spatial', label: '3D & Architecture', match: ['3d', 'blender', 'architecture', 'unreal'] },
    { id: 'writing', label: 'Writing & Law', match: ['legal', 'writing', 'copyediting', 'research'] },
  ];

  const filteredStudents = students.filter((student) => {
    // 1. Category Filter
    if (selectedCategory !== 'all') {
      const cat = categories.find(c => c.id === selectedCategory);
      if (cat && cat.match) {
        const studentText = `${student.headline} ${student.department} ${student.skills.join(' ')}`.toLowerCase();
        const matchesCat = cat.match.some(m => studentText.includes(m));
        if (!matchesCat) return false;
      }
    }

    // 2. University Filter
    if (selectedUniversity !== 'all') {
      if (!student.university.includes(selectedUniversity)) return false;
    }

    // 3. Level Filter
    if (selectedLevel !== 'all') {
      if (student.academicLevel !== selectedLevel) return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans selection:bg-stone-900 selection:text-stone-50">
      {/* 3-Zone Top Bar Navigation */}
      <Navbar
        currentUser={currentUser}
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenOnboarding={() => setOnboardingOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'explore' ? (
          <div>
            {/* Hero Section with Leica Aesthetic & Gemma 4 Search Bar */}
            <Hero
              onSearch={handleAiSearch}
              isSearching={isSearching}
              activeModelName={preferredModel.split('/')[1] || 'Gemma 4'}
            />

            {/* AI Search Results Panel (when query is active) */}
            {activeSearchQuery && (
              <section className="bg-stone-100/90 border-b border-stone-200 py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="bg-white rounded-2xl border border-stone-300 p-6 sm:p-8 shadow-sm">
                    {/* Header with Extracted Gemma 4 Parameters */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
                          <Sparkles className="w-4 h-4 text-amber-700" />
                          <span>Gemma 4 Grounded Search Output</span>
                          <span aria-hidden="true" className="text-stone-300">·</span>
                          <span className="font-mono-num lowercase text-stone-600">Model: {modelUsedInSearch}</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold font-editorial text-stone-900">
                          Results for: "{activeSearchQuery}"
                        </h2>
                      </div>
                      <button
                        onClick={handleClearSearch}
                        className="px-3.5 py-1.5 border border-stone-300 hover:border-stone-500 text-stone-700 hover:text-stone-950 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Clear Search</span>
                      </button>
                    </div>

                    {/* Extracted Query Breakdown */}
                    {gemmaParams && (
                      <div className="py-4 text-xs text-stone-600 border-b border-stone-100 flex flex-wrap items-center gap-y-2 gap-x-4">
                        <span className="font-semibold text-stone-800">Interpreted Intent:</span>
                        <span>{gemmaParams.rawInterpretation || 'Campus skills & qualifications matched'}</span>
                        {gemmaParams.skills && gemmaParams.skills.length > 0 && (
                          <>
                            <span className="text-stone-300">|</span>
                            <span>Target Skills: <strong className="text-stone-800">{gemmaParams.skills.join(', ')}</strong></span>
                          </>
                        )}
                        {gemmaParams.university && (
                          <>
                            <span className="text-stone-300">|</span>
                            <span>University: <strong className="text-stone-800">{gemmaParams.university}</strong></span>
                          </>
                        )}
                        {gemmaParams.academicLevel && (
                          <>
                            <span className="text-stone-300">|</span>
                            <span>Level: <strong className="text-stone-800">{gemmaParams.academicLevel}</strong></span>
                          </>
                        )}
                      </div>
                    )}

                    {searchWarning && (
                      <div className="p-3 my-4 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{searchWarning}</span>
                      </div>
                    )}

                    {/* Results List */}
                    <div className="pt-6">
                      {searchResults && searchResults.length > 0 ? (
                        <div className="space-y-4">
                          <p className="text-xs font-semibold text-stone-500 mb-3">
                            Found {searchResults.length} {searchResults.length === 1 ? 'coursemate' : 'coursemates'} ranked by query relevance and portfolio evidence:
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {searchResults.map(({ student, matchScore, groundedReason, matchedSkills }) => (
                              <div key={student.id} className="relative">
                                {/* Grounded Match Badge Overlay */}
                                <div className="mb-2 px-3 py-1.5 bg-stone-100 rounded-lg border border-stone-200 text-[11px] text-stone-700 leading-snug">
                                  <span className="font-semibold text-emerald-800 block mb-0.5">
                                    Match Reason (Grounded):
                                  </span>
                                  {groundedReason}
                                </div>
                                <StudentCard
                                  student={student}
                                  onViewProfile={(s) => setProfileModalStudent(s)}
                                  onSelectProject={(p, s) => setProjectDetail({ project: p, student: s })}
                                  onRequestCollab={(s) => setCollabTarget(s)}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-stone-500 text-xs">
                          <p className="font-semibold text-stone-800 mb-1">No matching student records found for this specific query.</p>
                          <p>Try searching by broad skill ("graphic design", "python", "photography") or clearing the search to browse all campus talent.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Explore Talent Directory Section */}
            <section id="featured-talent" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              {/* Directory Header with Segmented Filter Tabs */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
                    Verified Campus Portfolios
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold font-editorial text-stone-900">
                    Explore Student Talent
                  </h2>
                </div>

                {/* Filter Controls (Segmented Tabs & Dropdowns) */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* University Dropdown */}
                  <select
                    value={selectedUniversity}
                    onChange={(e) => setSelectedUniversity(e.target.value)}
                    className="text-xs py-2 px-3 bg-white border border-stone-200 hover:border-stone-400 rounded-lg text-stone-700 focus:outline-none focus:border-stone-900 cursor-pointer font-medium"
                  >
                    <option value="UNIBEN">University of Benin (UNIBEN)</option>
                    <option value="all">All Universities</option>
                    <option value="UNILAG">UNILAG</option>
                    <option value="UI">UI</option>
                    <option value="FUTA">FUTA</option>
                    <option value="Covenant">Covenant</option>
                    <option value="OAU">OAU</option>
                    <option value="UNN">UNN</option>
                    <option value="ABU">ABU</option>
                    <option value="FUTMINNA">FUTMINNA</option>
                  </select>

                  {/* Level Dropdown */}
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="text-xs py-2 px-3 bg-white border border-stone-200 hover:border-stone-400 rounded-lg text-stone-700 focus:outline-none focus:border-stone-900 cursor-pointer"
                  >
                    <option value="all">All Levels</option>
                    <option value="100 Level">100 Level</option>
                    <option value="200 Level">200 Level</option>
                    <option value="300 Level">300 Level</option>
                    <option value="400 Level">400 Level</option>
                    <option value="500 Level">500 Level</option>
                  </select>
                </div>
              </div>

              {/* Segmented Discipline Tabs (Clean functional buttons) */}
              <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl max-w-full overflow-x-auto mb-8 border border-stone-200/60">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`py-2 px-3.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                      selectedCategory === cat.id
                        ? 'bg-white text-stone-950 shadow-xs'
                        : 'text-stone-600 hover:text-stone-950'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* 3-Column Desktop Grid for Student Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {filteredStudents.map((student) => (
                  <StudentCard
                    key={student.id}
                    student={student}
                    onViewProfile={(s) => setProfileModalStudent(s)}
                    onSelectProject={(p, s) => setProjectDetail({ project: p, student: s })}
                    onRequestCollab={(s) => setCollabTarget(s)}
                  />
                ))}
              </div>

              {filteredStudents.length === 0 && (
                <div className="text-center py-20 bg-white border border-stone-200 rounded-2xl p-8">
                  <p className="text-sm font-semibold text-stone-800">No student profiles match your filter criteria.</p>
                  <p className="text-xs text-stone-500 mt-1">Try selecting "All Universities" or "All Disciplines".</p>
                </div>
              )}
            </section>

            {/* How It Works & Transparent Reputation Section */}
            <section id="how-it-works" className="border-t border-stone-200 bg-stone-100/60 py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mb-12">
                  <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
                    Transparent Mechanics
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold font-editorial text-stone-900 mb-3">
                    How What U Do? Verifies Student Craft
                  </h2>
                  <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                    Generic freelance marketplaces rely on paid promotions and unverified reviews.
                    What U Do? uses a deterministic four-pillar reputation algorithm grounded strictly in verified on-campus proof.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="p-6 bg-white border border-stone-200 rounded-xl shadow-xs">
                    <span className="text-xs font-mono-num font-bold text-amber-800 mb-2 block">
                      01 / 40% Weight
                    </span>
                    <h3 className="font-bold text-sm text-stone-900 mb-1">Confirmed Collaborations</h3>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      A project counts as completed only after both student participants confirm the deliverable.
                    </p>
                  </div>

                  <div className="p-6 bg-white border border-stone-200 rounded-xl shadow-xs">
                    <span className="text-xs font-mono-num font-bold text-amber-800 mb-2 block">
                      02 / 30% Weight
                    </span>
                    <h3 className="font-bold text-sm text-stone-900 mb-1">Authentic Reviews</h3>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      Self-reviews and duplicate reviews are blocked. Reviews are tied directly to confirmed collaborations.
                    </p>
                  </div>

                  <div className="p-6 bg-white border border-stone-200 rounded-xl shadow-xs">
                    <span className="text-xs font-mono-num font-bold text-amber-800 mb-2 block">
                      03 / 20% Weight
                    </span>
                    <h3 className="font-bold text-sm text-stone-900 mb-1">Portfolio Evidence</h3>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      Public proof links to GitHub repos, Figma files, Behance cases, and live URLs boost student authority.
                    </p>
                  </div>

                  <div className="p-6 bg-white border border-stone-200 rounded-xl shadow-xs">
                    <span className="text-xs font-mono-num font-bold text-amber-800 mb-2 block">
                      04 / 10% Weight
                    </span>
                    <h3 className="font-bold text-sm text-stone-900 mb-1">Profile Completeness</h3>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      Verified university department, academic level, and clear professional headline.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : (
          /* Student Dashboard Workspace Screen */
          <DashboardView
            currentUser={currentUser}
            onRefreshUser={refreshAllData}
            onEditProfile={() => setOnboardingOpen(true)}
            onOpenNewProject={() => {
              setProjectToEdit(null);
              setProjectEditorOpen(true);
            }}
            onEditProject={(project) => {
              setProjectToEdit(project);
              setProjectEditorOpen(true);
            }}
            onSelectProject={(project, student) => setProjectDetail({ project, student })}
            onSwitchStudent={handleSwitchUser}
          />
        )}
      </main>

      {/* Floating Dialogflow CX Campus Assistant Widget */}
      <DialogflowWidget
        onOpenOnboarding={() => setOnboardingOpen(true)}
        onOpenNewProject={() => {
          setProjectToEdit(null);
          setProjectEditorOpen(true);
        }}
      />

      {/* Editorial Footer */}
      <Footer onOpenSettings={() => setSettingsOpen(true)} />

      {/* Modals */}
      <StudentProfileModal
        student={profileModalStudent}
        onClose={() => setProfileModalStudent(null)}
        onSelectProject={(proj, s) => setProjectDetail({ project: proj, student: s })}
        onRequestCollab={(s) => setCollabTarget(s)}
      />

      <ProjectDetailModal
        project={projectDetail?.project || null}
        student={projectDetail?.student || null}
        onClose={() => setProjectDetail(null)}
        onViewStudentProfile={(s) => setProfileModalStudent(s)}
        onRequestCollab={(s) => setCollabTarget(s)}
      />

      <CollaborationModal
        targetStudent={collabTarget}
        currentUser={currentUser}
        isOpen={Boolean(collabTarget)}
        onClose={() => setCollabTarget(null)}
        onSubmit={(req) => {
          saveCollabRequest(req);
          refreshAllData();
          alert(`Collaboration proposal sent to ${req.toStudentName}!`);
        }}
      />

      <ProjectEditorModal
        projectToEdit={projectToEdit}
        currentUser={currentUser}
        isOpen={projectEditorOpen}
        onClose={() => {
          setProjectEditorOpen(false);
          setProjectToEdit(null);
        }}
        onSave={(saved) => {
          saveProject(saved);
          refreshAllData();
        }}
        onDelete={(id) => {
          deleteProject(id);
          refreshAllData();
        }}
      />

      <OnboardingModal
        currentUser={currentUser}
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        onSave={(updated) => {
          saveStudent(updated);
          refreshAllData();
        }}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        preferredModel={preferredModel}
        onSelectPreferredModel={(m) => setPreferredModel(m)}
      />
    </div>
  );
}
