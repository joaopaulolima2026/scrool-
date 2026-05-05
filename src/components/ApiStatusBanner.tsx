import { useState, useEffect } from 'react';
import { AlertTriangle, X, ExternalLink } from 'lucide-react';

export function ApiStatusBanner() {
  const [status, setStatus] = useState<'ok' | 'degraded' | 'down' | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((d: { geminiConfigured?: boolean; anthropicConfigured?: boolean }) => {
        const hasGemini = Boolean(d.geminiConfigured);
        const hasClaude = Boolean(d.anthropicConfigured);
        if (hasGemini || hasClaude) setStatus('ok');
        else setStatus('down');
      })
      .catch(() => setStatus('down'));
  }, []);

  if (status !== 'down' || dismissed) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-500/95 backdrop-blur text-white px-4 py-3 flex items-center justify-between gap-4 shadow-lg">
      <div className="flex items-center gap-3 text-sm font-medium">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span>
          APIs sem créditos — adicione créditos em{' '}
          <a
            href="https://console.anthropic.com/settings/billing"
            target="_blank"
            rel="noreferrer"
            className="underline font-bold hover:text-red-100"
          >
            console.anthropic.com
          </a>{' '}
          ou gere uma nova chave Gemini em{' '}
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noreferrer"
            className="underline font-bold hover:text-red-100 inline-flex items-center gap-1"
          >
            aistudio.google.com <ExternalLink className="w-3 h-3" />
          </a>
        </span>
      </div>
      <button onClick={() => setDismissed(true)} className="shrink-0 hover:text-red-200">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
