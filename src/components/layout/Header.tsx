import React from 'react';
import { useWorkout } from '../../context/WorkoutContext';
import { Menu, Play, Trophy, Sparkles, Dumbbell, Settings, Cloud, CloudOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { routineData } from '../../data/routineData';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu, onOpenSettings }) => {
  const { 
    activeTab, 
    setActiveTab,
    activeSession, 
    setIsLiveModalOpen, 
    startLiveWorkout, 
    personalRecords, 
    workoutHistory,
    isCloudConnected,
    isSyncing,
    lastSyncedAt,
    syncWithNeonCloud,
    selectedWeek,
    completedExercises
  } = useWorkout();

  const nextUncompletedDayId = [`w${selectedWeek}_d1`, `w${selectedWeek}_d2`, `w${selectedWeek}_d3`, `w${selectedWeek}_d4`, `w${selectedWeek}_d5`].find(dayId => {
    const isRecorded = workoutHistory.some(s => s.dayId === dayId);
    if (isRecorded) return false;
    const routine = routineData[dayId];
    if (!routine) return false;
    const completed = routine.exercises.filter(ex => completedExercises[`${dayId}-${ex.id}`] || completedExercises[`${dayId}-${ex.exerciseId}`]).length;
    return completed < routine.exercises.length;
  }) || null;

  const getTitle = () => {
    if (activeTab === 'dashboard') return 'Dashboard Principal';
    if (activeTab === 'tracking') return 'Bitácora de Sesiones & Peso Corporal';
    if (activeTab === 'prs') return 'Tops & Récords Personales';
    if (activeTab === 'history') return 'Historial de Entrenamientos';
    if (activeTab === 'nutrition') return 'Evaluación Fisiológica & Nutrición';
    if (activeTab === 'optimization') return 'Optimización & Recuperación ACSM 2026';
    if (activeTab === 'contingency') return 'Plan de Contingencia (Horas Pico)';
    if (activeTab.startsWith('w') || activeTab.startsWith('d')) {
      const routine = routineData[activeTab] || routineData[`w${selectedWeek}_d1`];
      return routine ? `Semana ${routine.weekNumber} · ${routine.title}` : 'Rutina de Entrenamiento';
    }
    return 'Ecosistema Smart Fit';
  };


  const totalPRs = Object.keys(personalRecords).length;
  const totalWorkouts = workoutHistory.length;

  return (
    <header className="sticky top-0 z-30 bg-zinc-950/85 backdrop-blur-md border-b border-zinc-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Left Title & Mobile Menu */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl border border-zinc-800 shrink-0"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate flex items-center gap-2">
            {getTitle()}
          </h2>
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-mono text-zinc-400 hidden sm:block">
              Smart Fit · Entrenamiento Hipertrofia & Rendimiento
            </p>
            {/* Neon Cloud Status Badge */}
            <button
              onClick={() => syncWithNeonCloud()}
              className={`hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono border transition-all ${
                isCloudConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200'
              }`}
              title={`Neon PostgreSQL: ${isCloudConnected ? 'Conectado' : 'Sin conexión'} ${lastSyncedAt ? `(Sincronizado: ${lastSyncedAt})` : ''} · Clic para forzar sincronización`}
            >
              {isSyncing ? (
                <RefreshCw size={10} className="animate-spin text-yellow-400" />
              ) : isCloudConnected ? (
                <Cloud size={10} className="text-emerald-400" />
              ) : (
                <CloudOff size={10} className="text-zinc-500" />
              )}
              <span>{isSyncing ? 'Sincronizando...' : isCloudConnected ? 'Neon Cloud' : 'Local'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Controls & Quick Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Quick PR & Workout Badges */}
        <div className="hidden md:flex items-center gap-2 bg-zinc-900/90 border border-zinc-800/80 px-3 py-1.5 rounded-xl text-xs">
          <div className="flex items-center gap-1.5 text-yellow-400 font-semibold" title="Tops registrados">
            <Trophy size={14} />
            <span>{totalPRs} Tops</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-300" title="Sesiones completadas">
            <Dumbbell size={14} className="text-zinc-400" />
            <span>{totalWorkouts} Sesiones</span>
          </div>
        </div>

        {/* Active workout resume or Start Button */}

        {activeSession ? (
          <button
            onClick={() => setIsLiveModalOpen(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-yellow-500/20 active:scale-95 transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-black animate-ping hidden sm:inline-block" />
            <span>Entreno Activo ({Math.floor(activeSession.elapsedSeconds / 60)}m)</span>
          </button>
        ) : (activeTab.startsWith('w') || activeTab.startsWith('d')) ? (() => {
          const targetDayId = activeTab.startsWith('w') ? activeTab : `w${selectedWeek}_${activeTab}`;
          const isRecorded = workoutHistory.some(s => s.dayId === targetDayId);
          if (isRecorded) {
            return (
              <button
                onClick={() => setActiveTab('history')}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 font-bold text-xs sm:text-sm rounded-xl active:scale-95 transition-all"
                title="Sesión ya registrada. Clic para verla o editarla en el historial."
              >
                <CheckCircle2 size={15} />
                <span>Día Registrado</span>
              </button>
            );
          }
          return (
            <button
              onClick={() => startLiveWorkout(targetDayId)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-yellow-500/20 active:scale-95 transition-all"
            >
              <Play size={15} className="fill-current" />
              <span>Entrenar Este Día</span>
            </button>
          );
        })() : nextUncompletedDayId ? (
          <button
            onClick={() => startLiveWorkout(nextUncompletedDayId)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-yellow-400 border border-yellow-500/30 font-bold text-xs sm:text-sm rounded-xl active:scale-95 transition-all"
          >
            <Sparkles size={15} />
            <span className="hidden sm:inline">Iniciar Rutina (Sem {selectedWeek})</span>
            <span className="sm:hidden">Entrenar</span>
          </button>
        ) : (
          <button
            onClick={() => setActiveTab('history')}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold text-xs sm:text-sm rounded-xl"
            title="Todos los días de esta semana han sido registrados"
          >
            <CheckCircle2 size={15} />
            <span className="hidden sm:inline">Semana {selectedWeek} Completa</span>
            <span className="sm:hidden">Completa</span>
          </button>
        )}

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl border border-zinc-800 shrink-0"
          title="Configuración y Respaldos"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
};

