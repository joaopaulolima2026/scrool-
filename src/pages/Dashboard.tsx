import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Users,
  Play,
  Heart,
  MessageCircle,
  Share2,
  Activity,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiUrl } from '@/lib/apiUrl';

const stats = [
  { label: 'Total Seguidores', value: '124.5k', icon: Users, color: 'text-blue-400' },
  { label: 'Engajamento Médio', value: '4.8%', icon: TrendingUp, color: 'text-purple-400' },
  { label: 'Visualizações Totais', value: '2.1M', icon: Play, color: 'text-green-400' },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

type ApiHealth = {
  ok?: boolean;
  geminiConfigured?: boolean;
  anthropicConfigured?: boolean;
};

export default function Dashboard() {
  const [health, setHealth] = useState<ApiHealth | null>(null);
  const [healthPending, setHealthPending] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(apiUrl('/api/health'))
      .then(async (res) => {
        if (!res.ok) throw new Error(`${res.status}`);
        return res.json();
      })
      .then((data: ApiHealth) => {
        if (!cancelled) setHealth(data);
      })
      .catch(() => {
        if (!cancelled) setHealth({ ok: false });
      })
      .finally(() => {
        if (!cancelled) setHealthPending(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const apiOk = health?.ok === true;
  const hasAnyKey =
    health?.geminiConfigured === true || health?.anthropicConfigured === true;

  return (
    <div className="space-y-12">
      <header>
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-4xl font-bold text-white mb-2"
        >
          Painel — <span className="text-gradient">Scrooll</span>
        </motion.h1>
        <p className="text-zinc-400">
          Demonstração visual abaixo. Saúde real da infraestrutura: status da API.
        </p>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`glass-card p-6 rounded-3xl flex flex-wrap items-start gap-6 border ${apiOk ? 'border-emerald-500/25' : 'border-amber-500/25'}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
            <Activity className={`w-6 h-6 ${healthPending ? 'text-zinc-500' : apiOk ? 'text-emerald-400' : 'text-amber-400'}`} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-zinc-500 mb-1">API</p>
            <p className="text-white font-semibold flex items-center gap-2">
              {healthPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-zinc-400" /> Checando…
                </>
              ) : apiOk ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" /> No ar
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-amber-400" /> Indisponível
                </>
              )}
            </p>
            {!healthPending && apiOk ? (
              <p className="text-zinc-500 text-sm mt-1">
                Gemini configurado: {health?.geminiConfigured ? 'sim' : 'não'} · Claude:{' '}
                {health?.anthropicConfigured ? 'sim' : 'não'}
              </p>
            ) : !healthPending && !apiOk ? (
              <p className="text-zinc-500 text-sm mt-1">
                Rode{' '}
                <code className="text-purple-400">npm run dev</code> (API porta 8787 + Vite) ou{' '}
                <Link to="/settings" className="text-purple-400 hover:underline">
                  veja Configurações
                </Link>
                .
              </p>
            ) : null}
          </div>
        </div>

        {!healthPending && apiOk && !hasAnyKey ? (
          <p className="text-amber-200/90 text-sm max-w-xl">
            API responde, mas falta GEMINI_API_KEY ou ANTHROPIC_API_KEY no arquivo .env da raiz.
          </p>
        ) : null}
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {stats.map((stat) => (
          <motion.div key={stat.label} variants={item} className="glass-card p-6 rounded-3xl opacity-75">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className="text-zinc-400 font-medium">{stat.label}</span>
            </div>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
            <p className="text-[10px] text-zinc-600 mt-3 uppercase tracking-wider">Somente demo</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 opacity-75">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-8 rounded-3xl"
        >
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="text-purple-400" />
            Performance (mock)
          </h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
              <div key={i} className="flex-1 group relative">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                  className="w-full bg-gradient-to-t from-purple-500/20 to-purple-500 rounded-t-lg"
                />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center -top-8">
                  <span className="text-xs bg-zinc-800 px-2 py-1 rounded text-white">{h}%</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-xs text-zinc-500 font-medium uppercase tracking-wider">
            <span>Seg</span>
            <span>Ter</span>
            <span>Qua</span>
            <span>Qui</span>
            <span>Sex</span>
            <span>Sab</span>
            <span>Dom</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-8 rounded-3xl"
        >
          <h3 className="text-xl font-bold text-white mb-6">Top viral (demo)</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors cursor-default group opacity-70"
              >
                <div className="w-16 h-16 rounded-xl bg-zinc-800 overflow-hidden relative">
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="text-white w-6 h-6 fill-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white mb-1">Ideia estrutura viral (demo)</p>
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" /> —
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" /> —
                    </span>
                    <span className="flex items-center gap-1">
                      <Share2 className="w-3 h-3" /> —
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
