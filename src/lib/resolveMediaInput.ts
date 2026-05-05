import {
  detectVideoPlatform,
  extractYoutubeVideoId,
  stripYoutubeUrls,
} from './videoUrl';
import { fetchYoutubeCaptionText } from './youtubeTranscript';

export type ResolvedMedia =
  | { ok: true; text: string; sourceLabel: string }
  | { ok: false; message: string };

/** Youtube só se o link aparecer no topo (evita vídeo citado no meio de um texto longo). */
function sniffYoutubeFromStart(rawInput: string): string | undefined {
  const trimmed = rawInput.trim();
  const sniffBlock =
    trimmed.split(/\n\s*\n+/)[0]?.replace(/^\ufeff/, '') ?? trimmed;

  /** Primeiros ~560 chars do primeiro parágrafo */
  const head = sniffBlock.slice(0, 560);
  const byRegex =
    /\b(https?:\/\/(?:www\.)?(?:youtube\.com\/[^\s<]*|youtu\.be\/[^\s<]+))/i.exec(
      head
    )?.[0];

  let url = byRegex ?? undefined;
  if (!url) {
    const ln = sniffBlock.split(/\n/).map((l) => l.trim())[0];
    if (ln && /^https?:\/\//i.test(ln))
      url = ln.split(/\s/)[0] ?? ln;
    else if (ln && /\byoutu\.be\//i.test(ln))
      url =
        /\b(https?:\/\/(?:www\.)?youtu\.be\/[^\s<]+)/i.exec(ln)?.[0];
  }

  const id = url ? extractYoutubeVideoId(url) : undefined;

  /** Se o primeiro parágrafo é uma transcrição enorme (>9k chars) mesmo com vídeo ao início → não forçamos download */
  if (id && sniffBlock.length > 9500 && /[.!?…]\s+\p{L}/iu.test(sniffBlock)) {
    return undefined;
  }

  return id;
}

export async function resolveMediaInput(rawInput: string): Promise<ResolvedMedia> {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return {
      ok: false,
      message:
        'Cole uma transcrição, uma descrição objetiva ou o link que começa pelo YouTube.',
    };
  }

  const ytId = sniffYoutubeFromStart(trimmed);
  const residue = stripYoutubeUrls(trimmed);

  const transcriptOnlyGuess =
    !ytId &&
    trimmed.length > 620 &&
    /[a-zà-ú]/i.test(trimmed) &&
    (trimmed.includes('\n') || trimmed.includes('. '));

  if (transcriptOnlyGuess) {
    return { ok: true, text: trimmed, sourceLabel: 'Transcrição colada' };
  }

  if (ytId) {
    try {
      const caption = await fetchYoutubeCaptionText(ytId);
      const glue =
        residue.length > 0
          ? `\n\n---\n## Orientações/objetivos enviadas junto com o link — priorizar quando combinarem com abaixo\n${residue}\n`
          : '';
      return {
        ok: true,
        text: `[Automático via link YouTube (id ${ytId})\nLegendas hospedadas no próprio vídeo foram usadas como base.${residue.length ? ' Também foram coladas suas instruções após esse bloco técnico.' : ''}]\n\n${caption}${glue}`,
        sourceLabel: `YouTube (${ytId})`,
      };
    } catch (e: unknown) {
      return { ok: false, message: e instanceof Error ? e.message : String(e) };
    }
  }

  const firstLine =
    trimmed.split(/\n/).map((l) => l.trim())[0] ?? trimmed;
  const plat = detectVideoPlatform(firstLine);
  if (plat === 'tiktok') {
    return {
      ok: true,
      text: `[Referência: link TikTok fornecido — ${firstLine}]\nTranscrição automática não disponível para TikTok. Use o objetivo e nicho informados para adaptar o estilo/formato viral do vídeo referenciado.`,
      sourceLabel: 'Link TikTok (referência)',
    };
  }

  if (plat === 'instagram') {
    return {
      ok: true,
      text: `[Referência: link Instagram fornecido — ${firstLine}]\nTranscrição automática não disponível para Instagram/Reels. Use o objetivo e nicho informados para adaptar o estilo/formato viral do vídeo referenciado.`,
      sourceLabel: 'Link Instagram (referência)',
    };
  }

  if (/^https?:\/\//i.test(firstLine.trim())) {
    return {
      ok: true,
      text: `[Referência: link fornecido — ${firstLine}]\nUse o objetivo e nicho informados para adaptar o conteúdo.`,
      sourceLabel: 'Link (referência)',
    };
  }

  return {
    ok: true,
    text: trimmed,
    sourceLabel: 'Texto/descrição digitada pelo usuário',
  };
}
