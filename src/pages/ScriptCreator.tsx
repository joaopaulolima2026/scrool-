import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Save, Copy, RotateCcw, PenTool, Type, Video, Layout } from 'lucide-react';
import { toast } from 'sonner';

export default function ScriptCreator() {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [script, setScript] = useState<{
    hook: string;
    body: string;
    cta: string;
  } | null>(null);

  const handleGenerate = () => {
    if (!prompt) return;
    setGenerating(true);
    // Simulating AI generation
    setTimeout(() => {
      setScript({
        hook: "Você não vai acreditar no que eu descobri sobre [Assunto]...",
        body: "A maioria das pessoas comete o erro de focar apenas no óbvio, mas o segredo real está na consistência e na estratégia de retenção inicial.",
        cta: "Se você quer aprender o passo a passo completo, comenta 'QUERO' aqui embaixo!"
      });
      setGenerating(false);
      toast.success("Roteiro gerado com sucesso!");
    }, 2500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-8rem)]">
      {/* Left Panel: Settings */}
      <div className="lg:col-span-4 space-y-6 overflow-y-auto pr-2">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <PenTool className="text-purple-400" />
            Criador de Roteiros
          </h1>
          <p className="text-zinc-500 text-sm">Use nossa IA treinada nos maiores virais do mundo.</p>
        </header>

        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <label className="text-sm font-medium text-zinc-400">Sobre o que é seu vídeo?</label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Dicas de investimentos para iniciantes de forma descontraída..."
              className="w-full bg-black/40 border-white/5 rounded-xl p-4 text-white placeholder:text-zinc-700 min-h-[120px] focus:ring-purple-500/50 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-4 rounded-2xl space-y-2 cursor-pointer hover:bg-white/5 transition-colors border-purple-500/20">
              <Type className="w-4 h-4 text-purple-400" />
              <p className="text-xs font-bold text-white uppercase tracking-wider">Tom de Voz</p>
              <p className="text-sm text-zinc-500">Persuasivo</p>
            </div>
            <div className="glass-card p-4 rounded-2xl space-y-2 cursor-pointer hover:bg-white/5 transition-colors">
              <Video className="w-4 h-4 text-blue-400" />
              <p className="text-xs font-bold text-white uppercase tracking-wider">Formato</p>
              <p className="text-sm text-zinc-500">Reels / TikTok</p>
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={generating || !prompt}
            className="w-full premium-gradient text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-purple-500/20 transition-all disabled:opacity-50"
          >
            {generating ? (
              <RotateCcw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Gerar Roteiro Viral
              </>
            )}
          </button>
        </div>
      </div>

      {/* Right Panel: Editor/Result */}
      <div className="lg:col-span-8 glass-card rounded-[2.5rem] p-8 relative overflow-hidden flex flex-col">
        {!script && !generating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-4">
              <Layout className="w-10 h-10 text-zinc-700" />
            </div>
            <h3 className="text-xl font-bold text-white">Seu roteiro aparecerá aqui</h3>
            <p className="text-zinc-500 max-w-sm">Preencha as informações ao lado e deixe nossa inteligência artificial trabalhar para você.</p>
          </div>
        )}

        {generating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm z-10">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
              <Sparkles className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-purple-400 w-8 h-8" />
            </div>
            <p className="mt-6 text-white font-medium animate-pulse">Analisando tendências e criando seu roteiro...</p>
          </div>
        )}

        {script && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col space-y-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20">
                  ALTA CONVERSÃO
                </span>
                <span className="text-zinc-500 text-sm">• Gerado há poucos segundos</span>
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white transition-colors">
                  <Copy className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white transition-colors">
                  <Save className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-8 flex-1 overflow-y-auto pr-4">
              <section className="space-y-3">
                <h4 className="text-xs font-black text-purple-400 uppercase tracking-widest">O Gancho (0-3 segundos)</h4>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 text-xl font-medium text-white italic">
                  "{script.hook}"
                </div>
              </section>

              <section className="space-y-3">
                <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest">O Valor (Conteúdo)</h4>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 text-lg text-zinc-300 leading-relaxed">
                  {script.body}
                </div>
              </section>

              <section className="space-y-3">
                <h4 className="text-xs font-black text-pink-400 uppercase tracking-widest">Chamada para Ação (CTA)</h4>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 text-lg font-bold text-white">
                  {script.cta}
                </div>
              </section>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
