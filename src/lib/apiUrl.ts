/** Base URL opcional quando front e API estão em origins diferentes */
export function apiUrl(pathQuery: string): string {
  const base = (
    typeof import.meta !== 'undefined'
      ? (import.meta.env.VITE_PUBLIC_API_URL as string | undefined)
      : undefined
  )?.replace(/\/$/, '');
  const p = pathQuery.startsWith('/') ? pathQuery : `/${pathQuery}`;
  return base ? `${base}${p}` : p;
}
