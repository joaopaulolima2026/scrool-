import { motion } from 'framer-motion';
import { TrendingUp, Users, Play, Heart, MessageCircle, Share2 } from 'lucide-react';

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
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export default function Dashboard() {
  return (
    <div className="space-y-12">
      <header>
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-4xl font-bold text-white mb-2"
        >
          Bem-vindo de volta, <span className="text-gradient">João</span> 👋
        </motion.h1>
        <p className="text-zinc-400">Aqui está o que está acontecendo com seus perfis hoje.</p>
      </header>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {stats.map((stat) => (
          <motion.div 
            key={stat.label} 
            variants={item}
            className="glass-card p-6 rounded-3xl"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className="text-zinc-400 font-medium">{stat.label}</span>
            </div>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-8 rounded-3xl"
        >
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="text-purple-400" />
            Performance Recente
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
            <span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sab</span><span>Dom</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-8 rounded-3xl"
        >
          <h3 className="text-xl font-bold text-white mb-6">Top Conteúdo Viral</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                <div className="w-16 h-16 rounded-xl bg-zinc-800 overflow-hidden relative">
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="text-white w-6 h-6 fill-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white mb-1">Como viralizar no TikTok em 2024</p>
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> 12k</span>
                    <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> 450</span>
                    <span className="flex items-center gap-1"><Share2 className="w-3 h-3" /> 1.2k</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-green-400">+15.4%</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
