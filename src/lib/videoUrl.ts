/** Extrai ID de vídeo público YouTube — watch, shorts, embed, youtu.be */
export function extractYoutubeVideoId(raw: string): string | undefined {
  const candidate = raw.trim().split(/\n/)[0]?.trim();
  if (!candidate) return undefined;

  try {
    const normalized = /^https?:/i.test(candidate)
      ? candidate
      : `https://${candidate.replace(/^\/+/, '')}`;
    const u = new URL(normalized);
    const host = u.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      const id = u.pathname.slice(1).split('/')[0]?.split('?')[0];
      return id && /^[\w-]{6,}$/.test(id) ? id : undefined;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (u.pathname.startsWith('/watch')) {
        const id = u.searchParams.get('v') ?? undefined;
        return id && /^[\w-]{6,}$/.test(id) ? id : undefined;
      }
      const shorts = /^\/shorts\/([\w-]+)/.exec(u.pathname);
      if (shorts?.[1]) return shorts[1];
      const embed = /^\/embed\/([\w-]+)/.exec(u.pathname);
      if (embed?.[1]) return embed[1];
    }
  } catch {
    /**/
  }
  return undefined;
}


export function stripYoutubeUrls(text: string): string {
  return text
    .replace(
      /https?:\/\/(?:www\.)?(?:youtube\.com\/[^\s]+|youtu\.be\/[^\s]+)/gi,
      ''
    )
    .trim();
}

export type ExternalVideoPlatform = 'youtube' | 'tiktok' | 'instagram' | 'unknown';

/** Primeira linha / URL dentro do texto */
export function detectVideoPlatform(raw: string): ExternalVideoPlatform {
  const slice = raw.trim().split(/\n/)[0]?.toLowerCase() ?? '';
  if (/youtube\.com|youtu\.be/.test(slice)) return 'youtube';
  if (/tiktok\.com|vm\.tiktok\.com/.test(slice)) return 'tiktok';
  if (/instagram\.com/.test(slice)) return 'instagram';
  return 'unknown';
}
