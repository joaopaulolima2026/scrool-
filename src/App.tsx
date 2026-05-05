import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import Dashboard from './pages/Dashboard';
import ProfileAnalyzer from './pages/ProfileAnalyzer';
import ScriptCreator from './pages/ScriptCreator';
import NicheMap from './pages/NicheMap';
import AdaptVideo from './pages/AdaptVideo';
import VideoMiner from './pages/VideoMiner';
import Settings from './pages/Settings';
import Sidebar from './components/layout/Sidebar';
import { Toaster } from 'sonner';
import { ApiStatusBanner } from './components/ApiStatusBanner';

function App() {
  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-hidden">
      <ApiStatusBanner />
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 relative">
        {/* Background glow effects */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/analyzer" element={<ProfileAnalyzer />} />
              <Route path="/niche-map" element={<NicheMap />} />
              <Route path="/creator" element={<ScriptCreator />} />
              <Route path="/adapt" element={<AdaptVideo />} />
              <Route path="/miner" element={<VideoMiner />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </ErrorBoundary>
        </div>
      </main>
      <Toaster position="top-right" theme="dark" />
    </div>
  );
}

export default App;
