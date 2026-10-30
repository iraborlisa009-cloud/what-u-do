/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Student, AcademicLevel } from '../types';
import { X, UserCheck, Sparkles, Building, BookOpen, Layers } from 'lucide-react';

interface OnboardingModalProps {
  currentUser: Student;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Student) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(currentUser.name);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [university, setUniversity] = useState(currentUser.university);
  const [faculty, setFaculty] = useState(currentUser.faculty);
  const [department, setDepartment] = useState(currentUser.department);
  const [academicLevel, setAcademicLevel] = useState<AcademicLevel>(currentUser.academicLevel);
  const [headline, setHeadline] = useState(currentUser.headline);
  const [bio, setBio] = useState(currentUser.bio);
  const [skills, setSkills] = useState<string[]>(currentUser.skills);
  const [skillInput, setSkillInput] = useState('');
  const [collabInterests, setCollabInterests] = useState(
    currentUser.collaborationInterests.join(', ')
  );
  const [github, setGithub] = useState(currentUser.socialLinks?.github || '');
  const [figma, setFigma] = useState(currentUser.socialLinks?.figma || '');
  const [behance, setBehance] = useState(currentUser.socialLinks?.behance || '');
  const [linkedin, setLinkedin] = useState(currentUser.socialLinks?.linkedin || '');

  if (!isOpen) return null;

  const universities = [
    'University of Benin (UNIBEN)',
    'University of Lagos (UNILAG)',
    'University of Ibadan (UI)',
    'Federal University of Technology, Akure (FUTA)',
    'Covenant University (CU)',
    'Obafemi Awolowo University (OAU)',
    'University of Nigeria, Nsukka (UNN)',
    'Ahmadu Bello University (ABU)',
    'Federal University of Technology, Minna (FUTMINNA)',
    'Lagos State University (LASU)',
    'Babcock University',
  ];

  const levels: AcademicLevel[] = [
    '100 Level',
    '200 Level',
    '300 Level',
    '400 Level',
    '500 Level',
    'Postgraduate',
    'Alumni',
  ];

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Student = {
      ...currentUser,
      name: name.trim(),
      avatar: avatar.trim() || currentUser.avatar,
      university,
      faculty: faculty.trim(),
      department: department.trim(),
      academicLevel,
      headline: headline.trim(),
      bio: bio.trim(),
      skills,
      collaborationInterests: collabInterests.split(',').map(s => s.trim()).filter(Boolean),
      socialLinks: {
        github: github.trim() || undefined,
        figma: figma.trim() || undefined,
        behance: behance.trim() || undefined,
        linkedin: linkedin.trim() || undefined,
      },
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-stone-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div>
            <h3 className="text-xl font-bold font-editorial text-stone-900">
              Student Profile & Onboarding
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Set up your public university persona so coursemates discover what you do.
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
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 sm:p-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs sm:text-sm p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 bg-stone-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Avatar Image URL
              </label>
              <input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full text-xs sm:text-sm p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 bg-stone-50/50"
              />
            </div>
          </div>

          {/* Academic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                University *
              </label>
              <select
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full text-xs sm:text-sm p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 bg-stone-50/50"
              >
                {universities.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Academic Level *
              </label>
              <select
                value={academicLevel}
                onChange={(e) => setAcademicLevel(e.target.value as AcademicLevel)}
                className="w-full text-xs sm:text-sm p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 bg-stone-50/50"
              >
                {levels.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Faculty / School
              </label>
              <input
                type="text"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                placeholder="e.g. Faculty of Environmental Sciences"
                className="w-full text-xs sm:text-sm p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 bg-stone-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Computer Science"
                className="w-full text-xs sm:text-sm p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 bg-stone-50/50"
              />
            </div>
          </div>

          {/* Headline */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Professional Headline *
            </label>
            <input
              type="text"
              required
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Cross-Platform Mobile Engineer (React Native & Flutter)"
              className="w-full text-xs sm:text-sm p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 bg-stone-50/50"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Biography & What You Build
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell coursemates about your projects, experience, and the problems you love solving..."
              className="w-full text-xs sm:text-sm p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 bg-stone-50/50"
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Skills & Tools
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
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="Add skill tag (press Enter)..."
                className="flex-1 text-xs p-2 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 bg-stone-50/50"
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

          {/* Social Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                GitHub URL
              </label>
              <input
                type="url"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full text-xs p-2 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 bg-stone-50/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Figma or Behance URL
              </label>
              <input
                type="url"
                value={figma || behance}
                onChange={(e) => {
                  setFigma(e.target.value);
                  setBehance(e.target.value);
                }}
                placeholder="https://behance.net/... or https://figma.com/..."
                className="w-full text-xs p-2 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 bg-stone-50/50"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
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
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
