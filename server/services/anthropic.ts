const MODEL =
  process.env.CLAUDE_MODEL?.trim().replace(/^models\//, '') ??
  'claude-3-5-sonnet-latest';

const KEY = process.env.ANTHROPIC_API_KEY || '';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseRetryAfterSeconds(response: Response): number | undefined {
  const raw = response.headers.get('retry-after');
  if (!raw) return undefined;
  const secs = Number.parseInt(raw, 10);
  if (!Number.isNaN(secs)) return Math.min(300, Math.max(3, secs));
  const when = Date.parse(raw);
  if (!Number.isNaN(when)) {
    return Math.min(300, Math.max(3, Math.ceil((when - Date.now()) / 1000)));
  }
  return undefined;
}

export async function generateClaudeContent(
  systemPrompt: string,
  userMessage: string,
  retry = 0
): Promise<string> {
  if (!KEY) throw new Error('ANTHROPIC_API_KEY não configurada no servidor.');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  const payload = (await res.json()) as {
    error?: { message?: string; type?: string };
    content?: Array<{ type?: string; text?: string }>;
  };

  if (!res.ok) {
    if ((res.status === 429 || res.status === 529) && retry < 5) {
      const wait = parseRetryAfterSeconds(res) ?? Math.min(120, 20 * Math.pow(2, retry));
      console.warn(`[Claude] ${res.status}. ${wait}s… (${retry + 1}/5)`);
      await sleep(wait * 1000);
      return generateClaudeContent(systemPrompt, userMessage, retry + 1);
    }
    throw new Error(
      payload?.error?.message ||
        `${payload?.error?.type ?? 'Claude erro'} (${res.status})`
    );
  }

  const block = payload.content?.find((c) => c.type === 'text');
  const text = block?.text?.trim();
  if (!text) throw new Error('Claude não retornou texto.');
  return text;
}

export async function streamClaudeContent(
  systemPrompt: string,
  userMessage: string,
  onChunk: (chunk: string) => void,
  retry = 0
): Promise<void> {
  if (!KEY) throw new Error('ANTHROPIC_API_KEY não configurada no servidor.');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4096,
      stream: true,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!res.ok) {
    if ((res.status === 429 || res.status === 529) && retry < 3) {
      const wait = parseRetryAfterSeconds(res) ?? Math.min(60, 20 * Math.pow(2, retry));
      await sleep(wait * 1000);
      return streamClaudeContent(systemPrompt, userMessage, onChunk, retry + 1);
    }
    const errText = await res.text().catch(() => '');
    throw new Error(`Claude stream erro ${res.status}: ${errText.slice(0, 200)}`);
  }

  if (!res.body) throw new Error('Claude: resposta sem body para stream.');

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
      const jsonStr = line.slice(6).trim();
      if (!jsonStr || jsonStr === '[DONE]') continue;
      try {
        const parsed = JSON.parse(jsonStr) as {
          type?: string;
          delta?: { type?: string; text?: string };
        };
        if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
          onChunk(parsed.delta.text);
        }
      } catch {
        // linha SSE malformada, ignora
      }
    }
  }
}
