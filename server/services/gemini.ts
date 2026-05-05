/** Servidor Gemini (chaves em GEMINI_*). */

// Leitura lazy: lê no momento da chamada, não no import (ESM hoist issue)
const getApiKey = () => process.env.GEMINI_API_KEY?.trim() || '';
const getPinnedModel = () => process.env.GEMINI_MODEL?.trim().replace(/^models\//, '') ?? '';

interface GeminiModelEntry {
  name?: string;
  supportedGenerationMethods?: readonly string[];
}

interface GeminiModelsListPayload {
  models?: GeminiModelEntry[];
}

let cachedModel: string | undefined;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseRetryAfterSeconds(response: Response): number | undefined {
  const raw = response.headers.get('retry-after');
  if (!raw) return undefined;
  const secs = Number.parseInt(raw, 10);
  if (!Number.isNaN(secs)) return clamp(secs, 3, 300);
  const when = Date.parse(raw);
  if (!Number.isNaN(when)) {
    const delta = Math.ceil((when - Date.now()) / 1000);
    return clamp(delta, 3, 300);
  }
  return undefined;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

async function discoverModelWithRetries(): Promise<void> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${getApiKey()}`;
  const maxAttempts = 5;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await fetch(url);

    if (response.status === 429) {
      const fromHeader = parseRetryAfterSeconds(response);
      const waitSec = fromHeader ?? clamp(12 * Math.pow(2, attempt), 15, 120);
      console.warn(`[Gemini] 429 list models → ${waitSec}s (${attempt + 1}/${maxAttempts})`);
      await sleep(waitSec * 1000);
      continue;
    }

    const data = (await response.json()) as GeminiModelsListPayload & {
      error?: { message?: string };
    };
    const modelsList = data.models ?? [];

    if (!response.ok || modelsList.length === 0) {
      const apiMsg = data.error?.message;
      throw new Error(
        'Gemini: sem modelos. Defina GEMINI_MODEL ou confira GEMINI_API_KEY.' +
          (apiMsg ? ` (${apiMsg})` : '')
      );
    }

    const generativeModels = modelsList.filter((m) =>
      m.supportedGenerationMethods?.includes('generateContent')
    );

    if (generativeModels.length === 0) {
      throw new Error('Gemini: defina GEMINI_MODEL no servidor.');
    }

    const priority = [
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro',
    ];

    for (const preferred of priority) {
      const found = generativeModels.find((m) => m.name === `models/${preferred}`);
      if (found?.name) {
        cachedModel = found.name.replace('models/', '');
        return;
      }
    }

    const firstModel = generativeModels[0];
    if (!firstModel?.name) throw new Error('Gemini: resposta sem modelo.');
    cachedModel = firstModel.name.replace('models/', '');
    return;
  }

  throw new Error('Gemini: cota listando modelos → defina GEMINI_MODEL.');
}

async function ensureModelResolved(): Promise<string> {
  if (getPinnedModel()) {
    cachedModel = getPinnedModel();
    return cachedModel;
  }
  if (cachedModel) return cachedModel;
  await discoverModelWithRetries();
  if (!cachedModel) throw new Error('Gemini: não resolveu modelo.');
  return cachedModel;
}

function buildRequestBody(systemPrompt: string, userMessage: string) {
  return JSON.stringify({
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `INSTRUÇÕES DE SISTEMA:\n${systemPrompt}\n\n---\n\nREQUISIÇÃO:\n${userMessage}`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      maxOutputTokens: 4096,
    },
  });
}

export async function generateGeminiContent(
  systemPrompt: string,
  userMessage: string,
  _retryCount = 0
): Promise<string> {
  if (!getApiKey()) throw new Error('GEMINI_API_KEY não configurada no servidor.');

  const model = await ensureModelResolved();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${getApiKey()}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: buildRequestBody(systemPrompt, userMessage),
  });

  type Gen = {
    error?: { message?: string };
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const data = (await response.json()) as Gen;

  if (!response.ok) {
    if (response.status === 429 && _retryCount < 5) {
      const fromHeader = parseRetryAfterSeconds(response);
      const waitSec = fromHeader ?? clamp(18 * Math.pow(2, _retryCount), 18, 120);
      await sleep(waitSec * 1000);
      return generateGeminiContent(systemPrompt, userMessage, _retryCount + 1);
    }
    if (response.status === 429) throw new Error('Gemini: rate limit.');

    const msg = data?.error?.message || `Erro Gemini: ${response.status}`;
    if ((response.status === 404 || /not\s*found|unsupported/i.test(msg)) && _retryCount === 0 && !getPinnedModel()) {
      cachedModel = undefined;
      return generateGeminiContent(systemPrompt, userMessage, _retryCount + 1);
    }
    throw new Error(msg);
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini não retornou texto.');
  return text;
}

export async function streamGeminiContent(
  systemPrompt: string,
  userMessage: string,
  onChunk: (chunk: string) => void,
  _retryCount = 0
): Promise<void> {
  if (!getApiKey()) throw new Error('GEMINI_API_KEY não configurada no servidor.');

  const model = await ensureModelResolved();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${getApiKey()}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: buildRequestBody(systemPrompt, userMessage),
  });

  if (!response.ok) {
    if (response.status === 429 && _retryCount < 3) {
      const fromHeader = parseRetryAfterSeconds(response);
      const waitSec = fromHeader ?? clamp(18 * Math.pow(2, _retryCount), 18, 60);
      await sleep(waitSec * 1000);
      return streamGeminiContent(systemPrompt, userMessage, onChunk, _retryCount + 1);
    }
    if (response.status === 429) throw new Error('Gemini: rate limit.');
    const errText = await response.text().catch(() => '');
    throw new Error(`Erro Gemini stream: ${response.status} ${errText.slice(0, 200)}`);
  }

  if (!response.body) throw new Error('Gemini: resposta sem body para stream.');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const jsonStr = line.slice(6).trim();
      if (!jsonStr || jsonStr === '[DONE]') continue;
      try {
        const parsed = JSON.parse(jsonStr) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };
        const chunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
        if (chunk) onChunk(chunk);
      } catch {
        // linha SSE malformada, ignora
      }
    }
  }
}
