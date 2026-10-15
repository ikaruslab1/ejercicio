import React from 'react';
import { useWorkout } from '../../context/WorkoutContext';
import { routineData } from '../../data/routineData';
import { 
  Play, 
  Trophy, 
  Flame, 
  Dumbbell, 
  Calendar, 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  Utensils, 
  AlertTriangle, 
  CheckCircle2, 
  Clock
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { 
    setActiveTab, 
    startLiveWorkout, 
    personalRecords, 
    workoutHistory, 
    completedExercises, 
    userProfile,
    selectedWeek
  } = useWorkout();

  // Find next suggested workout day for current week that has not been recorded
  const daysList = [1, 2, 3, 4, 5].map(d => `w${selectedWeek}_d${d}`);
  const nextDayId = daysList.find(dayId => {
    const isRecorded = workoutHistory.some(s => s.dayId === dayId);
    if (isRecorded) return false;
    const day = routineData[dayId];
    if (!day) return false;
    const completedCount = day.exercises.filter(
      ex => completedExercises[`${day.id}-${ex.exerciseId}`] || completedExercises[`${day.id}-${ex.id}`]
    ).length;
    return completedCount < day.exercises.length;
  }) || daysList.find(dayId => !workoutHistory.some(s => s.dayId === dayId)) || `w${selectedWeek}_d1`;

  const nextDay = routineData[nextDayId] || routineData[`w${selectedWeek}_d1`];
  const isNextDayRecorded = workoutHistory.some(s => s.dayId === nextDay?.id);

  // Top 3 highest PRs
  const topPRs = Object.values(personalRecords)
    .sort((a, b) => b.estimated1RM - a.estimated1RM)
    .slice(0, 4);

  // Calculate cumulative stats
  const totalVolumeAllTime = workoutHistory.reduce((acc, s) => acc + (s.totalVolumeKg || 0), 0);
  const totalSetsAllTime = workoutHistory.reduce((acc, s) => acc + (s.totalSetsCompleted || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border border-yellow-500/30 p-6 sm:p-10 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-mono font-bold uppercase">
              <Sparkles size={13} />
              <span>Ecosistema Smart Fit · v2.0 ACSM</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Bienvenido, <span className="text-yellow-400">{userProfile.name}</span>
            </h1>

            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed font-medium">
              Tu centro de mando para sobrecarga progresiva, control de fatiga en horas pico y seguimiento de marcas personales.
            </p>

            <div className="flex items-center gap-4 pt-2 text-xs font-mono text-zinc-400">
              <span>🎯 Objetivo: <strong className="text-white">Hipertrofia Limpia</strong></span>
              <span>⚡ Peso: <strong className="text-yellow-400">{userProfile.weightKg} kg</strong></span>
            </div>
          </div>

          {/* Quick Launch Next Day Card */}
          {nextDay && (
            <div className="bg-zinc-950/80 border border-yellow-500/40 p-5 sm:p-6 rounded-3xl max-w-sm w-full space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-yellow-400 uppercase tracking-wider">
                  Siguiente Sesión
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                  Día {nextDay.dayNumber}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-white">{nextDay.title}</h3>
                <p className="text-xs text-zinc-400 mt-0.5">{nextDay.subtitle}</p>
              </div>

              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Clock size={13} className="text-yellow-400" />
                <span>Duración est.: ~{nextDay.estimatedDurationMin} min</span>
              </div>

              <div className="flex gap-2">
                {isNextDayRecorded ? (
                  <button
                    onClick={() => setActiveTab('history')}
                    className="flex-1 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-all"
                  >
                    <CheckCircle2 size={16} />
                    <span>Sesión Ya Registrada</span>
                  </button>
                ) : (
                  <button
                    onClick={() => startLiveWorkout(nextDay.id)}
                    className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-400 active:scale-95 text-black font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2 transition-all"
                  >
                    <Play size={16} className="fill-current" />
                    <span>Entrenar Ahora</span>
                  </button>
                )}

                <button
                  onClick={() => setActiveTab(nextDay.id)}
                  className="px-3.5 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold transition-all"
                  title="Ver detalles de la rutina"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5-Day Weekly Split Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Flame className="text-yellow-400" size={20} />
            <span>Progreso Semanal de Rutinas (5 Días)</span>
          </h2>
          <span className="text-xs font-mono text-zinc-400">División Staggered</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {daysList.map(dayId => {
            const day = routineData[dayId];
            if (!day) return null;

            const completedCount = day.exercises.filter(
              ex => completedExercises[`${day.id}-${ex.exerciseId}`] || completedExercises[`${day.id}-${ex.id}`]
            ).length;
            const isRecorded = workoutHistory.some(s => s.dayId === dayId);
            const isCompleted = isRecorded || (completedCount === day.exercises.length && day.exercises.length > 0);

            return (
              <div
                key={dayId}
                onClick={() => setActiveTab(dayId)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between ${
                  isCompleted 
                    ? 'bg-yellow-500/10 border-yellow-500/40 shadow-sm' 
                    : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono font-bold text-yellow-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                      Día {day.dayNumber} · {day.dayName}
                    </span>
                    {isCompleted ? (
                      <CheckCircle2 size={16} className="text-emerald-400" />
                    ) : (
                      <span className="text-[10px] text-zinc-500 font-mono">{completedCount}/{day.exercises.length}</span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-white line-clamp-1">{day.title.split(':')[1] || day.title}</h4>
                  <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">{day.subtitle || day.focus}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-zinc-500 font-mono">~{day.estimatedDurationMin}m</span>
                  <span className="text-yellow-400 font-bold flex items-center gap-0.5">
                    Ver <ArrowRight size={11} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Highlights: Top PRs & Quick Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tops / PRs Spotlight */}
        <div className="lg:col-span-2 bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                <Trophy size={18} />
              </div>
              <h3 className="font-extrabold text-lg text-white">Tops Destacados (Fuerza Máxima)</h3>
            </div>
            <button
              onClick={() => setActiveTab('prs')}
              className="text-xs font-bold text-yellow-400 hover:underline flex items-center gap-1"
            >
              Ver todos los tops <ArrowRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topPRs.map(pr => (
              <div 
                key={pr.exerciseId}
                className="bg-zinc-950/80 border border-zinc-800/80 p-4 rounded-2xl flex items-center justify-between hover:border-yellow-500/30 transition-all"
              >
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">{pr.muscleGroup}</span>
                  <h4 className="font-bold text-sm text-white capitalize-first">{pr.exerciseName}</h4>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">
                    {pr.maxWeight} kg × {pr.repsAtMaxWeight} reps
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-zinc-400 uppercase font-bold">1RM Est.</p>
                  <p className="text-lg font-mono font-black text-yellow-400">~{pr.estimated1RM}kg</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lifetime Activity Stats */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-lg text-white mb-1">Rendimiento Histórico</h3>
            <p className="text-xs text-zinc-400">Estadísticas acumuladas de entrenamiento</p>
          </div>

          <div className="space-y-3">
            <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800/80 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-zinc-400 font-bold uppercase">Volumen Total Movido</p>
                <p className="text-xl font-mono font-black text-yellow-400">
                  {totalVolumeAllTime > 1000 ? `${(totalVolumeAllTime / 1000).toFixed(1)}k` : totalVolumeAllTime} kg
                </p>
              </div>
              <Dumbbell className="text-zinc-700 w-8 h-8" />
            </div>

            <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800/80 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-zinc-400 font-bold uppercase">Sesiones Registradas</p>
                <p className="text-xl font-mono font-black text-white">
                  {workoutHistory.length} sesiones
                </p>
              </div>
              <Calendar className="text-zinc-700 w-8 h-8" />
            </div>

            <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800/80 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-zinc-400 font-bold uppercase">Series Efectivas</p>
                <p className="text-xl font-mono font-black text-blue-400">
                  {totalSetsAllTime} sets
                </p>
              </div>
              <TrendingUp className="text-zinc-700 w-8 h-8" />
            </div>
          </div>

          <button
            onClick={() => setActiveTab('history')}
            className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl transition-all text-center"
          >
            Ver Historial Completo
          </button>
        </div>
      </div>

      {/* Quick Access Ecosystem Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nutrition Card */}
        <div 
          onClick={() => setActiveTab('nutrition')}
          className="p-5 rounded-3xl bg-gradient-to-r from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-yellow-500/40 cursor-pointer transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 group-hover:scale-110 transition-transform">
              <Utensils size={22} />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-base">Nutrición & Suplementos</h4>
              <p className="text-xs text-zinc-400 mt-0.5">Calculadora TDEE, distribución de macros y timing de creatina</p>
            </div>
          </div>
          <ArrowRight className="text-zinc-500 group-hover:text-yellow-400 transition-colors" size={20} />
        </div>

        {/* Contingency Card */}
        <div 
          onClick={() => setActiveTab('contingency')}
          className="p-5 rounded-3xl bg-gradient-to-r from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-yellow-500/40 cursor-pointer transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
              <AlertTriangle size={22} />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-base">Plan de Contingencia</h4>
              <p className="text-xs text-zinc-400 mt-0.5">Sustitutos biomecánicos inmediatos para horas pico en Smart Fit</p>
            </div>
          </div>
          <ArrowRight className="text-zinc-500 group-hover:text-amber-400 transition-colors" size={20} />
        </div>
      </div>
    </div>
  );
};
