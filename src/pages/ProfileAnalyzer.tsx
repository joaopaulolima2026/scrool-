import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Instagram, Music, ArrowRight, Loader2, BarChart3, Target, Zap, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function ProfileAnalyzer() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [platform, setPlatform] = useState<'instagram' | 'tiktok'>('instagram');

  const handleAnalyze = () => {
    if (!username) {
      toast.error("Insira um nome de usuário para analisar.");
      return;
    }
    
    setLoading(true);
    setAnalyzed(false);
    
    toast.info(`Iniciando análise de @${username}...`);

    setTimeout(() => {
      try {
        setLoading(false);
        setAnalyzed(true);
        toast.success("Perfil analisado com sucesso!");
      } catch (error) {
        setLoading(false);
        toast.error("Erro interno ao processar a análise.");
        console.error("Analysis Error:", error);
      }
    }, 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <header className="text-center space-y-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium"
        >
          <Target className="w-4 h-4" />
          Análise de Perfil com IA
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-5xl font-bold text-white"
        >
          Descubra o Segredo do <span className="text-gradient">Viral</span>
        </motion.h1>
        <p className="text-zinc-400 text-lg">Insira o @ de qualquer perfil para analisar o que faz ele crescer.</p>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-2 rounded-[2rem] flex items-center gap-2"
      >
        <div className="flex bg-black/40 rounded-2xl p-1">
          <button 
            onClick={() => setPlatform('instagram')}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300",
              platform === 'instagram' ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <Instagram className="w-5 h-5" />
            Instagram
          </button>
          <button 
            onClick={() => setPlatform('tiktok')}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300",
              platform === 'tiktok' ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <Music className="w-5 h-5" />
            TikTok
          </button>
        </div>
        
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Digite o @usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-transparent border-none focus:ring-0 text-white pl-12 pr-4 py-4 placeholder:text-zinc-600 text-lg"
          />
        </div>

        <button 
          onClick={handleAnalyze}
          disabled={loading || !username}
          className="premium-gradient text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Analisar
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </motion.div>

      <AnimatePresence>
        {analyzed && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="md:col-span-3 glass-card p-8 rounded-3xl flex items-center gap-8">
              <div className="w-24 h-24 rounded-full premium-gradient p-1">
                <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center text-4xl">
                  {username[0]?.toUpperCase()}
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">@{username}</h2>
                <div className="flex gap-4 mt-2">
                  <span className="text-zinc-400"><strong>45.2k</strong> seguidores</span>
                  <span className="text-zinc-400"><strong>128</strong> posts</span>
                </div>
              </div>
              <div className="ml-auto">
                <div className="text-right">
                  <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest mb-1">Viral Score</p>
                  <div className="text-4xl font-black text-purple-400 italic">87/100</div>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 rounded-3xl space-y-4">
              <div className="flex items-center gap-3 text-purple-400">
                <BarChart3 className="w-5 h-5" />
                <h4 className="font-bold">Engajamento</h4>
              </div>
              <p className="text-3xl font-bold text-white">5.4%</p>
              <p className="text-sm text-zinc-500">2.1% acima da média da categoria</p>
            </div>

            <div className="glass-card p-6 rounded-3xl space-y-4">
              <div className="flex items-center gap-3 text-blue-400">
                <Zap className="w-5 h-5" />
                <h4 className="font-bold">Retenção Estimada</h4>
              </div>
              <p className="text-3xl font-bold text-white">68%</p>
              <p className="text-sm text-zinc-500">Baseado no tempo médio de vídeo</p>
            </div>

            <div className="glass-card p-6 rounded-3xl space-y-4">
              <div className="flex items-center gap-3 text-green-400">
                <Users className="w-5 h-5" />
                <h4 className="font-bold">Público Ativo</h4>
              </div>
              <p className="text-3xl font-bold text-white">12.4k</p>
              <p className="text-sm text-zinc-500">Pessoas que interagem recorrentemente</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
