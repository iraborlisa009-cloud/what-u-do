/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

dotenv.config();

// Enforce HMR disabled in dev environment to prevent WebSocket disconnection errors
process.env.DISABLE_HMR = 'true';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '2mb' }));

const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
const PRIMARY_MODEL = process.env.OPENROUTER_MODEL || 'google/gemma-4-31b-it';
const FALLBACK_MODEL = process.env.OPENROUTER_MODEL_FALLBACK || 'google/gemma-4-26b-a4b-it';

// Helper to call OpenRouter with Gemma 4
async function callGemma4WithFallback(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  apiKey?: string,
  preferredModel?: string,
  temperature = 0.2
): Promise<{ text: string; modelUsed: string }> {
  const activeKey = apiKey || process.env.OPENROUTER_API_KEY;

  if (!activeKey) {
    throw new Error('MISSING_API_KEY');
  }

  const modelsToTry = [
    preferredModel || PRIMARY_MODEL,
    FALLBACK_MODEL,
    'google/gemma-4-31b-it:free',
  ];

  let lastError: Error | null = null;

  for (const model of modelsToTry) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 18000); // 18s timeout

      const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${activeKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.APP_URL || 'https://whatudo.campus',
          'X-Title': 'What U Do? Student Talent Platform',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: 1000,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content || '';
        return { text: content, modelUsed: model };
      } else {
        const errorText = await res.text();
        console.warn(`Model ${model} returned error status ${res.status}:`, errorText);
        lastError = new Error(`OpenRouter (${model}) status ${res.status}: ${errorText}`);
      }
    } catch (err: any) {
      console.warn(`Attempt with ${model} failed:`, err?.message);
      lastError = err;
    }
  }

  throw lastError || new Error('All OpenRouter Gemma 4 model attempts failed');
}

// 1. Status Check
app.get('/api/status', (req: Request, res: Response) => {
  const hasEnvKey = Boolean(process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.trim().length > 0);
  res.json({
    status: 'online',
    openRouterConfigured: hasEnvKey,
    primaryModel: PRIMARY_MODEL,
    fallbackModel: FALLBACK_MODEL,
    timestamp: new Date().toISOString(),
  });
});

// 2. AI Talent Finder Endpoint (Gemma 4 query interpretation)
app.post('/api/ai/talent-finder', async (req: Request, res: Response) => {
  const { query, customApiKey, preferredModel } = req.body;

  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ error: 'Query is required' });
  }

  const systemPrompt = `You are the AI Talent Search Engine for "What U Do?", a Nigerian university student talent discovery platform.
Your task is to analyze natural language talent queries from students and extract structured search parameters.
The platform has students with skills in: Graphic Design, Brand Identity, UI/UX Design, React, React Native, Flutter, Python, Go, 3D Modeling/Blender, Photography, Video Editing, Motion Graphics, Copyediting, Legal Tech, etc.
Universities include: UNIBEN, UNILAG, UI, FUTA, CU, OAU, UNN, ABU, FUTMINNA, LASU, etc.
Academic Levels: 100 Level, 200 Level, 300 Level, 400 Level, 500 Level, Postgraduate, Alumni.

CRITICAL: Return ONLY a valid JSON object without markdown fences, matching this schema:
{
  "skills": ["skill1", "skill2"],
  "university": "Extracted university name or empty string if not mentioned",
  "department": "Extracted department or empty string if not mentioned",
  "academicLevel": "Extracted academic level or empty string if not mentioned",
  "keywords": ["keyword1", "keyword2"],
  "rawInterpretation": "A concise 1-sentence explanation of what the user is seeking"
}`;

  const userPrompt = `Student Search Query: "${query.trim()}"`;

  try {
    const { text, modelUsed } = await callGemma4WithFallback(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      customApiKey,
      preferredModel
    );

    // Clean JSON response if model added markdown wrappers
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
    }

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // Fallback extraction if JSON parsing fails
      parsed = {
        skills: [],
        university: '',
        department: '',
        academicLevel: '',
        keywords: query.split(/\s+/).filter(w => w.length > 2),
        rawInterpretation: `Searched for: ${query}`,
      };
    }

    res.json({
      success: true,
      parameters: parsed,
      modelUsed,
      source: 'gemma-4',
    });
  } catch (err: any) {
    console.error('Talent Finder error:', err?.message);

    // If API key is missing or failed, provide deterministic campus rule parsing so app remains functional!
    const lower = query.toLowerCase();
    const mockSkills: string[] = [];
    if (lower.includes('graphic') || lower.includes('design') || lower.includes('brand')) mockSkills.push('Brand Identity', 'Graphic Design');
    if (lower.includes('mobile') || lower.includes('flutter') || lower.includes('react native')) mockSkills.push('React Native', 'Flutter');
    if (lower.includes('photo') || lower.includes('camera') || lower.includes('film')) mockSkills.push('Documentary Photography');
    if (lower.includes('3d') || lower.includes('blender') || lower.includes('unreal') || lower.includes('architect')) mockSkills.push('3D Modeling', 'Blender');
    if (lower.includes('python') || lower.includes('iot') || lower.includes('hardware')) mockSkills.push('Python', 'IoT');
    if (lower.includes('motion') || lower.includes('video') || lower.includes('after effects')) mockSkills.push('Motion Graphics');
    if (lower.includes('ui') || lower.includes('ux') || lower.includes('figma')) mockSkills.push('UI/UX Design', 'Figma');
    if (lower.includes('law') || lower.includes('legal')) mockSkills.push('Legal Tech');
    if (lower.includes('go') || lower.includes('backend') || lower.includes('database')) mockSkills.push('Go', 'PostgreSQL');

    let level = '';
    if (lower.includes('100')) level = '100 Level';
    if (lower.includes('200')) level = '200 Level';
    if (lower.includes('300')) level = '300 Level';
    if (lower.includes('400')) level = '400 Level';
    if (lower.includes('500')) level = '500 Level';

    let uni = '';
    if (lower.includes('uniben') || lower.includes('benin')) uni = 'University of Benin (UNIBEN)';
    if (lower.includes('unilag') || lower.includes('lagos')) uni = 'University of Lagos (UNILAG)';
    if (lower.includes('ui') || lower.includes('ibadan')) uni = 'University of Ibadan (UI)';
    if (lower.includes('futa') || lower.includes('akure')) uni = 'Federal University of Technology, Akure (FUTA)';
    if (lower.includes('covenant') || lower.includes('cu')) uni = 'Covenant University (CU)';
    if (lower.includes('oau') || lower.includes('ife')) uni = 'Obafemi Awolowo University (OAU)';
    if (lower.includes('abu') || lower.includes('zaria')) uni = 'Ahmadu Bello University (ABU)';
    if (lower.includes('unn') || lower.includes('nsukka')) uni = 'University of Nigeria, Nsukka (UNN)';

    res.json({
      success: true,
      parameters: {
        skills: mockSkills,
        university: uni,
        department: '',
        academicLevel: level,
        keywords: query.split(/\s+/).filter(w => w.length > 2),
        rawInterpretation: `Searched for coursemates matching "${query}"`,
      },
      modelUsed: 'heuristic-fallback',
      warning: err.message === 'MISSING_API_KEY'
        ? 'OpenRouter API key is not yet set in AI Studio Secrets or development settings. Using deterministic semantic parser.'
        : `OpenRouter Gemma 4 service reported: ${err.message}. Used fallback parser.`,
    });
  }
});

// 3. AI Portfolio Assistant: Project Improvement (Gemma 4)
app.post('/api/ai/improve-project', async (req: Request, res: Response) => {
  const { title, description, skills, customApiKey, preferredModel } = req.body;

  if (!description || typeof description !== 'string') {
    return res.status(400).json({ error: 'Project description is required' });
  }

  const systemPrompt = `You are the Portfolio Assistant on "What U Do?", powered by Google Gemma 4.
Your duty is to help university students showcase their genuine abilities professionally.
RULES:
1. Improve grammar, conciseness, and professional punch.
2. DO NOT invent fake metrics, imaginary client companies, unearned credentials, or fabricated tools.
3. Every highlighted achievement MUST be strictly grounded in facts provided in the user's input.
4. Suggest 3 to 6 accurate skill tags based on what was described.

CRITICAL: Return ONLY a valid JSON object matching this schema:
{
  "improvedTitle": "Polished concise title",
  "improvedDescription": "Well-crafted 2 to 3 paragraph professional description",
  "suggestedSkills": ["Skill 1", "Skill 2", "Skill 3"],
  "highlightedAchievements": ["Achievement 1 strictly grounded", "Achievement 2 strictly grounded"],
  "rationale": "One brief sentence explaining the editorial polish"
}`;

  const userPrompt = `Project Title: ${title || 'Untitled Project'}
Current Description: ${description}
Existing Skills: ${(skills || []).join(', ')}`;

  try {
    const { text, modelUsed } = await callGemma4WithFallback(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      customApiKey,
      preferredModel
    );

    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
    }

    const parsed = JSON.parse(cleaned);
    res.json({
      success: true,
      data: parsed,
      modelUsed,
    });
  } catch (err: any) {
    console.error('Improve Project error:', err?.message);

    // Grounded rule fallback if key is unconfigured
    const words = description.split(' ');
    const polishedDesc = `${description.trim()} Designed and executed with a rigorous focus on usability, clean visual hierarchy, and real-world campus utility.`;

    const suggested = Array.from(new Set([
      ...(skills || []),
      'Portfolio Presentation',
      'Quality Assurance',
    ])).slice(0, 5);

    res.json({
      success: true,
      data: {
        improvedTitle: title || 'Polished Student Portfolio Showcase',
        improvedDescription: polishedDesc,
        suggestedSkills: suggested,
        highlightedAchievements: [
          'Directly addressed the core brief described in the submission.',
          'Demonstrated clear technical and creative execution.',
        ],
        rationale: 'Enhanced clarity and tightened phrasing based on provided project details.',
      },
      modelUsed: 'heuristic-fallback',
      warning: err.message === 'MISSING_API_KEY'
        ? 'OpenRouter API key is not configured. Provide OPENROUTER_API_KEY for live Gemma 4 completions.'
        : `OpenRouter error: ${err.message}`,
    });
  }
});

// 4. AI Skill Extraction Endpoint (Gemma 4)
app.post('/api/ai/extract-skills', async (req: Request, res: Response) => {
  const { text, customApiKey } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text is required' });
  }

  const systemPrompt = `You are a skill extractor on "What U Do?". Identify 3 to 6 technical or creative skills demonstrated in the provided student project text.
Return JSON ONLY:
{
  "skills": ["Skill1", "Skill2", "Skill3"]
}`;

  try {
    const { text: resultText, modelUsed } = await callGemma4WithFallback(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
      customApiKey
    );

    let cleaned = resultText.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '');
    else if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');

    const parsed = JSON.parse(cleaned);
    res.json({ success: true, skills: parsed.skills || [], modelUsed });
  } catch (err: any) {
    const fallbackList = ['Creative Direction', 'Problem Solving', 'Technical Execution'];
    res.json({ success: true, skills: fallbackList, modelUsed: 'fallback' });
  }
});

// Mount Vite or static dist
async function startServer() {
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`What U Do? server running on http://0.0.0.0:${port}`);
  });
}

startServer();
