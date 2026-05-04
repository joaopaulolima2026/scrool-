import { apiUrl } from './apiUrl';

/** Gera texto via streaming SSE — onChunk é chamado a cada pedaço de texto recebido. */
export async function generateContentStream(
  systemPrompt: string,
  userMessage: string,
  onChunk: (chunk: string) => void
): Promise<void> {
  const provider = (import.meta.env.VITE_AI_PROVIDER ?? 'gemini').toLowerCase();

  const res = await fetch(apiUrl('/api/ai/stream'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemPrompt, userMessage, provider }),
  });

  if (!res.ok || !res.body) {
    const payload = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(
      payload?.error?.trim() ||
        `Falha na API (${res.status}). Suba o servidor e confira GEMINI_API_KEY no .env.`
    );
  }

  const reader = res.body.getReader();
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
      const raw = line.slice(6).trim();
      if (raw === '[DONE]') return;
      try {
        const parsed = JSON.parse(raw) as { chunk?: string; error?: string };
        if (parsed.error) throw new Error(parsed.error);
        if (parsed.chunk) onChunk(parsed.chunk);
      } catch (e) {
        if (e instanceof Error && e.message !== raw) throw e;
      }
    }
  }
}

/** Fallback sem streaming — retorna texto completo. */
export async function generateContent(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const provider = (import.meta.env.VITE_AI_PROVIDER ?? 'gemini').toLowerCase();

  const res = await fetch(apiUrl('/api/ai/chat'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemPrompt, userMessage, provider }),
  });

  type Ok = { ok?: boolean; text?: string; error?: string };
  const payload = (await res.json()) as Ok;
  const err = typeof payload?.error === 'string' ? payload.error : '';

  if (!res.ok || !payload?.ok || typeof payload?.text !== 'string') {
    throw new Error(
      err.trim() ||
        `Falha na API (${res.status}). Suba o servidor e confira GEMINI_API_KEY ou ANTHROPIC_API_KEY no .env.`
    );
  }

  return payload.text;
}
