import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { getCuratedTipForTopic } from './src/data/curatedStudyTips.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// API: Check Gemini availability
app.get('/api/ai/status', (_req: Request, res: Response) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '');
  res.json({
    available: hasKey,
    model: 'gemini-3.8-flash',
  });
});

// API: Generate official CSA practice questions
app.post('/api/ai/generate-questions', async (req: Request, res: Response) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return res.status(503).json({
      error: 'GEMINI_API_KEY is not configured on the server. Using built-in question bank instead.',
      available: false,
    });
  }

  const { domainId, domainTitle, topic, count = 2, questionType = 'single' } = req.body;

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `You are a ServiceNow Certified System Administrator (CSA) certification practice question author.
Create ${count} high-quality, realistic practice questions specifically aligned to the official January 2026 CSA exam blueprint.

Target Domain: Domain ${domainId} - "${domainTitle}"
Target Topic: "${topic}"
Question Type Preference: ${questionType === 'multiple' ? 'Multiple-select with 4-5 options (e.g. Choose 2 or Choose 3)' : 'Single-choice with exactly 4 options (A, B, C, D)'}

CRITICAL RULES:
1. Label all content as practice questions. Do NOT claim or state that these are actual or leaked exam questions.
2. Provide a realistic scenario or concept prompt. For multiple-select questions, include "(Choose two.)" or "(Choose three.)" in the prompt.
3. Multiple-choice questions have NO partial credit in the official CSA exam.
4. Provide comprehensive explanations for why the correct answer is correct AND concise explanations for why each distractor is incorrect.
5. Return ONLY a valid JSON array matching the requested schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              prompt: { type: Type.STRING, description: 'Question text including instructions like (Choose two.) if multiple' },
              type: { type: Type.STRING, description: 'Either "single" or "multiple"' },
              options: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: 'Option identifier (A, B, C, D, or E)' },
                    text: { type: Type.STRING, description: 'Option text' },
                  },
                  required: ['id', 'text'],
                },
              },
              correctAnswerIds: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Array of correct option IDs, e.g. ["B"] or ["A", "C"]',
              },
              explanation: { type: Type.STRING, description: 'Detailed explanation of the correct concept' },
              optionExplanations: {
                type: Type.OBJECT,
                description: 'Map of option ID to why it is correct or incorrect',
              },
            },
            required: ['prompt', 'type', 'options', 'correctAnswerIds', 'explanation'],
          },
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('No response received from Gemini model.');
    }

    const parsed = JSON.parse(text);

    // Format to QuizQuestion schema
    const formattedQuestions = parsed.map((q: any, idx: number) => ({
      id: `ai-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
      domainId: Number(domainId),
      domainTitle,
      topic,
      type: q.type === 'multiple' ? 'multiple' : 'single',
      prompt: q.prompt,
      options: q.options,
      correctAnswerIds: q.correctAnswerIds,
      explanation: q.explanation,
      optionExplanations: q.optionExplanations || {},
      source: 'ai-generated' as const,
    }));

    return res.json({ questions: formattedQuestions });
  } catch (err: any) {
    console.error('Error generating questions via Gemini:', err);
    return res.status(500).json({
      error: err?.message || 'Failed to generate practice questions.',
    });
  }
});

// API: Generate targeted study tip for a topic
app.post('/api/ai/study-tip', async (req: Request, res: Response) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const { domainId, domainTitle, topic } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required.' });
  }

  if (!apiKey || apiKey.trim() === '') {
    const fallbackTip = getCuratedTipForTopic(topic, domainId, domainTitle);
    return res.json({
      ...fallbackTip,
      source: 'curated-blueprint',
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `You are a certified ServiceNow CSA exam coach.
Generate concise, high-yield, actionable exam study advice for the following CSA blueprint topic:

Target Domain: Domain ${domainId || ''} - "${domainTitle || 'ServiceNow Platform'}"
Target Topic: "${topic}"

Provide:
1. coreSummary: 1-2 sentence core exam concept.
2. highYieldRules: 3-4 bullet points of high-frequency testable facts, precedence orders, or key technical boundaries.
3. examTrap: A specific common exam question distractor or trap on this topic to avoid.
4. recommendedHandsOn: A quick 3-minute hands-on action to verify in a ServiceNow Personal Developer Instance (PDI).
5. mnemonic: A memorable rule-of-thumb or short memory trick.

Keep advice concise, direct, and focused on the official January 2026 CSA exam blueprint.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            coreSummary: { type: Type.STRING },
            highYieldRules: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            examTrap: { type: Type.STRING },
            recommendedHandsOn: { type: Type.STRING },
            mnemonic: { type: Type.STRING },
          },
          required: ['coreSummary', 'highYieldRules', 'examTrap', 'recommendedHandsOn'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('No response received from Gemini.');
    }

    const tipData = JSON.parse(text);
    return res.json({
      topic,
      domainId,
      domainTitle,
      ...tipData,
      source: 'gemini-3.8-flash',
    });
  } catch (err: any) {
    console.warn('Gemini temporary issue, falling back to curated blueprint tip:', err?.message || err);
    const fallbackTip = getCuratedTipForTopic(topic, domainId, domainTitle);
    return res.json({
      ...fallbackTip,
      source: 'curated-blueprint-fallback',
    });
  }
});

// Setup Vite dev server or static files
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    // Serve production static build
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    // Vite middleware in dev
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CSA QUEST Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
