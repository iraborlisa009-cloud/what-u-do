/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student, Project, Review, CollaborationRequest } from '../types';
import { DEMO_STUDENTS, DEMO_PROJECTS, DEMO_REVIEWS } from '../data/demoStudents';

const STORAGE_KEYS = {
  STUDENTS: 'what_u_do_students_v2',
  PROJECTS: 'what_u_do_projects_v2',
  COLLABS: 'what_u_do_collabs_v2',
  REVIEWS: 'what_u_do_reviews_v2',
  CURRENT_USER_ID: 'what_u_do_current_user_id_v2',
  OPENROUTER_USER_KEY: 'what_u_do_openrouter_key_v1',
};

// Calculate deterministic reputation score
export function calculateReputationScore(
  student: Student,
  projects: Project[],
  reviews: Review[],
  completedCollabsCount: number
): {
  score: number;
  completedCollabs: number;
  ratingAverage: number;
  reviewCount: number;
  portfolioScore: number;
  profileCompleteness: number;
} {
  // 1. Confirmed Collaborations (40% weight, max at 10 collabs)
  const collabFactor = Math.min(completedCollabsCount / 10, 1) * 40;

  // 2. Ratings & Review Confidence (30% weight)
  let ratingAverage = 5.0;
  let reviewFactor = 0;
  if (reviews.length > 0) {
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    ratingAverage = Number((sum / reviews.length).toFixed(1));
    // Bayesean confidence damper for low counts: needs at least 5 reviews to reach full 30
    const volumeMultiplier = Math.min(reviews.length / 5, 1);
    reviewFactor = (ratingAverage / 5) * 30 * volumeMultiplier;
  } else {
    // Baseline review factor for new profiles with no collabs
    reviewFactor = 0;
  }

  // 3. Portfolio Evidence (20% weight)
  // Rewards actual projects with verified links (github, figma, behance, etc.)
  let portfolioScore = 0;
  if (projects.length > 0) {
    const verifiedLinksCount = projects.filter(p => p.evidenceLink && p.evidenceLink.startsWith('http')).length;
    const projectVolume = Math.min(projects.length / 4, 1) * 10;
    const linkQuality = Math.min(verifiedLinksCount / 3, 1) * 10;
    portfolioScore = Math.round((projectVolume + linkQuality) * 5); // 0-100 scale for subscore
  }
  const portfolioFactor = (portfolioScore / 100) * 20;

  // 4. Profile Completeness (10% weight)
  let completenessItems = 0;
  if (student.headline && student.headline.length > 10) completenessItems += 20;
  if (student.bio && student.bio.length > 20) completenessItems += 20;
  if (student.skills && student.skills.length >= 3) completenessItems += 20;
  if (student.avatar) completenessItems += 20;
  if (student.university && student.department && student.academicLevel) completenessItems += 20;
  const profileCompleteness = completenessItems;
  const profileFactor = (profileCompleteness / 100) * 10;

  const totalScore = Math.min(Math.round(collabFactor + reviewFactor + portfolioFactor + profileFactor), 100);

  return {
    score: totalScore,
    completedCollabs: completedCollabsCount,
    ratingAverage,
    reviewCount: reviews.length,
    portfolioScore,
    profileCompleteness,
  };
}

export function initializeStorage(): void {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(DEMO_STUDENTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(DEMO_PROJECTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(DEMO_REVIEWS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.COLLABS)) {
    // Seed initial demo collaboration
    const initialCollabs: CollaborationRequest[] = [
      {
        id: 'collab-seed-1',
        fromStudentId: 'student-12',
        fromStudentName: 'Emeka Uchenna',
        fromStudentAvatar: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=300&auto=format&fit=crop&q=80',
        fromStudentUniversity: 'Covenant University (CU)',
        toStudentId: 'student-1',
        toStudentName: 'Damilola Adebayo',
        projectDescription: 'Student incubator pitch deck redesign and custom typography packaging.',
        expectedOutcome: 'High-conversion pitch deck deck template in Figma and print brand guidelines.',
        timeframe: '2 Weeks',
        message: 'Loved your Aura press typography project. Would love to partner on our university incubator pitch.',
        status: 'completed',
        createdAt: '2026-03-01T10:00:00Z',
        completedAt: '2026-03-15T12:00:00Z',
        bothConfirmed: true,
      },
      {
        id: 'collab-seed-2',
        fromStudentId: 'student-1',
        fromStudentName: 'Damilola Adebayo',
        fromStudentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        fromStudentUniversity: 'University of Benin (UNIBEN)',
        toStudentId: 'student-2',
        toStudentName: 'Chisom Okonkwo',
        projectDescription: 'Frontend implementation of student creative collective token marketplace.',
        expectedOutcome: 'Interactive React Native component library.',
        timeframe: '3 Weeks',
        status: 'completed',
        createdAt: '2026-02-10T11:00:00Z',
        completedAt: '2026-02-28T16:00:00Z',
        bothConfirmed: true,
      },
    ];
    localStorage.setItem(STORAGE_KEYS.COLLABS, JSON.stringify(initialCollabs));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID)) {
    // Default logged in user is student-1 (Damilola Adebayo) for quick live testing,
    // or user can switch or create new profile
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, 'student-1');
  }
}

export function getAllStudents(): Student[] {
  initializeStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    const students: Student[] = raw ? JSON.parse(raw) : DEMO_STUDENTS;
    const allProjects = getAllProjects();
    const allReviews = getAllReviews();
    const allCollabs = getAllCollabs();

    // Recalculate deterministic reputation
    return students.map(student => {
      const studentProjects = allProjects.filter(p => p.studentId === student.id);
      const studentReviews = allReviews.filter(r => r.targetStudentId === student.id);
      const studentCompletedCollabs = allCollabs.filter(
        c => (c.toStudentId === student.id || c.fromStudentId === student.id) && c.status === 'completed'
      ).length;

      const reputation = calculateReputationScore(
        student,
        studentProjects,
        studentReviews,
        studentCompletedCollabs
      );

      return {
        ...student,
        reputation,
        projects: studentProjects,
      };
    });
  } catch (e) {
    console.error('Failed to parse students from localStorage', e);
    return DEMO_STUDENTS;
  }
}

export function getStudentById(id: string): Student | undefined {
  const students = getAllStudents();
  return students.find(s => s.id === id);
}

export function saveStudent(student: Student): void {
  const students = getAllStudents();
  const existingIdx = students.findIndex(s => s.id === student.id);
  if (existingIdx >= 0) {
    students[existingIdx] = student;
  } else {
    students.unshift(student);
  }
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
}

export function getAllProjects(): Project[] {
  initializeStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return raw ? JSON.parse(raw) : DEMO_PROJECTS;
  } catch {
    return DEMO_PROJECTS;
  }
}

export function getProjectsByStudent(studentId: string): Project[] {
  const all = getAllProjects();
  return all.filter(p => p.studentId === studentId);
}

export function saveProject(project: Project): void {
  const projects = getAllProjects();
  const idx = projects.findIndex(p => p.id === project.id);
  if (idx >= 0) {
    projects[idx] = project;
  } else {
    projects.unshift(project);
  }
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
}

export function deleteProject(projectId: string): void {
  const projects = getAllProjects();
  const filtered = projects.filter(p => p.id !== projectId);
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(filtered));
}

export function getAllReviews(): Review[] {
  initializeStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    return raw ? JSON.parse(raw) : DEMO_REVIEWS;
  } catch {
    return DEMO_REVIEWS;
  }
}

export function getReviewsForStudent(studentId: string): Review[] {
  const all = getAllReviews();
  return all.filter(r => r.targetStudentId === studentId);
}

export function addReview(review: Review): { success: boolean; error?: string } {
  // Integrity validation:
  if (review.authorId === review.targetStudentId) {
    return { success: false, error: 'Self-reviews are strictly forbidden.' };
  }

  // Must correspond to a completed collaboration
  const collabs = getAllCollabs();
  const collab = collabs.find(c => c.id === review.collaborationId);
  if (!collab || collab.status !== 'completed') {
    return { success: false, error: 'Reviews require a confirmed, completed collaboration.' };
  }

  // Prevent duplicate review for the same collaboration by the same author
  const existingReviews = getAllReviews();
  const duplicate = existingReviews.find(
    r => r.collaborationId === review.collaborationId && r.authorId === review.authorId
  );
  if (duplicate) {
    return { success: false, error: 'You have already submitted a review for this collaboration.' };
  }

  existingReviews.unshift(review);
  localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(existingReviews));
  return { success: true };
}

export function getAllCollabs(): CollaborationRequest[] {
  initializeStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COLLABS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getCollabsForStudent(studentId: string): {
  inbound: CollaborationRequest[];
  outbound: CollaborationRequest[];
} {
  const all = getAllCollabs();
  return {
    inbound: all.filter(c => c.toStudentId === studentId),
    outbound: all.filter(c => c.fromStudentId === studentId),
  };
}

export function saveCollabRequest(request: CollaborationRequest): void {
  const collabs = getAllCollabs();
  const idx = collabs.findIndex(c => c.id === request.id);
  if (idx >= 0) {
    collabs[idx] = request;
  } else {
    collabs.unshift(request);
  }
  localStorage.setItem(STORAGE_KEYS.COLLABS, JSON.stringify(collabs));
}

export function updateCollabStatus(
  collabId: string,
  newStatus: CollaborationRequest['status'],
  actorStudentId: string
): { success: boolean; error?: string } {
  const collabs = getAllCollabs();
  const idx = collabs.findIndex(c => c.id === collabId);
  if (idx === -1) return { success: false, error: 'Collaboration request not found.' };

  const item = collabs[idx];
  // Verify actor permission
  if (item.toStudentId !== actorStudentId && item.fromStudentId !== actorStudentId) {
    return { success: false, error: 'Unauthorized to change this collaboration.' };
  }

  if (newStatus === 'completed') {
    // Both confirmed check
    item.bothConfirmed = true;
    item.status = 'completed';
    item.completedAt = new Date().toISOString();
  } else {
    item.status = newStatus;
  }

  collabs[idx] = item;
  localStorage.setItem(STORAGE_KEYS.COLLABS, JSON.stringify(collabs));
  return { success: true };
}

export function getCurrentUser(): Student {
  initializeStorage();
  const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || 'student-1';
  const student = getStudentById(currentId);
  if (student) return student;

  // Fallback to first student
  const students = getAllStudents();
  return students[0] || DEMO_STUDENTS[0];
}

export function setCurrentUser(studentId: string): void {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, studentId);
}

export function getCustomOpenRouterKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEYS.OPENROUTER_USER_KEY) || '';
}

export function setCustomOpenRouterKey(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.OPENROUTER_USER_KEY, key.trim());
}
