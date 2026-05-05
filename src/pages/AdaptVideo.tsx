import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Goal, Loader2, Sparkles, Copy, RefreshCw, ChevronRight, Repeat,
  AlertTriangle, Film, Mic, Type, Video
} from 'lucide-react';
import { cn, copyToClipboard } from '@/lib/utils';
import { toast } from 'sonner';
import { generateContentStream } from '@/lib/ai';
import { ADAPT_VIDEO_PROMPT } from '@/lib/prompts';
import { resolveMediaInput } from '@/lib/resolveMediaInput';

const toneOptions = [
  { value: 'direto', label: 'Direto e Confiante', icon: '💪' },
  { value: 'divertido', label: 'Divertido e Leve', icon: '😄' },
  { value: 'educativo', label: 'Educativo e Didático', icon: '📚' },
  { value: 'provocativo', label: 'Provocativo e Polêmico', icon: '🔥' },
  { value: 'emocional', label: 'Emocional e Humano', icon: '❤️' },
];

export default function AdaptVideo() {
  const [reference, setReference] = useState('');
  const [niche, setNiche] = useState('');
  const [objective, setObjective] = useState('');
  const [tone, setTone] = useState('direto');
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
    if (!reference.trim()) {
      toast.error('Cole o link (YouTube, em modo dev), transcrição ou descreva o vídeo.');
      return;
    }
    if (!niche.trim()) {
      toast.error('Informe o seu nicho/área de atuação.');
      return;
    }
    if (!objective.trim()) {
      toast.error('Descreva o objetivo: o que você quer que a IA entregue com base nesse vídeo.');
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      toast.info('Obtendo legenda/link ou usando seu texto…');

      const resolved = await resolveMediaInput(reference.trim());
      if (!resolved.ok) {
        setError(resolved.message);
        toast.error(resolved.message.split('\n')[0] ?? resolved.message);
        return;
      }

      toast.info(`Fonte: ${resolved.sourceLabel}. Gerando resultado…`);

      const selectedTone = toneOptions.find(t => t.value === tone)?.label || 'Direto e Confiante';
      const userMessage = `## Objetivo (prioridade máxima)\n${objective.trim()}\n\n---\n\n## Material do vídeo (fonte: ${resolved.sourceLabel})\n${resolved.text}\n\n---\n\n## Meu nicho\n${niche.trim()}\n\n## Tom desejado\n${selectedTone}`;
      setResult('');
      await generateContentStream(ADAPT_VIDEO_PROMPT, userMessage, (chunk) => setResult((prev) => (prev ?? '') + chunk));
      toast.success('Concluído!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao adaptar roteiro.';
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

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <header className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium"
        >
          <Repeat className="w-4 h-4" />
          Adaptação Viral
        </motion.div>
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-5xl font-bold text-white"
        >
          Adapte Virais para o <span className="text-gradient">Seu Nicho</span>
        </motion.h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          Cole qualquer link (YouTube, Instagram, TikTok) ou transcrição. Para YouTube, as legendas são puxadas automaticamente. Para Instagram e TikTok, a IA usa o objetivo e nicho que você definir para adaptar o formato viral.
        </p>
      </header>

      {/* Input Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 rounded-3xl space-y-6"
      >
        {/* Reference */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <Film className="w-4 h-4" />
            Vídeo de Referência
          </label>
          <textarea
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder={`Primeira linha: link YouTube (ex.: watch, Shorts ou youtu.be) — funciona só em dev com proxy;\nOu cole transcrição / descreva;\nNas linhas abaixo (após ENTER) você pode acrescentar notas rápidas — elas entram junto na análise.`}
            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-zinc-600 min-h-[160px] focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/40 transition-all outline-none resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <Goal className="w-4 h-4" />
            Objetivo da análise
          </label>
          <textarea
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder={`Ex.: "adaptar esse gancho viral para pacientes odonto" • "listar só 7 hooks para Reels"`}
            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-zinc-600 min-h-[100px] focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/40 transition-all outline-none resize-none"
          />
        </div>

        {/* Niche */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <Type className="w-4 h-4" />
            Seu Nicho / Área de Atuação
          </label>
          <input
            type="text"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder="Ex: clínica de estética, consultoria agrícola, personal trainer..."
            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/40 transition-all outline-none"
          />
        </div>

        {/* Tone */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <Mic className="w-4 h-4" />
            Tom de Voz
          </label>
          <div className="flex flex-wrap gap-3">
            {toneOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTone(opt.value)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 border text-sm",
                  tone === opt.value
                    ? "bg-white/10 text-white border-orange-500/30"
                    : "text-zinc-500 border-white/5 hover:text-zinc-300 hover:border-white/10"
                )}
              >
                <span>{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !reference.trim() || !niche.trim() || !objective.trim()}
          className="w-full premium-gradient text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-purple-500/20 transition-all disabled:opacity-50 text-lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Adaptando roteiro...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Adaptar Vídeo
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
              <div className="w-24 h-24 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin" />
              <Video className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-orange-400 w-8 h-8" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-white font-medium text-lg animate-pulse">
                Decodificando o mecanismo viral e adaptando...
              </p>
              <p className="text-zinc-500 text-sm">Analisando estrutura, hook e CTA</p>
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
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <Repeat className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Roteiro Adaptado</h3>
                  <p className="text-xs text-zinc-500">Nicho: {niche} • Gerado agora</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors text-sm">
                  <Copy className="w-4 h-4" /> Copiar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setResult(null);
                    setReference('');
                    setNiche('');
                    setObjective('');
                    setTone('direto');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors text-sm"
                >
                  <RefreshCw className="w-4 h-4" /> Novo
                </button>
              </div>
            </div>

            <div className="glass-card p-8 rounded-3xl">
              <div className="prose prose-invert prose-purple max-w-none">
                {result.split('\n').map((line, i) => {
                  if (line.startsWith('### ')) {
                    return <h3 key={i} className="text-xl font-bold text-white mt-8 mb-4 flex items-center gap-2 first:mt-0">
                      <Sparkles className="w-5 h-5 text-orange-400" />
                      {line.replace('### ', '')}
                    </h3>;
                  }
                  if (line.startsWith('## ')) {
                    return <h2 key={i} className="text-2xl font-bold text-white mt-10 mb-4 pb-2 border-b border-white/10 first:mt-0">{line.replace('## ', '')}</h2>;
                  }
                  if (line.match(/^\[HOOK/i)) {
                    return <div key={i} className="mt-6 px-4 py-2 rounded-xl bg-purple-500/10 border-l-4 border-purple-500 text-purple-300 font-bold text-sm uppercase tracking-wider">{line}</div>;
                  }
                  if (line.match(/^\[DESENVOLVIMENTO|^\[CORPO/i)) {
                    return <div key={i} className="mt-6 px-4 py-2 rounded-xl bg-blue-500/10 border-l-4 border-blue-500 text-blue-300 font-bold text-sm uppercase tracking-wider">{line}</div>;
                  }
                  if (line.match(/^\[CTA/i)) {
                    return <div key={i} className="mt-6 px-4 py-2 rounded-xl bg-pink-500/10 border-l-4 border-pink-500 text-pink-300 font-bold text-sm uppercase tracking-wider">{line}</div>;
                  }
                  if (line.startsWith('- **')) {
                    const parts = line.replace('- **', '').split('**');
                    return (
                      <div key={i} className="flex gap-2 py-2 border-b border-white/5 last:border-0">
                        <span className="font-bold text-orange-400 whitespace-nowrap">{parts[0]}</span>
                        <span className="text-zinc-300">{parts.slice(1).join('')}</span>
                      </div>
                    );
                  }
                  if (line.startsWith('- ')) {
                    return <div key={i} className="flex items-start gap-2 py-1.5 text-zinc-300">
                      <ChevronRight className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
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
