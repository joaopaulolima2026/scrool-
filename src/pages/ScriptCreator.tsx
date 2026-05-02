import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Copy, RefreshCw, PenTool, Loader2, ChevronRight, 
  AlertTriangle, Star, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { generateContent } from '@/lib/gemini';
import { CREATE_SCRIPT_PROMPT } from '@/lib/prompts';

interface Template {
  name: string;
  category: string;
  description: string;
  recommended?: boolean;
}

const templates: Template[] = [
  { name: 'Análise de Perfil', category: 'Aquisição', description: 'Mostre autoridade analisando alguém que sua audiência admira.', recommended: true },
  { name: 'Tela Dividida', category: 'Ambos', description: 'Tem algo em trend? Opinião forte sobre algo que sua audiência consome.' },
  { name: 'Tweet / Texto Curto', category: 'Expansão', description: 'Volume diário sem gravação. Observação provocativa ou verdade inconveniente.' },
  { name: 'Um Dia na Vida', category: 'Expansão', description: 'Documente um dia de trabalho, projeto ou evento. Trajetória e bastidores.' },
  { name: 'Storytelling', category: 'Aquisição', description: 'Tem resultado, transformação ou virada? Estrutura de 3 atos.' },
  { name: 'Blind Reaction', category: 'Engajamento', description: 'Reaja a algo polêmico ou inesperado do seu nicho.' },
  { name: 'Clipe / Bastidor', category: 'Conexão', description: 'Situação real do dia atendendo cliente ou trabalhando. Prova social.' },
  { name: 'Verdade Inconveniente', category: 'Aquisição', description: 'Quebre uma crença popular do nicho com argumento sólido.' },
  { name: 'Pergunta Polêmica', category: 'Engajamento', description: 'Story estilo enquete com pergunta forte/divisiva. Gera muito comentário.' },
  { name: 'Página de Fofoca', category: 'Aquisição', description: "Headline tabloide/sensacionalista estilo 'VEJA O QUE...'. Portal de notícia popular." },
  { name: 'POV de Resultado', category: 'Vendas', description: "'POV: você usou X e escalou Y'. Visualiza transformação de quem usa seu produto." },
  { name: 'Formato Cinema', category: 'Curiosidade', description: "Hook curto direto: 'Quer X? Use Y'. Promessa + abre loop." },
  { name: 'Notícia (Disfarce)', category: 'Anúncio', description: "Anúncio disfarçado de matéria. Funciona muito em público 50+. 'Especialista revela...'" },
  { name: 'Headline + Cenário', category: 'Vendas', description: 'Headline forte em barra vermelha sobre imagem lifestyle. Versátil pra qualquer oferta.' },
  { name: 'Reunião / Meet', category: 'Engajamento', description: "Mock de chamada Google Meet com 2 'pessoas' conversando. Cria diálogo simulado." },
  { name: 'Ranking Top 5', category: 'Educação', description: 'Lista numerada com top 5. Estilo nuvem branca sobre cenário simples.' },
  { name: 'Tweet / X Post', category: 'Autoridade', description: 'Mock de tweet verificado com copy curta e provocativa. Funciona como prova social.' },
  { name: 'Promessa + Oferta', category: 'Vendas', description: "Promessa forte + preço riscado + valor atual + 'Toque no botão e garanta'." },
  { name: 'Curiosidade + Legenda', category: 'Engajamento', description: "Headline despertando curiosidade + 'Leia a legenda'. Direciona pra texto longo." },
  { name: 'Live Stream', category: 'Curiosidade', description: 'Simula transmissão ao vivo (LIVE 892 viewers). Cria FOMO e exclusividade.' },
];

const categoryColors: Record<string, string> = {
  'Aquisição': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Engajamento': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Expansão': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Conexão': 'bg-green-500/10 text-green-400 border-green-500/20',
  'Vendas': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  'Curiosidade': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'Educação': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'Autoridade': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  'Anúncio': 'bg-red-500/10 text-red-400 border-red-500/20',
  'Ambos': 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
};

export default function ScriptCreator() {
  const [selected, setSelected] = useState<Template | null>(null);
  const [niche, setNiche] = useState('');
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
    if (!selected) return;
    if (!niche.trim()) { toast.error('Informe seu nicho.'); return; }

    setLoading(true); setResult(null); setError(null);
    toast.info(`Criando roteiro "${selected.name}"...`);

    try {
      const msg = `## Formato escolhido: ${selected.name}\nDescrição: ${selected.description}\nCategoria/Objetivo: ${selected.category}\n\n## Nicho do usuário:\n${niche}\n\nCrie 1 roteiro completo usando EXATAMENTE este formato "${selected.name}". Inclua hook, corpo, CTA e direção visual.`;
      const response = await generateContent(CREATE_SCRIPT_PROMPT, msg);
      setResult(response);
      toast.success('Roteiro gerado!');
    } catch (err: any) {
      setError(err.message); toast.error(err.message);
    } finally { setLoading(false); }
  };

  const renderLine = (line: string, i: number) => {
    if (line.startsWith('### ')) return <h3 key={i} className="text-xl font-bold text-white mt-8 mb-4 flex items-center gap-2 first:mt-0"><Sparkles className="w-5 h-5 text-purple-400" />{line.replace('### ', '')}</h3>;
    if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold text-white mt-10 mb-4 pb-2 border-b border-white/10 first:mt-0">{line.replace('## ', '')}</h2>;
    if (line.match(/^\[HOOK/i)) return <div key={i} className="mt-6 px-4 py-2 rounded-xl bg-purple-500/10 border-l-4 border-purple-500 text-purple-300 font-bold text-sm uppercase tracking-wider">{line}</div>;
    if (line.match(/^\[CORPO|^\[DESENVOLVIMENTO/i)) return <div key={i} className="mt-6 px-4 py-2 rounded-xl bg-blue-500/10 border-l-4 border-blue-500 text-blue-300 font-bold text-sm uppercase tracking-wider">{line}</div>;
    if (line.match(/^\[CTA/i)) return <div key={i} className="mt-6 px-4 py-2 rounded-xl bg-pink-500/10 border-l-4 border-pink-500 text-pink-300 font-bold text-sm uppercase tracking-wider">{line}</div>;
    if (line.startsWith('- **')) { const p = line.replace('- **', '').split('**'); return <div key={i} className="flex gap-2 py-2 border-b border-white/5"><span className="font-bold text-purple-400 whitespace-nowrap">{p[0]}</span><span className="text-zinc-300">{p.slice(1).join('')}</span></div>; }
    if (line.startsWith('- ')) return <div key={i} className="flex items-start gap-2 py-1.5 text-zinc-300"><ChevronRight className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" /><span>{line.replace('- ', '')}</span></div>;
    if (line.startsWith('Fala:') || line.startsWith('Visual:') || line.startsWith('Texto na tela:')) { const [l, ...r] = line.split(':'); return <div key={i} className="py-1 pl-4"><span className="text-zinc-500 text-sm font-medium">{l}:</span><span className="text-white ml-1">{r.join(':')}</span></div>; }
    if (line.trim() === '---') return <hr key={i} className="border-white/10 my-6" />;
    if (line.trim() === '') return <div key={i} className="h-2" />;
    return <p key={i} className="text-zinc-300 leading-relaxed">{line}</p>;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <header className="space-y-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium">
          <PenTool className="w-4 h-4" /> Templates Virais
        </motion.div>
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-5xl font-bold text-white">
          Criar do <span className="text-gradient">Zero</span>
        </motion.h1>
        <p className="text-zinc-400 text-lg max-w-2xl">Formatos virais já testados. Escolha um — a IA preenche com seu briefing.</p>
      </header>

      {/* Template Grid */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((t, idx) => (
          <motion.button key={idx}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => { setSelected(t); setResult(null); setError(null); }}
            className={cn(
              "text-left p-6 rounded-2xl border transition-all duration-300 relative group",
              selected?.name === t.name
                ? "bg-purple-500/10 border-purple-500/40 shadow-lg shadow-purple-500/10"
                : "glass-card border-white/5 hover:border-white/15"
            )}>
            {t.recommended && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full mb-3 border border-amber-500/20">
                <Star className="w-3 h-3" /> Recomendado
              </span>
            )}
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-bold text-white">{t.name}</h3>
              <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full border shrink-0", categoryColors[t.category] || 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20')}>
                {t.category}
              </span>
            </div>
            <p className="text-zinc-400 text-sm mt-2 leading-relaxed">{t.description}</p>
          </motion.button>
        ))}
      </motion.div>

      {/* Niche Input + Generate (shows after selection) */}
      <AnimatePresence>
        {selected && !result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="glass-card p-8 rounded-3xl space-y-6 sticky bottom-6 z-10 border border-purple-500/20 shadow-2xl shadow-purple-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Formato selecionado</p>
                <p className="text-white font-bold text-lg">{selected.name} <span className="text-zinc-500 font-normal">• {selected.category}</span></p>
              </div>
              <button onClick={() => setSelected(null)} className="text-zinc-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <input type="text" value={niche} onChange={(e) => setNiche(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              placeholder="Qual é o seu nicho? Ex: odontologia estética, marketing digital..."
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white text-lg placeholder:text-zinc-600 focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/40 transition-all outline-none" />
            <button onClick={handleGenerate} disabled={loading || !niche.trim()}
              className="w-full premium-gradient text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-purple-500/20 transition-all disabled:opacity-50 text-lg">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Criando roteiro...</> : <><Sparkles className="w-5 h-5" />Gerar Roteiro<ChevronRight className="w-5 h-5" /></>}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="glass-card p-6 rounded-2xl border border-red-500/30 bg-red-500/5">
            <div className="flex items-center gap-3 text-red-400"><AlertTriangle className="w-5 h-5" /><p className="font-medium">{error}</p></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading */}
      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="glass-card p-12 rounded-3xl flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
              <PenTool className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-purple-400 w-8 h-8" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-white font-medium text-lg animate-pulse">Escrevendo roteiro "{selected?.name}"...</p>
              <p className="text-zinc-500 text-sm">Hook, corpo, CTA e direção visual</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div ref={resultRef} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center"><PenTool className="w-5 h-5 text-purple-400" /></div>
                <div><h3 className="text-lg font-bold text-white">{selected?.name}</h3><p className="text-xs text-zinc-500">Nicho: {niche}</p></div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { navigator.clipboard.writeText(result); toast.success('Copiado!'); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors text-sm"><Copy className="w-4 h-4" />Copiar</button>
                <button onClick={() => { setResult(null); setSelected(null); setNiche(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors text-sm"><RefreshCw className="w-4 h-4" />Novo</button>
              </div>
            </div>
            <div className="glass-card p-8 rounded-3xl">
              <div className="prose prose-invert prose-purple max-w-none">{result.split('\n').map(renderLine)}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
