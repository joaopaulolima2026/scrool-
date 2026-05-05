import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map, Instagram, Music, Youtube, Loader2, Sparkles, 
  Copy, RefreshCw, ChevronRight, Target, TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { cn, copyToClipboard } from '@/lib/utils';
import { toast } from 'sonner';
import { generateContentStream } from '@/lib/ai';
import { NICHE_MAP_PROMPT } from '@/lib/prompts';

type Platform = 'instagram' | 'tiktok' | 'youtube';

const platformConfig = {
  instagram: { icon: Instagram, label: 'Instagram', color: 'text-pink-400' },
  tiktok: { icon: Music, label: 'TikTok', color: 'text-cyan-400' },
  youtube: { icon: Youtube, label: 'YouTube', color: 'text-red-400' },
};

export default function NicheMap() {
  const [niche, setNiche] = useState('');
  const [platform, setPlatform] = useState<Platform>('instagram');
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
    if (!niche.trim()) {
      toast.error('Informe o nicho para mapear.');
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);
    toast.info(`Mapeando o nicho "${niche}"...`);

    try {
      const userMessage = `Nicho: ${niche}\nPlataforma prioritária: ${platformConfig[platform].label}`;
      setResult('');
      await generateContentStream(NICHE_MAP_PROMPT, userMessage, (chunk) => setResult((prev) => (prev ?? '') + chunk));
      toast.success('Mapa do nicho gerado!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao gerar análise.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    const ok = await copyToClipboard(result);
    if (ok) toast.success('Copiado para a área de transferência!');
    else toast.error('Não foi possível copiar.');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <header className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium"
        >
          <Map className="w-4 h-4" />
          Inteligência de Nicho
        </motion.div>
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-5xl font-bold text-white"
        >
          Mapeie a <span className="text-gradient">DNA</span> do Nicho
        </motion.h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          Descubra os criadores, padrões e oportunidades que fazem conteúdo viralizar em qualquer segmento.
        </p>
      </header>

      {/* Input Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 rounded-3xl space-y-6"
      >
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
            Qual é o nicho?
          </label>
          <input
            type="text"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="Ex: odontologia estética, agronegócio, fitness feminino..."
            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white text-lg placeholder:text-zinc-600 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
            Plataforma prioritária
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
                    "flex items-center gap-2 px-5 py-3 rounded-xl transition-all duration-300 border",
                    platform === key
                      ? "bg-white/10 text-white border-white/20 shadow-inner"
                      : "text-zinc-500 border-white/5 hover:text-zinc-300 hover:border-white/10"
                  )}
                >
                  <Icon className={cn("w-5 h-5", platform === key && config.color)} />
                  {config.label}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !niche.trim()}
          className="w-full premium-gradient text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-purple-500/20 transition-all disabled:opacity-50 text-lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Mapeando o nicho...
            </>
          ) : (
            <>
              <Target className="w-5 h-5" />
              Mapear Nicho
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </motion.div>

      {/* Error State */}
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

      {/* Loading Animation */}
      <AnimatePresence>
        {loading && !result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass-card p-12 rounded-3xl flex flex-col items-center justify-center space-y-6"
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
              <Sparkles className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-emerald-400 w-8 h-8" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-white font-medium text-lg animate-pulse">
                Analisando criadores e padrões do nicho...
              </p>
              <p className="text-zinc-500 text-sm">Isso pode levar alguns segundos</p>
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
            {/* Result Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Mapa do Nicho: {niche}</h3>
                  <p className="text-xs text-zinc-500">
                    Plataforma: {platformConfig[platform].label} • Gerado agora
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors text-sm"
                >
                  <Copy className="w-4 h-4" />
                  Copiar
                </button>
                <button
                  onClick={() => {
                    setResult(null);
                    setNiche('');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  Novo
                </button>
              </div>
            </div>

            {/* Result Content */}
            <div className="glass-card p-8 rounded-3xl">
              <div className="prose prose-invert prose-purple max-w-none ai-result-content">
                {result.split('\n').map((line, i) => {
                  if (line.startsWith('### ')) {
                    return <h3 key={i} className="text-xl font-bold text-white mt-8 mb-4 flex items-center gap-2 first:mt-0">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                      {line.replace('### ', '')}
                    </h3>;
                  }
                  if (line.startsWith('## ')) {
                    return <h2 key={i} className="text-2xl font-bold text-white mt-10 mb-4 pb-2 border-b border-white/10 first:mt-0">{line.replace('## ', '')}</h2>;
                  }
                  if (line.startsWith('- **')) {
                    const parts = line.replace('- **', '').split('**');
                    return (
                      <div key={i} className="flex gap-2 py-2 border-b border-white/5 last:border-0">
                        <span className="font-bold text-purple-400 whitespace-nowrap">{parts[0]}</span>
                        <span className="text-zinc-300">{parts.slice(1).join('')}</span>
                      </div>
                    );
                  }
                  if (line.startsWith('- ')) {
                    return <div key={i} className="flex items-start gap-2 py-1.5 text-zinc-300">
                      <ChevronRight className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      <span>{line.replace('- ', '')}</span>
                    </div>;
                  }
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return <p key={i} className="text-white font-bold mt-4">{line.replace(/\*\*/g, '')}</p>;
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
