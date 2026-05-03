import { apiUrl } from './apiUrl';

/** Legendas públicas → `/api/youtube/captions` no mesmo host ou via VITE_PUBLIC_API_URL */

export async function fetchYoutubeCaptionText(videoId: string): Promise<string> {
  const id = videoId.trim();
  if (!id || !/^[\w-]{6,}$/.test(id)) {
    throw new Error('ID do vídeo YouTube inválido.');
  }

  const res = await fetch(apiUrl(`/api/youtube/captions?v=${encodeURIComponent(id)}`));
  type R = { ok?: boolean; text?: string; error?: string };
  const payload = (await res.json()) as R;
  if (
    !res.ok ||
    !payload.ok ||
    typeof payload.text !== 'string' ||
    !payload.text.trim()
  ) {
    throw new Error(
      payload.error ??
        `Não foi possível baixar legendas (${res.status}). Certifique-se de que a API está no ar (${import.meta.env.DEV ? '`npm run dev`' : 'variável VITE_PUBLIC_API_URL ou mesmo host'}).`
    );
  }

  return payload.text;
}
