export function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\n/g, ' ');
}

export function parseJson3(raw: string): string {
  type Ev = { segs?: Array<{ utf8?: string }>; aAppend?: unknown };
  try {
    const data = JSON.parse(raw) as { events?: Ev[] };
    const events = data.events ?? [];
    const parts: string[] = [];
    for (const ev of events) {
      for (const s of ev.segs ?? []) {
        if (typeof s.utf8 === 'string' && s.utf8) parts.push(s.utf8);
      }
    }
    return decodeEntities(parts.join(' ')).replace(/\s+/g, ' ').trim();
  } catch {
    return '';
  }
}

export function parseXmlTimedText(xml: string): string {
  const re = /<text[^>]*>([^<]*)<\/text>/g;
  const parts: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    if (m[1]) parts.push(decodeEntities(m[1]));
  }
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}
