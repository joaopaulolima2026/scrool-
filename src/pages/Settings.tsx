import { motion } from 'framer-motion';
import {
  Cpu,
  KeyRound,
  Server,
  Zap,
  BookOpenCheck,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const rows = [
  {
    k: 'GEMINI_API_KEY',
    d: 'Chave Gemini no servidor — não use mais VITE_GEMINI no front.',
  },
  {
    k: 'GEMINI_MODEL',
    d: 'Ex.: gemini-2.0-flash — evita listar modelos e economiza cota.',
  },
  {
    k: 'ANTHROPIC_API_KEY',
    d: 'Só quando VITE_AI_PROVIDER=claude no browser.',
  },
  {
    k: 'CLAUDE_MODEL',
    d: 'Opcional; padrão claude-3-5-sonnet-latest.',
  },
  {
    k: 'PORT',
    d: 'Porta da API (padrão 8787). O Vite em dev faz proxy para /api.',
  },
  {
    k: 'NODE_ENV',
    d: 'production — o servidor entrega também a pasta dist/ (SPA).',
  },
];

export default function Settings() {
  return (
    <div className="max-w-3xl mx-auto space-y-10 pb-20">
      <header className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-500/10 border border-zinc-500/20 text-zinc-400 text-sm font-medium"
        >
          <KeyRound className="w-4 h-4" />
          Backend & variáveis
        </motion.div>
        <h1 className="text-4xl font-bold text-white">Configurações</h1>
        <p className="text-zinc-400 text-lg leading-relaxed">
          As ferramentas de IA e as legendas do YouTube passam pela API Express em{' '}
          <code className="text-purple-400">server/</code>. O front apenas chama{' '}
          <code className="text-purple-400">/api/…</code> — chaves ficam só no{' '}
          <code className="text-purple-400">.env</code> à raiz, sem prefixo{' '}
          <code className="text-purple-400">VITE_</code> onde indicado abaixo.
        </p>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl divide-y divide-white/10"
      >
        {rows.map(({ k, d }) => (
          <div key={k} className="p-6 flex flex-col sm:flex-row sm:gap-6 gap-2">
            <code className="text-sm text-purple-400 shrink-0 font-mono">{k}</code>
            <p className="text-zinc-400 text-sm leading-relaxed">{d}</p>
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-8 rounded-3xl space-y-6"
      >
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Server className="w-5 h-5 text-purple-400" /> Como rodar
        </h2>
        <ul className="space-y-3 text-zinc-400 text-sm leading-relaxed list-disc list-inside">
          <li>
            <strong className="text-zinc-300">Desenvolvimento:</strong>{' '}
            <code className="text-emerald-400">npm run dev</code> sobe API (8787) + Vite; o proxy
            encaminha <code>/api</code>.
          </li>
          <li>
            <strong className="text-zinc-300">Produção:</strong>{' '}
            <code className="text-emerald-400">npm run build</code> depois{' '}
            <code className="text-emerald-400">NODE_ENV=production npm start</code> — um único
            processo serve <code className="text-purple-400">dist/</code> + API na mesma origem.
          </li>
          <li>
            Frontend em host separado (ex.: Vercel): defina{' '}
            <code className="text-purple-400">VITE_PUBLIC_API_URL</code> para a URL onde a API
            está publicada.
          </li>
        </ul>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a
          href="https://aistudio.google.com/apikey"
          target="_blank"
          rel="noreferrer"
          className="glass-card p-6 rounded-2xl flex items-start gap-3 hover:border-white/20 border border-white/5 transition-colors group"
        >
          <Zap className="w-5 h-5 text-yellow-400 mt-1 shrink-0" />
          <div>
            <p className="text-white font-medium flex items-center gap-2">
              Google AI Studio{' '}
              <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
            </p>
            <p className="text-zinc-500 text-sm mt-1">Gerar GEMINI_API_KEY</p>
          </div>
        </a>
        <a
          href="https://console.anthropic.com/"
          target="_blank"
          rel="noreferrer"
          className="glass-card p-6 rounded-2xl flex items-start gap-3 hover:border-white/20 border border-white/5 transition-colors group"
        >
          <Cpu className="w-5 h-5 text-orange-400 mt-1 shrink-0" />
          <div>
            <p className="text-white font-medium flex items-center gap-2">
              Anthropic Console{' '}
              <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
            </p>
            <p className="text-zinc-500 text-sm mt-1">ANTHROPIC_API_KEY opcional</p>
          </div>
        </a>
      </div>

      <p className="text-center text-zinc-500 text-sm flex items-center justify-center gap-2">
        <BookOpenCheck className="w-4 h-4" />
        <Link to="/" className="text-purple-400 hover:underline">
          Voltar ao painel
        </Link>
      </p>
    </div>
  );
}
