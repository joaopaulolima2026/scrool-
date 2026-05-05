import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scissors, Loader2, Sparkles, Copy, RefreshCw, ChevronRight, 
  AlertTriangle, FileText, Instagram, Music, Youtube, Hash, Target
} from 'lucide-react';
import { cn, copyToClipboard } from '@/lib/utils';
import { toast } from 'sonner';
import { generateContentStream } from '@/lib/ai';
import { resolveMediaInput } from '@/lib/resolveMediaInput';
import { EXTRACT_CUTS_PROMPT } from '@/lib/prompts';

type Platform = 'instagram' | 'tiktok' | 'youtube';

const platformConfig = {
  instagram: { icon: Instagram, label: 'Instagram Reels', color: 'text-pink-400' },
  tiktok: { icon: Music, label: 'TikTok', color: 'text-cyan-400' },
  youtube: { icon: Youtube, label: 'YouTube Shorts', color: 'text-red-400' },
};

export default function VideoMiner() {
  const [transcript, setTranscript] = useState('');
  const [minerFocus, setMinerFocus] = useState('');
  const [platform, setPlatform] = useState<Platform>('instagram');
  const [cutCount, setCutCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

  const handleGenerate = async () => {
    if (!transcript.trim()) {
      toast.error('Cole a transcrição ou link suportado (YouTube na primeira linha, em modo dev).');
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      toast.info('Resolvendo transcrição (link/texto)...');
      const resolved = await resolveMediaInput(transcript.trim());
      if (!resolved.ok) {
        setError(resolved.message);
        toast.error(resolved.message.split('\n')[0] ?? resolved.message);
        return;
      }

      const wc = resolved.text.trim().split(/\s+/).filter(Boolean).length;
      if (wc < 180) {
        toast.warning(
          'Texto ainda relativamente curto — resultados ficam mais ricos com transcrições longas.'
        );
      }

      toast.info('Gerando cortes com IA…');
      const extra =
        minerFocus.trim().length > 0
          ? `\n\n## Objetivo / foco adicional solicitado pelo usuário\n${minerFocus.trim()}\n`
          : '';

      const userMessage = `## Transcrição do vídeo longo (${resolved.sourceLabel}):\n${resolved.text}\n${extra}\n## Plataforma destino:\n${platformConfig[platform].label}\n\n## Número de cortes desejados:\n${cutCount}`;
      setResult('');
      await generateContentStream(EXTRACT_CUTS_PROMPT, userMessage, (chunk) => setResult((prev) => (prev ?? '') + chunk));
      toast.success('Cortes extraídos com sucesso!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao extrair cortes.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    const ok = await copyToClipboard(result);
    if (ok) toast.success('Copiado!');
    else toast.error('Não foi possível copiar.');
  };

  const wordCount = transcript.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <header className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium"
        >
          <Scissors className="w-4 h-4" />
          Extração de Cortes Virais
        </motion.div>
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-5xl font-bold text-white"
        >
          Garimpe <span className="text-gradient">Cortes Virais</span>
        </motion.h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          Cole texto longo para garimpo — ou uma URL YouTube pública ao topo (captura legendas apenas com o servidor de desenvolvimento do Vite ligado).
        </p>
      </header>

      {/* Input Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 rounded-3xl space-y-6"
      >
        {/* Transcript */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Transcrição do Vídeo Longo
            </label>
            <span className={cn(
              "text-xs font-medium",
              wordCount < 50 ? "text-red-400" : wordCount < 200 ? "text-yellow-400" : "text-green-400"
            )}>
              {wordCount} palavras
            </span>
          </div>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder={`URL YouTube na primeira linha (com npm run dev) ou cole a transcrição longa do podcast/live.`}
            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-zinc-600 min-h-[250px] focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 transition-all outline-none resize-none font-mono text-sm leading-relaxed"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <Target className="w-4 h-4" />
            Foco (opcional)
          </label>
          <input
            type="text"
            value={minerFocus}
            onChange={(e) => setMinerFocus(e.target.value)}
            placeholder='Ex.: "só polêmica e dados"'
            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-3 text-white text-sm placeholder:text-zinc-600 focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 outline-none"
          />
        </div>

        {/* Platform + Cut Count */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
              Plataforma Destino
            </label>
            <div className="flex gap-3">
              {(Object.keys(platformConfig) as Platform[]).map((key) => {
                const config = platformConfig[key];
                const Icon = config.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setPlatform(key)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 border text-sm",
                      platform === key
                        ? "bg-white/10 text-white border-white/20"
                        : "text-zinc-500 border-white/5 hover:text-zinc-300"
                    )}
                  >
                    <Icon className={cn("w-4 h-4", platform === key && config.color)} />
                    {config.label.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Número de Cortes
            </label>
            <div className="flex gap-2">
              {[3, 5, 7, 10].map((n) => (
                <button
                  key={n}
                  onClick={() => setCutCount(n)}
                  className={cn(
                    "flex-1 py-3 rounded-xl transition-all duration-300 border text-sm font-bold",
                    cutCount === n
                      ? "bg-white/10 text-white border-cyan-500/30"
                      : "text-zinc-500 border-white/5 hover:text-zinc-300"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !transcript.trim()}
          className="w-full premium-gradient text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-purple-500/20 transition-all disabled:opacity-50 text-lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Garimpando cortes...
            </>
          ) : (
            <>
              <Scissors className="w-5 h-5" />
              Garimpar Cortes
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="glass-card p-6 rounded-2xl border border-red-500/30 bg-red-500/5"
          >
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <p className="font-medium">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading */}
      <AnimatePresence>
        {loading && !result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass-card p-12 rounded-3xl flex flex-col items-center justify-center space-y-6"
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin" />
              <Scissors className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-cyan-400 w-8 h-8" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-white font-medium text-lg animate-pulse">
                Identificando momentos virais na transcrição...
              </p>
              <p className="text-zinc-500 text-sm">Analisando polêmica, emoção, dados e humor</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            ref={resultRef}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <Scissors className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Mapa de Cortes</h3>
                  <p className="text-xs text-zinc-500">{cutCount} cortes solicitados • {platformConfig[platform].label}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors text-sm">
                  <Copy className="w-4 h-4" /> Copiar
                </button>
                <button onClick={() => { setResult(null); setTranscript(''); setMinerFocus(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors text-sm">
                  <RefreshCw className="w-4 h-4" /> Novo
                </button>
              </div>
            </div>

            <div className="glass-card p-8 rounded-3xl">
              <div className="prose prose-invert prose-purple max-w-none">
                {result.split('\n').map((line, i) => {
                  if (line.startsWith('### ')) {
                    return <h3 key={i} className="text-xl font-bold text-white mt-8 mb-4 flex items-center gap-2 first:mt-0">
                      <Sparkles className="w-5 h-5 text-cyan-400" />
                      {line.replace('### ', '')}
                    </h3>;
                  }
                  if (line.startsWith('## ')) {
                    return <h2 key={i} className="text-2xl font-bold text-white mt-10 mb-4 pb-2 border-b border-white/10 first:mt-0">{line.replace('## ', '')}</h2>;
                  }
                  if (line.match(/^\*\*CORTE/)) {
                    return <div key={i} className="mt-8 mb-4 px-4 py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-bold text-lg">{line.replace(/\*\*/g, '')}</div>;
                  }
                  if (line.match(/^\[HOOK/i)) {
                    return <div key={i} className="mt-4 px-4 py-2 rounded-xl bg-purple-500/10 border-l-4 border-purple-500 text-purple-300 font-bold text-sm uppercase tracking-wider">{line}</div>;
                  }
                  if (line.match(/^\[CORPO/i)) {
                    return <div key={i} className="mt-4 px-4 py-2 rounded-xl bg-blue-500/10 border-l-4 border-blue-500 text-blue-300 font-bold text-sm uppercase tracking-wider">{line}</div>;
                  }
                  if (line.match(/^\[CTA/i)) {
                    return <div key={i} className="mt-4 px-4 py-2 rounded-xl bg-pink-500/10 border-l-4 border-pink-500 text-pink-300 font-bold text-sm uppercase tracking-wider">{line}</div>;
                  }
                  if (line.startsWith('- **')) {
                    const parts = line.replace('- **', '').split('**');
                    return (
                      <div key={i} className="flex gap-2 py-2 border-b border-white/5 last:border-0">
                        <span className="font-bold text-cyan-400 whitespace-nowrap">{parts[0]}</span>
                        <span className="text-zinc-300">{parts.slice(1).join('')}</span>
                      </div>
                    );
                  }
                  if (line.startsWith('- ')) {
                    return <div key={i} className="flex items-start gap-2 py-1.5 text-zinc-300">
                      <ChevronRight className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                      <span>{line.replace('- ', '')}</span>
                    </div>;
                  }
                  if (line.startsWith('Fala:') || line.startsWith('Visual:') || line.startsWith('Texto na tela:') || line.startsWith('Fala/Texto:')) {
                    const [label, ...rest] = line.split(':');
                    return <div key={i} className="py-1 pl-4">
                      <span className="text-zinc-500 text-sm font-medium">{label}:</span>
                      <span className="text-white ml-1">{rest.join(':')}</span>
                    </div>;
                  }
                  if (line.trim() === '---') {
                    return <hr key={i} className="border-white/10 my-6" />;
                  }
                  if (line.trim() === '') {
                    return <div key={i} className="h-2" />;
                  }
                  return <p key={i} className="text-zinc-300 leading-relaxed">{line}</p>;
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
