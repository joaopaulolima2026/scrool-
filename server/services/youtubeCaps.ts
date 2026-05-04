import { parseJson3, parseXmlTimedText } from './youtubeParse.js';

async function fetchText(url: string): Promise<{ ok: boolean; raw: string }> {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (compatible; ScroollServer/1.0; transcription helper)',
      'Accept-Language': 'pt,en;q=0.9',
    },
  });
  if (!res.ok) return { ok: false, raw: '' };
  const raw = await res.text();
  return { ok: true, raw };
}

export async function fetchYoutubeCaptionsText(videoId: string): Promise<string> {
  const id = videoId.trim();
  if (!id || !/^[\w-]{6,}$/.test(id)) {
    throw new Error('invalid_video_id');
  }

  const languages = ['pt', 'pt-BR', 'en'];
  const urls: string[] = [];
  for (const lang of languages) {
    urls.push(
      `https://www.youtube.com/api/timedtext?v=${encodeURIComponent(id)}&fmt=json3&lang=${encodeURIComponent(lang)}`
    );
  }
  for (const lang of languages) {
    urls.push(
      `https://www.youtube.com/api/timedtext?v=${encodeURIComponent(id)}&lang=${encodeURIComponent(lang)}`
    );
  }

  for (const url of urls) {
    try {
      const { ok, raw } = await fetchText(url);
      if (!ok || !raw.trim()) continue;

      if (raw.trim().startsWith('{')) {
        const out = parseJson3(raw);
        if (out.length > 80) return out;
      }

      const fromXml = parseXmlTimedText(raw);
      if (fromXml.replace(/\s+/g, '').length > 80) return fromXml;
    } catch (err) {
      console.warn(`[YouTube Captions] Failed ${url}:`, err instanceof Error ? err.message : String(err));
    }
  }

  return '';
}
