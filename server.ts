/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Initialize Google GenAI client with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * Health check endpoint
 */
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Model request timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/**
 * Helper to generate chronicle content with automatic model resilience
 */
async function generateChronicleWithFallback(prompt: string): Promise<string | undefined> {
  const candidateModels = [
    { name: 'gemini-3.1-flash-lite', timeoutMs: 12000 },
    { name: 'gemini-3.8-flash', timeoutMs: 8000 },
  ];
  let lastError: any = null;

  for (const { name: model, timeoutMs } of candidateModels) {
    try {
      const response = await withTimeout(
        ai.models.generateContent({
          model,
          contents: prompt,
        }),
        timeoutMs
      );
      if (response?.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`Model ${model} generation attempt failed:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error('All candidate models failed');
}

/**
 * Standard Mythic Chronicle Generation Endpoint
 */
app.post('/api/chronicle', async (req, res) => {
  try {
    const { history = [], worldName = 'Meglin' } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(200).json({
        text: null,
        error: 'GEMINI_API_KEY is not configured on the server.',
      });
    }

    const prompt = `You are the Venerable Bede, an ancient chronicler transcribing the sacred mythological history of the fantasy world of "${worldName}".
Here is the recorded timeline of divine actions and mortal events by the gods (Dawn of Worlds game):
${JSON.stringify(
  history.slice(-15).map((h: any) => ({
    age: h.age,
    round: h.round,
    deity: h.deityName,
    action: h.actionType,
    title: h.title,
    impact: h.impact,
  })),
  null,
  2
)}

Write a stirring, epic mythological saga in 3-4 vivid paragraphs in the tone of The Silmarillion or an ancient Norse/Homeric Edda, detailing the creation of the lands, the awakening of races, the rivalries of the deities, and the grand destiny of the world.`;

    const text = await generateChronicleWithFallback(prompt);
    return res.json({ text });
  } catch (err: any) {
    console.error('Server error generating mythic chronicle:', err);
    return res.status(500).json({ error: err?.message || 'Failed to generate chronicle' });
  }
});

/**
 * Streaming Mythic Chronicle Generation Endpoint (Server-Sent Events)
 */
app.post('/api/chronicle/stream', async (req, res) => {
  try {
    const { history = [], worldName = 'Meglin' } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(200).json({
        text: null,
        error: 'GEMINI_API_KEY is not configured on the server.',
      });
    }

    const prompt = `You are the Venerable Bede, an ancient chronicler transcribing the sacred mythological history of the fantasy world of "${worldName}".
Here is the recorded timeline of divine actions and mortal events by the gods (Dawn of Worlds game):
${JSON.stringify(
  history.slice(-15).map((h: any) => ({
    age: h.age,
    round: h.round,
    deity: h.deityName,
    action: h.actionType,
    title: h.title,
    impact: h.impact,
  })),
  null,
  2
)}

Write a stirring, epic mythological saga in 3-4 vivid paragraphs in the tone of The Silmarillion or an ancient Norse/Homeric Edda, detailing the creation of the lands, the awakening of races, the rivalries of the deities, and the grand destiny of the world.`;

    // Try streaming with fallback
    let responseStream = null;
    const candidateModels = [
      { name: 'gemini-3.1-flash-lite', timeoutMs: 12000 },
      { name: 'gemini-3.8-flash', timeoutMs: 8000 },
    ];

    for (const { name: model, timeoutMs } of candidateModels) {
      try {
        responseStream = await withTimeout(
          ai.models.generateContentStream({
            model,
            contents: prompt,
          }),
          timeoutMs
        );
        break;
      } catch (err: any) {
        console.warn(`Model ${model} stream attempt failed:`, err?.message || err);
      }
    }

    if (!responseStream) {
      throw new Error('All streaming candidate models failed');
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err: any) {
    console.error('Server error streaming mythic chronicle:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err?.message || 'Failed to stream chronicle' });
    } else {
      res.end();
    }
  }
});

// Production vs Development middleware handling
const isProd = process.env.NODE_ENV === 'production';
if (isProd) {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
} else {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Dawn of Worlds server running on port ${PORT} (NODE_ENV: ${process.env.NODE_ENV || 'development'})`);
});
