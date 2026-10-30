/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Project, Student, AiProjectImprovement } from '../types';
import { improveProjectWithGemma4, extractSkillsWithGemma4 } from '../services/api';
import {
  X,
  Sparkles,
  Loader2,
  Check,
  Plus,
  Trash2,
  ExternalLink,
  ImageIcon,
  Wand2,
  AlertCircle
} from 'lucide-react';

interface ProjectEditorModalProps {
  projectToEdit?: Project | null;
  currentUser: Student;
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Project) => void;
  onDelete?: (projectId: string) => void;
}

export const ProjectEditorModal: React.FC<ProjectEditorModalProps> = ({
  projectToEdit,
  currentUser,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState(projectToEdit?.title || '');
  const [description, setDescription] = useState(projectToEdit?.description || '');
  const [skills, setSkills] = useState<string[]>(projectToEdit?.skills || []);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [coverImage, setCoverImage] = useState(
    projectToEdit?.coverImage || '/src/assets/images/portfolio_brand_identity_1793366542681.jpg'
  );
  const [evidenceLink, setEvidenceLink] = useState(projectToEdit?.evidenceLink || '');
  const [evidencePlatform, setEvidencePlatform] = useState<Project['evidencePlatform']>(
    projectToEdit?.evidencePlatform || 'github'
  );
  const [completionDate, setCompletionDate] = useState(
    projectToEdit?.completionDate || 'April 2026'
  );

  // AI Assistant States
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiProposal, setAiProposal] = useState<AiProjectImprovement | null>(null);
  const [aiWarning, setAiWarning] = useState<string | null>(null);

  if (!isOpen) return null;

  const sampleCoverImages = [
    { label: 'Brand & Typography', url: '/src/assets/images/portfolio_brand_identity_1793366542681.jpg' },
    { label: 'Mobile & UI/UX App', url: '/src/assets/images/portfolio_mobile_app_1793366542747.jpg' },
    { label: 'Documentary Photography', url: '/src/assets/images/portfolio_photo_series_1793366544527.jpg' },
    { label: '3D Spatial Pavilion', url: '/src/assets/images/portfolio_motion_reel_1793366800725.jpg' },
    { label: 'Workshop Collaboration', url: '/src/assets/images/hero_student_creative_1793366541830.jpg' },
  ];

  const handleAddSkill = () => {
    if (newSkillInput.trim() && !skills.includes(newSkillInput.trim())) {
      setSkills([...skills, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  // AI Action 1: Polish Project with Gemma 4
  const handleImproveWithAi = async () => {
    if (!description.trim()) {
      alert('Please write at least a brief project draft first so Gemma 4 can ground its suggestions in your work.');
      return;
    }
    setIsAiLoading(true);
    setAiWarning(null);
    try {
      const res = await improveProjectWithGemma4(title, description, skills);
      setAiProposal(res.data);
      if (res.warning) setAiWarning(res.warning);
    } catch (e: any) {
      alert(`AI improvement error: ${e.message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  // AI Action 2: Suggest Skills with Gemma 4
  const handleExtractSkillsWithAi = async () => {
    if (!description.trim() && !title.trim()) return;
    setIsAiLoading(true);
    try {
      const res = await extractSkillsWithGemma4(`${title}\n${description}`);
      const combined = Array.from(new Set([...skills, ...res.skills]));
      setSkills(combined);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  // User Approval of AI Proposal
  const handleApplyAiProposal = () => {
    if (!aiProposal) return;
    if (aiProposal.improvedTitle) setTitle(aiProposal.improvedTitle);
    if (aiProposal.improvedDescription) setDescription(aiProposal.improvedDescription);
    if (aiProposal.suggestedSkills) {
      const merged = Array.from(new Set([...skills, ...aiProposal.suggestedSkills]));
      setSkills(merged);
    }
    setAiProposal(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const saved: Project = {
      id: projectToEdit?.id || `proj-${Date.now()}`,
      studentId: currentUser.id,
      title: title.trim(),
      description: description.trim(),
      skills: skills.length > 0 ? skills : ['General Execution'],
      coverImage,
      evidenceLink: evidenceLink.trim(),
      evidencePlatform,
      completionDate,
      featured: projectToEdit?.featured ?? true,
    };

    onSave(saved);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-stone-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div>
            <h3 className="text-xl font-bold font-editorial text-stone-900">
              {projectToEdit ? 'Edit Portfolio Project' : 'Publish New Portfolio Project'}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Showcase genuine work to your coursemates with verifiable evidence links.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 sm:p-8 space-y-6">
          {/* AI Banner Callout */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-950">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-800 shrink-0" />
              <span>
                <strong>Gemma 4 Portfolio Assistant:</strong> Polish grammar, highlight grounded achievements, and suggest tags. You must approve generated text before saving.
              </span>
            </div>
            <button
              type="button"
              onClick={handleImproveWithAi}
              disabled={isAiLoading || !description.trim()}
              className="px-3 py-1.5 bg-amber-900 hover:bg-amber-800 disabled:opacity-40 text-white rounded-lg font-medium text-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            >
              {isAiLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Thinking...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Improve with AI</span>
                </>
              )}
            </button>
          </div>

          {/* AI Proposal Review Card (Student Must Explicitly Approve) */}
          {aiProposal && (
            <div className="p-5 border-2 border-amber-300 rounded-xl bg-amber-50/40 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  <span>Gemma 4 Proposed Improvements (Grounded)</span>
                </span>
                <span className="text-[11px] text-stone-500 italic">
                  {aiProposal.rationale}
                </span>
              </div>

              {aiProposal.improvedTitle && (
                <div>
                  <span className="text-[11px] text-stone-500 block font-medium">Suggested Title:</span>
                  <p className="text-sm font-semibold text-stone-900">{aiProposal.improvedTitle}</p>
                </div>
              )}

              <div>
                <span className="text-[11px] text-stone-500 block font-medium">Polished Description:</span>
                <p className="text-xs sm:text-sm text-stone-800 leading-relaxed bg-white p-3 rounded-lg border border-stone-200 whitespace-pre-line">
                  {aiProposal.improvedDescription}
                </p>
              </div>

              {aiProposal.highlightedAchievements && aiProposal.highlightedAchievements.length > 0 && (
                <div>
                  <span className="text-[11px] text-stone-500 block font-medium">Grounded Highlights:</span>
                  <ul className="list-disc list-inside text-xs text-stone-700 space-y-0.5">
                    {aiProposal.highlightedAchievements.map((ach, idx) => (
                      <li key={idx}>{ach}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAiProposal(null)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  Discard Proposal
                </button>
                <button
                  type="button"
                  onClick={handleApplyAiProposal}
                  className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve & Apply Text</span>
                </button>
              </div>
            </div>
          )}

          {/* Project Title */}
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Aura Minimalist Editorial Brand Identity"
              className="w-full text-sm p-3 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 bg-stone-50/40"
            />
          </div>

          {/* Project Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-stone-800">
                Project Narrative & Execution Details *
              </label>
              <button
                type="button"
                onClick={handleExtractSkillsWithAi}
                disabled={isAiLoading || !description.trim()}
                className="text-[11px] text-amber-800 hover:text-amber-950 font-medium hover:underline cursor-pointer"
              >
                Auto-identify skills from text
              </button>
            </div>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the context, the student problem you solved, and tools used..."
              className="w-full text-xs sm:text-sm p-3 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 bg-stone-50/40"
            />
          </div>

          {/* Skills Tag Editor */}
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1">
              Skills Demonstrated
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-stone-100 text-stone-800 rounded-md border border-stone-200"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-red-700 ml-1 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 max-w-sm">
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="Add skill tag (e.g. React, Figma)..."
                className="flex-1 text-xs p-2 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 bg-stone-50/40"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>

          {/* Evidence Link & Platform */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                Public Evidence Link (Proof of Work)
              </label>
              <input
                type="url"
                value={evidenceLink}
                onChange={(e) => setEvidenceLink(e.target.value)}
                placeholder="https://github.com/..., https://behance.net/..."
                className="w-full text-xs sm:text-sm p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 bg-stone-50/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                Proof Platform
              </label>
              <select
                value={evidencePlatform}
                onChange={(e) => setEvidencePlatform(e.target.value as any)}
                className="w-full text-xs sm:text-sm p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 bg-stone-50/40"
              >
                <option value="github">GitHub Repository</option>
                <option value="behance">Behance Case Study</option>
                <option value="figma">Figma File / Prototype</option>
                <option value="youtube">YouTube Demo Video</option>
                <option value="drive">Google Drive Archive</option>
                <option value="web">Live Website URL</option>
              </select>
            </div>
          </div>

          {/* Cover Image Selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1.5 flex items-center justify-between">
              <span>Cover Image URL</span>
              <span className="text-[11px] text-stone-400 font-normal">Pick from curated gallery or enter custom URL</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3">
              {sampleCoverImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCoverImage(img.url)}
                  className={`text-left p-1 rounded-lg border transition-all cursor-pointer ${
                    coverImage === img.url
                      ? 'border-stone-900 ring-2 ring-stone-900/10'
                      : 'border-stone-200 hover:border-stone-400 opacity-80'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.label}
                    className="w-full aspect-16/10 object-cover rounded-sm mb-1"
                    referrerPolicy="no-referrer"
                  />
                  <p className="text-[10px] font-medium text-stone-700 truncate">{img.label}</p>
                </button>
              ))}
            </div>

            <input
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="Custom image URL..."
              className="w-full text-xs p-2 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 bg-stone-50/40"
            />
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-between gap-4">
            {projectToEdit && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this project?')) {
                    onDelete(projectToEdit.id);
                    onClose();
                  }
                }}
                className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 font-medium cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Project</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                {projectToEdit ? 'Save Changes' : 'Publish to Portfolio'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
