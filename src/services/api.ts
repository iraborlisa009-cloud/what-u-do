/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student, TalentSearchParams, TalentSearchResult, AiProjectImprovement } from '../types';
import { getCustomOpenRouterKey } from './storage';

export async function checkServerStatus(): Promise<{
  status: string;
  openRouterConfigured: boolean;
  primaryModel: string;
  fallbackModel: string;
}> {
  try {
    const res = await fetch('/api/status');
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Status check failed', e);
  }
  return {
    status: 'offline',
    openRouterConfigured: false,
    primaryModel: 'google/gemma-4-31b-it',
    fallbackModel: 'google/gemma-4-26b-a4b-it',
  };
}

export async function parseTalentQueryWithGemma4(
  query: string,
  preferredModel?: string
): Promise<{
  parameters: TalentSearchParams;
  modelUsed: string;
  warning?: string;
}> {
  const customKey = getCustomOpenRouterKey();
  try {
    const res = await fetch('/api/ai/talent-finder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        customApiKey: customKey || undefined,
        preferredModel: preferredModel || undefined,
      }),
    });

    if (!res.ok) {
      throw new Error(`Talent search request failed with status ${res.status}`);
    }

    const data = await res.json();
    return {
      parameters: data.parameters,
      modelUsed: data.modelUsed,
      warning: data.warning,
    };
  } catch (err: any) {
    console.error('AI Talent Finder error:', err);
    throw err;
  }
}

export function rankStudentsWithGemmaParams(
  students: Student[],
  params: TalentSearchParams
): TalentSearchResult[] {
  const searchSkillsLower = (params.skills || []).map(s => s.toLowerCase());
  const searchKeywordsLower = (params.keywords || []).map(k => k.toLowerCase());
  const searchUniLower = (params.university || '').toLowerCase();
  const searchLevelLower = (params.academicLevel || '').toLowerCase();

  const results: TalentSearchResult[] = [];

  for (const student of students) {
    let score = 0;
    const matchedSkills: string[] = [];

    // 1. Skill Matches (40 points per exact match, 25 for partial)
    for (const s of student.skills) {
      const sLower = s.toLowerCase();
      const directMatch = searchSkillsLower.some(q => q === sLower || sLower.includes(q) || q.includes(sLower));
      if (directMatch) {
        score += 35;
        matchedSkills.push(s);
      }
    }

    // 2. University Match (30 points)
    if (searchUniLower && student.university.toLowerCase().includes(searchUniLower)) {
      score += 30;
    }

    // 3. Academic Level Match (20 points)
    if (searchLevelLower && student.academicLevel.toLowerCase().includes(searchLevelLower)) {
      score += 20;
    }

    // 4. Keyword matches in headline, bio, and projects
    for (const kw of searchKeywordsLower) {
      if (kw.length < 3) continue;
      if (student.headline.toLowerCase().includes(kw)) score += 10;
      if (student.bio.toLowerCase().includes(kw)) score += 5;
      if (student.department.toLowerCase().includes(kw)) score += 10;
      if (student.projects?.some(p => p.title.toLowerCase().includes(kw) || p.description.toLowerCase().includes(kw))) {
        score += 15;
      }
    }

    // 5. Portfolio Evidence bonus
    const verifiedProjectsCount = (student.projects || []).filter(p => Boolean(p.evidenceLink)).length;
    score += Math.min(verifiedProjectsCount * 3, 15);

    // 6. Reputation weighting (up to 15 points)
    score += Math.round((student.reputation?.score || 50) * 0.15);

    // Filter threshold: must have at least some relevance unless search was completely generic
    const hasAnyCriteria = searchSkillsLower.length > 0 || Boolean(searchUniLower) || Boolean(searchLevelLower) || searchKeywordsLower.length > 0;
    const isMatch = hasAnyCriteria ? score > 20 : true;

    if (isMatch) {
      // Craft honest, grounded reason based strictly on true student record
      const reasonParts: string[] = [];
      if (matchedSkills.length > 0) {
        reasonParts.push(`Demonstrated skills in ${matchedSkills.slice(0, 3).join(', ')}`);
      }
      if (searchUniLower && student.university.toLowerCase().includes(searchUniLower)) {
        reasonParts.push(`Enrolled at ${student.university}`);
      }
      if (searchLevelLower && student.academicLevel.toLowerCase().includes(searchLevelLower)) {
        reasonParts.push(`${student.academicLevel}`);
      }
      if (verifiedProjectsCount > 0) {
        reasonParts.push(`${verifiedProjectsCount} verified portfolio ${verifiedProjectsCount === 1 ? 'project' : 'projects'} with public proof`);
      }
      if (student.reputation?.completedCollabs > 0) {
        reasonParts.push(`${student.reputation.completedCollabs} confirmed peer collaborations`);
      }

      const groundedReason = reasonParts.length > 0
        ? reasonParts.join(' · ')
        : `${student.headline} (${student.university})`;

      results.push({
        student,
        matchScore: score,
        groundedReason,
        matchedSkills,
      });
    }
  }

  // Sort by match score descending
  return results.sort((a, b) => b.matchScore - a.matchScore);
}

export async function improveProjectWithGemma4(
  title: string,
  description: string,
  skills: string[],
  preferredModel?: string
): Promise<{
  data: AiProjectImprovement;
  modelUsed: string;
  warning?: string;
}> {
  const customKey = getCustomOpenRouterKey();
  const res = await fetch('/api/ai/improve-project', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title,
      description,
      skills,
      customApiKey: customKey || undefined,
      preferredModel: preferredModel || undefined,
    }),
  });

  if (!res.ok) {
    throw new Error(`Improve project failed with status ${res.status}`);
  }

  return await res.json();
}

export async function extractSkillsWithGemma4(
  text: string
): Promise<{
  skills: string[];
  modelUsed: string;
}> {
  const customKey = getCustomOpenRouterKey();
  const res = await fetch('/api/ai/extract-skills', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      customApiKey: customKey || undefined,
    }),
  });

  if (!res.ok) {
    throw new Error(`Extract skills failed with status ${res.status}`);
  }

  return await res.json();
}
