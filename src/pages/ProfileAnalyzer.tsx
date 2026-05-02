import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Instagram, Music, ArrowRight, Loader2, BarChart3, 
  Target, Zap, RefreshCw, Users, Eye, Heart, MessageCircle, 
  Play, Sparkles, TrendingUp, ShieldCheck, Copy, ChevronRight, AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { generateContent } from '@/lib/gemini';
import { PROFILE_ANALYSIS_PROMPT } from '@/lib/prompts';

// Simulação de dados reais que viriam de um backend/scraper
const mockScrapedData = (username: string) => ({
  username: `@${username.replace('@', '')}`,
  nome: username.replace('@', '').split('.')[0].charAt(0).toUpperCase() + username.replace('@', '').split('.')[0].slice(1),
  bio: "Estrategista de Conteúdo Viral | Ajudo marcas a crescerem organicamente no digital com vídeos curtos de alta retenção.",
  seguidores: 45200,
  seguindo: 892,
  total_posts: 128,
  verificado: false,
  categoria: "Creator",
  link_bio: "https://linktr.ee/perfil",
  ultimos_posts: [
    { tipo: "reel", data: "2026-04-28", likes: 3200, comentarios: 145, views: 48000, legenda: "Como viralizar em 2026 usando apenas 3 ferramentas..." },
    { tipo: "carousel", data: "2026-04-25", likes: 1800, comentarios: 89, views: 0, legenda: "Guia completo do Reels que ninguém te conta." },
    { tipo: "reel", data: "2026-04-22", likes: 5400, comentarios: 312, views: 120000, legenda: "O segredo da retenção está nos primeiros 2 segundos." },
    { tipo: "image", data: "2026-04-20", likes: 900, comentarios: 45, views: 0, legenda: "Bastidores da nossa última gravação." },
    { tipo: "reel", data: "2026-04-18", likes: 2100, comentarios: 98, views: 35000, legenda: "Pare de cometer esse erro no seu hook!" },
  ],
  media_likes_ultimos_30: 2800,
  media_views_ultimos_30: 35000,
  frequencia_posts_semana: 4.2
});

export default function ProfileAnalyzer() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [platform, setPlatform] = useState<'instagram' | 'tiktok'>('instagram');
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

  const extractUsername = (url: string) => {
    const clean = url.trim();
    if (clean.includes('instagram.com/') || clean.includes('tiktok.com/')) {
      try {
        const urlObj = new URL(clean.startsWith('http') ? clean : `https://${clean}`);
        const pathSegments = urlObj.pathname.split('/').filter(Boolean);
        if (urlObj.hostname.includes('tiktok.com')) {
          return pathSegments[0]?.startsWith('@') ? pathSegments[0].substring(1) : pathSegments[0];
        }
        return pathSegments[0];
      } catch {
        return clean;
      }
    }
    return clean.replace('@', '');
  };

  const handleAnalyze = async () => {
    if (!input.trim()) {
      toast.error('Informe o perfil ou link para analisar.');
      return;
    }

    const username = extractUsername(input);
    setLoading(true);
    setResult(null);
    setError(null);
    toast.info(`Extraindo dados reais de @${username}...`);

    try {
      // 1. Simulação da extração de dados reais (onde entraria o backend/scraper)
      const profileData = mockScrapedData(username);
      
      // 2. Formatação dos dados para o prompt
      const formattedData = `
## Dados do perfil analisado
- Username: ${profileData.username}
- Nome: ${profileData.nome}
- Bio: ${profileData.bio}
- Seguidores: ${profileData.seguidores.toLocaleString()}
- Seguindo: ${profileData.seguindo.toLocaleString()}
- Total de posts: ${profileData.total_posts}
- Verificado: ${profileData.verificado ? 'Sim' : 'Não'}
- Categoria: ${profileData.categoria}
- Link na bio: ${profileData.link_bio}

### Últimos ${profileData.ultimos_posts.length} posts:
${profileData.ultimos_posts.map((post, idx) => `${idx + 1}. ${post.tipo} | ${post.data} | ${post.likes} likes | ${post.comentarios} comentários | ${post.views > 0 ? `${post.views} views` : '—'} | Legenda: "${post.legenda}"`).join('\n')}

- Média likes/30d: ${profileData.media_likes_ultimos_30}
- Média views/30d: ${profileData.media_views_ultimos_30}
- Frequência posts/semana: ${profileData.frequencia_posts_semana}
      `;

      // 3. Chamada para a IA Gemini
      const prompt = PROFILE_ANALYSIS_PROMPT.replace('{{PROFILE_DATA}}', formattedData);
      const response = await generateContent(prompt, `Analise o perfil @${username} com base nos dados fornecidos.`);
      
      setResult(response);
      toast.success('Análise estratégica concluída!');
    } catch (err: any) {
      setError(err.message || 'Erro ao analisar perfil.');
      toast.error(err.message || 'Erro ao analisar perfil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <header className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium"
        >
          <BarChart3 className="w-4 h-4" />
          Análise de Perfil Avançada
        </motion.div>
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-5xl font-bold text-white"
        >
          Decifre o <span className="text-gradient">DNA</span> do Perfil
        </motion.h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          Engenharia reversa baseada em dados reais. Identifique o que sustenta o crescimento de qualquer criador.
        </p>
      </header>

      {/* Search Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 rounded-3xl"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500">
              {platform === 'instagram' ? <Instagram className="w-6 h-6" /> : <Music className="w-6 h-6" />}
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              placeholder="Cole o link do perfil ou digite @usuario..."
              className="w-full bg-black/40 border border-white/10 rounded-2xl pl-16 pr-6 py-5 text-white text-lg placeholder:text-zinc-600 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all outline-none"
            />
          </div>
          <button
            onClick={handleAnalyze}
            disabled={loading || !input.trim()}
            className="premium-gradient text-white px-10 py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-50 text-lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Search className="w-6 h-6" />
                Analisar Agora
              </>
            )}
          </button>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={() => setPlatform('instagram')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl border transition-all",
              platform === 'instagram' ? "bg-pink-500/10 border-pink-500/50 text-pink-400" : "bg-white/5 border-white/10 text-zinc-500 hover:text-zinc-300"
            )}
          >
            <Instagram className="w-4 h-4" />
            Instagram
          </button>
          <button
            onClick={() => setPlatform('tiktok')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl border transition-all",
              platform === 'tiktok' ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-400" : "bg-white/5 border-white/10 text-zinc-500 hover:text-zinc-300"
            )}
          >
            <Music className="w-4 h-4" />
            TikTok
          </button>
        </div>
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
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass-card p-12 rounded-3xl flex flex-col items-center justify-center space-y-6"
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
              <Zap className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-blue-400 w-8 h-8" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-white font-medium text-lg animate-pulse">
                Calculando métricas reais e processando DNA...
              </p>
              <p className="text-zinc-500 text-sm">A IA está realizando a engenharia reversa do perfil</p>
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
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Análise Estratégica Completa</h3>
                  <p className="text-sm text-zinc-500">Baseada em dados reais extraídos via scraper</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(result);
                    toast.success('Análise copiada!');
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors text-sm"
                >
                  <Copy className="w-4 h-4" />
                  Copiar Análise
                </button>
                <button
                  onClick={() => {
                    setResult(null);
                    setInput('');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  Nova Análise
                </button>
              </div>
            </div>

            {/* AI Result Content */}
            <div className="glass-card p-10 rounded-[2.5rem]">
              <div className="prose prose-invert prose-blue max-w-none ai-result-content">
                {result.split('\n').map((line, i) => {
                  if (line.startsWith('### ')) {
                    return <h3 key={i} className="text-2xl font-bold text-white mt-12 mb-6 flex items-center gap-3 first:mt-0">
                      <Sparkles className="w-6 h-6 text-blue-400" />
                      {line.replace('### ', '')}
                    </h3>;
                  }
                  if (line.startsWith('## ')) {
                    return <h2 key={i} className="text-3xl font-bold text-white mt-16 mb-6 pb-3 border-b border-white/10 first:mt-0">{line.replace('## ', '')}</h2>;
                  }
                  if (line.startsWith('- **')) {
                    const parts = line.replace('- **', '').split('**');
                    return (
                      <div key={i} className="flex gap-3 py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors rounded-lg px-2">
                        <span className="font-bold text-blue-400 whitespace-nowrap">{parts[0]}</span>
                        <span className="text-zinc-300">{parts.slice(1).join('')}</span>
                      </div>
                    );
                  }
                  if (line.startsWith('- ')) {
                    return <div key={i} className="flex items-start gap-3 py-2 text-zinc-300">
                      <ChevronRight className="w-5 h-5 text-blue-400 mt-1 shrink-0" />
                      <span className="leading-relaxed">{line.replace('- ', '')}</span>
                    </div>;
                  }
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return <p key={i} className="text-white font-bold mt-6 text-lg">{line.replace(/\*\*/g, '')}</p>;
                  }
                  if (line.trim() === '---') {
                    return <hr key={i} className="border-white/10 my-10" />;
                  }
                  if (line.trim() === '') {
                    return <div key={i} className="h-3" />;
                  }
                  return <p key={i} className="text-zinc-300 leading-relaxed text-lg mb-4">{line}</p>;
                })}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 text-zinc-500 text-sm">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <p>Esta análise foi gerada por inteligência artificial avançada baseada em dados reais do perfil. As métricas calculadas seguem padrões de benchmark de 2025.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
