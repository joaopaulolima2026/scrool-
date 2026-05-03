import { apiUrl } from './apiUrl';

/**
 * Gera texto via servidor (`/api/ai/chat`). Chaves GEMINI_/ANTHROPIC_ ficam só no backend.
 */
export async function generateContent(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const provider = (
    import.meta.env.VITE_AI_PROVIDER ?? 'gemini'
  ).toLowerCase();

  const body = JSON.stringify({
    systemPrompt,
    userMessage,
    provider,
  });

  const res = await fetch(apiUrl('/api/ai/chat'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

  type Ok = { ok?: boolean; text?: string; error?: string };
  const payload = (await res.json()) as Ok;
  const err =
    typeof payload?.error === 'string' ? payload.error : '';

  if (!res.ok || !payload?.ok || typeof payload?.text !== 'string') {
    throw new Error(
      err.trim() ||
        `Falha na API (${res.status}). Suba o servidor e confira GEMINI_API_KEY ou ANTHROPIC_API_KEY no .env.`
    );
  }

  return payload.text;
}
