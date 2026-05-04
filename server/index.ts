import 'dotenv/config';
import path from 'node:path';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { fetchYoutubeCaptionsText } from './services/youtubeCaps.js';
import { generateGeminiContent, streamGeminiContent } from './services/gemini.js';
import { generateClaudeContent, streamClaudeContent } from './services/anthropic.js';

const PORT = Number(process.env.PORT) || 8787;
const isProd = process.env.NODE_ENV === 'production';

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:3000', 'http://localhost:5173'];

const app = express();
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan(isProd ? 'combined' : 'dev'));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY?.trim()),
    anthropicConfigured: Boolean(process.env.ANTHROPIC_API_KEY?.trim()),
    pinnedGeminiModel: process.env.GEMINI_MODEL ?? null,
  });
});

app.get('/api/youtube/captions', async (req, res) => {
  const v = String(req.query.v ?? '').trim();
  if (!/^[\w-]{6,}$/.test(v))
    return res.status(400).json({ ok: false, error: 'Parâmetro v inválido.' });
  try {
    const text = await fetchYoutubeCaptionsText(v);
    if (!text.trim()) {
      return res.status(404).json({
        ok: false,
        error: 'Legendas públicas não encontradas para esse vídeo.',
      });
    }
    return res.json({ ok: true, text });
  } catch {
    return res.status(500).json({
      ok: false,
      error: 'Falha ao buscar legendas no YouTube.',
    });
  }
});

app.post('/api/ai/chat', async (req, res) => {
  const body = req.body as Record<string, unknown>;
  const systemPrompt = typeof body.systemPrompt === 'string' ? body.systemPrompt.trim() : '';
  const userMessage = typeof body.userMessage === 'string' ? body.userMessage.trim() : '';

  if (!systemPrompt || !userMessage) {
    return res.status(400).json({
      ok: false,
      error: 'Campos systemPrompt e userMessage são obrigatórios.',
    });
  }

  const p = (
    typeof body.provider === 'string'
      ? body.provider
      : process.env.AI_PROVIDER_DEFAULT ?? 'gemini'
  ).toLowerCase().trim();

  try {
    if (p === 'claude' || p === 'anthropic') {
      const text = await generateClaudeContent(systemPrompt, userMessage);
      return res.json({ ok: true, text });
    }
    const text = await generateGeminiContent(systemPrompt, userMessage);
    return res.json({ ok: true, text });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return res.status(502).json({ ok: false, error: msg });
  }
});

app.post('/api/ai/stream', async (req, res) => {
  const body = req.body as Record<string, unknown>;
  const systemPrompt = typeof body.systemPrompt === 'string' ? body.systemPrompt.trim() : '';
  const userMessage = typeof body.userMessage === 'string' ? body.userMessage.trim() : '';

  if (!systemPrompt || !userMessage) {
    return res.status(400).json({ ok: false, error: 'Campos systemPrompt e userMessage são obrigatórios.' });
  }

  const p = (
    typeof body.provider === 'string'
      ? body.provider
      : process.env.AI_PROVIDER_DEFAULT ?? 'gemini'
  ).toLowerCase().trim();

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const send = (chunk: string) => res.write(`data: ${JSON.stringify({ chunk })}\n\n`);

  try {
    if (p === 'claude' || p === 'anthropic') {
      await streamClaudeContent(systemPrompt, userMessage, send);
    } else {
      await streamGeminiContent(systemPrompt, userMessage, send);
    }
    res.write('data: [DONE]\n\n');
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.write(`data: ${JSON.stringify({ error: msg })}\n\n`);
  } finally {
    res.end();
  }
});

const distPath = path.join(process.cwd(), 'dist');

if (isProd) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    return res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () =>
  console.log(
    `[scrooll-api] NODE_ENV=${isProd ? 'production' : 'development'} porta=${PORT}`
  )
);
