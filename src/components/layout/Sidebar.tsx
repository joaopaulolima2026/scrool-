import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, PenTool, Settings, LogOut, Rocket, Map, Repeat, Scissors } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Analisar Perfil', path: '/analyzer' },
  { icon: Map, label: 'Mapear Nicho', path: '/niche-map' },
  { icon: PenTool, label: 'Criar do Zero', path: '/creator' },
  { icon: Repeat, label: 'Adaptar Vídeo', path: '/adapt' },
  { icon: Scissors, label: 'Garimpar Cortes', path: '/miner' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 border-r border-white/5 bg-black/40 backdrop-blur-xl flex flex-col h-screen">
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 premium-gradient rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Rocket className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">Scrooll</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative"
            >
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                  isActive 
                    ? "text-white" 
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-purple-400" : "group-hover:text-purple-400")} />
                <span className="font-medium">{item.label}</span>
                
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 w-1 h-6 bg-purple-500 rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5 space-y-4">
        <Link
          to="/settings"
          className="flex items-center gap-3 px-4 py-3 w-full text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Configurações</span>
        </Link>
        
        <div className="p-4 glass-card rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Scrooll AI Online
            </span>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-zinc-800" />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">João Paulo</p>
              <p className="text-xs text-zinc-500 truncate">Pro Plan</p>
            </div>
            <button
              type="button"
              onClick={() => toast.message('Sessão local — sem login ainda. Saída em breve.')}
              className="text-zinc-500 hover:text-white transition-colors"
              aria-label="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
