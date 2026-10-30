/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AcademicLevel = '100 Level' | '200 Level' | '300 Level' | '400 Level' | '500 Level' | 'Postgraduate' | 'Alumni';

export type CollaborationStatus = 'pending' | 'accepted' | 'declined' | 'in_progress' | 'completed';

export interface Project {
  id: string;
  studentId: string;
  title: string;
  description: string;
  skills: string[];
  coverImage: string;
  evidenceLink: string;
  evidencePlatform?: 'github' | 'figma' | 'behance' | 'dribbble' | 'youtube' | 'drive' | 'web';
  completionDate: string;
  featured?: boolean;
}

export interface Review {
  id: string;
  collaborationId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  targetStudentId: string;
  rating: number; // 1 - 5
  feedback: string;
  createdAt: string;
  projectTitle: string;
}

export interface CollaborationRequest {
  id: string;
  fromStudentId: string;
  fromStudentName: string;
  fromStudentAvatar: string;
  fromStudentUniversity: string;
  toStudentId: string;
  toStudentName: string;
  projectDescription: string;
  expectedOutcome: string;
  timeframe: string;
  message?: string;
  status: CollaborationStatus;
  createdAt: string;
  completedAt?: string;
  bothConfirmed?: boolean;
}

export interface Student {
  id: string;
  name: string;
  avatar: string;
  university: string;
  faculty: string;
  department: string;
  academicLevel: AcademicLevel;
  headline: string;
  bio: string;
  skills: string[];
  collaborationInterests: string[];
  socialLinks: {
    github?: string;
    figma?: string;
    behance?: string;
    linkedin?: string;
    twitter?: string;
    portfolio?: string;
    youtube?: string;
  };
  reputation: {
    score: number; // 0 - 100
    completedCollabs: number;
    ratingAverage: number;
    reviewCount: number;
    portfolioScore: number;
    profileCompleteness: number;
  };
  isDemo?: boolean;
  createdAt: string;
  projects?: Project[];
}

export interface TalentSearchParams {
  skills: string[];
  university?: string;
  department?: string;
  academicLevel?: string;
  keywords: string[];
  rawInterpretation?: string;
}

export interface TalentSearchResult {
  student: Student;
  matchScore: number;
  groundedReason: string;
  matchedSkills: string[];
}

export interface AiProjectImprovement {
  title?: string;
  improvedTitle?: string;
  improvedDescription: string;
  suggestedSkills: string[];
  highlightedAchievements: string[];
  rationale: string;
}
