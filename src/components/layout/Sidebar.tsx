import React from 'react';
import { useWorkout } from '../../context/WorkoutContext';
import { 
  LayoutDashboard, 
  Dumbbell, 
  Trophy, 
  History, 
  Utensils, 
  BatteryCharging, 
  AlertTriangle, 
  Settings, 
  PlayCircle,
  Flame,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onOpenSettings }) => {
  const { activeTab, setActiveTab, activeSession, setIsLiveModalOpen, userProfile } = useWorkout();

  const routineItems = [
    { id: 'd1', label: 'Día 1: Pecho + Abs', tag: 'Torso' },
    { id: 'd2', label: 'Día 2: Espalda', tag: 'Dorsal' },
    { id: 'd3', label: 'Día 3: Hombros', tag: 'Deltoides' },
    { id: 'd4', label: 'Día 4: Piernas', tag: 'Inferior' },
    { id: 'd5', label: 'Día 5: Brazos', tag: 'Bíceps/Tríceps' },
  ];

  const mainItems = [
    { id: 'dashboard', label: 'Dashboard General', icon: LayoutDashboard },
  ];

  const performanceItems = [
    { id: 'prs', label: 'Tops & Récords (PRs)', icon: Trophy, badge: 'Marcas' },
    { id: 'history', label: 'Historial de Sesiones', icon: History },
  ];

  const knowledgeItems = [
    { id: 'nutrition', label: 'Nutrición & Suplementación', icon: Utensils },
    { id: 'optimization', label: 'Optimización ACSM 2026', icon: BatteryCharging },
    { id: 'contingency', label: 'Contingencia (Horas Pico)', icon: AlertTriangle },
  ];

  const handleSelectTab = (id: string) => {
    setActiveTab(id);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen w-72 bg-zinc-950 border-r border-zinc-800/80 z-40
        flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-xl flex items-center justify-center font-black text-black text-xl shadow-lg shadow-yellow-500/20">
              SF
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                Fit Tracker <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">v2.0</span>
              </h1>
              <p className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest">
                Ecosistema Personal
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="lg:hidden p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900"
          >
            <X size={20} />
          </button>
        </div>

        {/* Live workout quick bar in sidebar if active */}
        {activeSession && (
          <div className="p-3 mx-3 mt-3 bg-gradient-to-r from-yellow-500/15 to-amber-500/10 border border-yellow-500/30 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">
                  Entreno en Curso
                </span>
              </div>
              <span className="text-xs font-mono text-zinc-300">
                {Math.floor(activeSession.elapsedSeconds / 60)}m {activeSession.elapsedSeconds % 60}s
              </span>
            </div>
            <button
              onClick={() => { setIsLiveModalOpen(true); onClose(); }}
              className="w-full py-1.5 px-3 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <PlayCircle size={14} /> Continuar Sesión
            </button>
          </div>
        )}

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 text-sm">
          {/* Principal */}
          <div>
            <p className="px-3 text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
              General
            </p>
            {mainItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-all ${
                    isActive 
                      ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 font-semibold' 
                      : 'text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={isActive ? 'text-yellow-400' : 'text-zinc-400'} />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Rutinas 5 Días */}
          <div>
            <div className="flex items-center justify-between px-3 mb-1.5">
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Rutina Semanal
              </p>
              <span className="text-[10px] text-zinc-400 font-mono">5 DÍAS</span>
            </div>

            <div className="space-y-1">
              {routineItems.map(item => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive 
                        ? 'bg-yellow-500 text-black font-bold shadow-md shadow-yellow-500/10' 
                        : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Dumbbell size={15} className={isActive ? 'text-black' : 'text-yellow-500/80'} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                      isActive ? 'bg-black/20 text-black font-semibold' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                    }`}>
                      {item.tag}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rendimiento & Récords */}
          <div>
            <p className="px-3 text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
              Rendimiento & Tops
            </p>
            <div className="space-y-1">
              {performanceItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-all ${
                      isActive 
                        ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 font-semibold' 
                        : 'text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} className={isActive ? 'text-yellow-400' : 'text-zinc-400'} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded font-mono">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conocimiento & Ecosistema */}
          <div>
            <p className="px-3 text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
              Ecosistema & Guías
            </p>
            <div className="space-y-1">
              {knowledgeItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-all ${
                      isActive 
                        ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 font-semibold' 
                        : 'text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} className={isActive ? 'text-yellow-400' : 'text-zinc-400'} />
                      <span className="truncate">{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* User Profile & Settings Footer */}
        <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/50">
          <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/70 border border-zinc-800/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-yellow-400 text-xs border border-yellow-500/20 shrink-0">
                <Flame size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-zinc-200 truncate">{userProfile.name}</p>
                <p className="text-[10px] text-zinc-400 font-mono">{userProfile.weightKg} kg · {userProfile.age} años</p>
              </div>
            </div>

            <button
              onClick={onOpenSettings}
              className="p-2 text-zinc-400 hover:text-yellow-400 hover:bg-zinc-800 rounded-lg transition-colors"
              title="Configuración y Respaldos"
            >
              <Settings size={17} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
