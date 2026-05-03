import 'dotenv/config';
import path from 'node:path';
import express from 'express';
import cors from 'cors';
import { fetchYoutubeCaptionsText } from './services/youtubeCaps.js';
import { generateGeminiContent } from './services/gemini.js';
import { generateClaudeContent } from './services/anthropic.js';

const PORT = Number(process.env.PORT) || 8787;
const isProd = process.env.NODE_ENV === 'production';

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json({ limit: '18mb' }));

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

type ChatBody = {
  systemPrompt?: string;
  userMessage?: string;
  provider?: string;
};

app.post('/api/ai/chat', async (req, res) => {
  const body = req.body as ChatBody;
  const systemPrompt =
    typeof body.systemPrompt === 'string' ? body.systemPrompt.trim() : '';
  const userMessage =
    typeof body.userMessage === 'string' ? body.userMessage.trim() : '';

  if (!systemPrompt || !userMessage) {
    return res.status(400).json({
      ok: false,
      error: 'Campos systemPrompt e userMessage são obrigatórios.',
    });
  }

  const p = (body.provider || process.env.AI_PROVIDER_DEFAULT || 'gemini')
    .toLowerCase()
    .trim();

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
