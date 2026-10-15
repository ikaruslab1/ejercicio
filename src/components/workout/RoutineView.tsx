import React, { useState } from 'react';
import { useWorkout } from '../../context/WorkoutContext';
import { routineData, programWeeksList } from '../../data/routineData';
import { ExerciseCard } from './ExerciseCard';
import { ExerciseVideoModal } from './ExerciseVideoModal';
import type { RoutineExercise } from '../../types/workout';
import { 
  Play, 
  Clock, 
  Target, 
  CheckCircle2, 
  Flame, 
  Trophy, 
  X, 
  Calendar, 
  Zap, 
  ChevronLeft, 
  ChevronRight,
  History
} from 'lucide-react';

interface RoutineViewProps {
  dayId?: string;
  onOpenContingencyWithExercise?: (exerciseName: string) => void;
}

export const RoutineView: React.FC<RoutineViewProps> = ({ dayId }) => {
  const { 
    startLiveWorkout, 
    completedExercises, 
    recordPR, 
    personalRecords,
    selectedWeek,
    setSelectedWeek,
    activeTab,
    setActiveTab,
    workoutHistory
  } = useWorkout();

  // Determine current active day
  const effectiveDayId = dayId || (activeTab.startsWith('w') ? activeTab : `w${selectedWeek}_d1`);
  const day = routineData[effectiveDayId] || routineData[`w${selectedWeek}_d1`] || routineData['w1_d1'];

  // Current week information
  const currentWeekInfo = programWeeksList.find(w => w.weekNumber === selectedWeek) || programWeeksList[0];

  // Quick PR Modal state
  const [selectedExerciseForPR, setSelectedExerciseForPR] = useState<RoutineExercise | null>(null);
  const [prWeight, setPrWeight] = useState<number>(50);
  const [prReps, setPrReps] = useState<number>(8);

  // Video Tutorial Modal state (replaces legacy animations)
  const [videoExercise, setVideoExercise] = useState<RoutineExercise | null>(null);

  if (!day) {
    return (
      <div className="p-8 text-center text-zinc-400">
        <p>No se encontró la rutina para el día seleccionado.</p>
      </div>
    );
  }

  // Calculate completed count for this day
  const isSessionAlreadyRecorded = workoutHistory.some(s => s.dayId === day.id);
  const completedCount = day.exercises.filter(
    ex => completedExercises[`${day.id}-${ex.exerciseId}`] || completedExercises[`${day.id}-${ex.id}`]
  ).length;
  const isDayFullyCompleted = isSessionAlreadyRecorded || (completedCount === day.exercises.length && day.exercises.length > 0);

  const handleSavePR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExerciseForPR) return;
    recordPR(
      selectedExerciseForPR.exerciseId || selectedExerciseForPR.id,
      selectedExerciseForPR.name,
      selectedExerciseForPR.muscleGroup,
      prWeight,
      prReps
    );
    setSelectedExerciseForPR(null);
  };

  const splitTabs = [
    { num: 1, key: 'upper1', label: 'Upper 1', tag: 'Torso' },
    { num: 2, key: 'lower1', label: 'Lower 1', tag: 'Pierna Cuádriceps' },
    { num: 3, key: 'upper2', label: 'Upper 2', tag: 'Torso Espalda/Pecho' },
    { num: 4, key: 'lower2', label: 'Lower 2', tag: 'Pierna Femoral/Glúteo' },
    { num: 5, key: 'arms_delts', label: 'Arms & Delts', tag: 'Brazos & Deltoides' }
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Week Selector Bar (1..12) */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center border border-yellow-500/30">
              <Calendar size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Min-Max Program</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 font-mono font-bold">
                  Semana {selectedWeek} de 12
                </span>
              </h2>
              <p className="text-xs text-zinc-400">{currentWeekInfo.phase}</p>
            </div>
          </div>

          {/* Prev / Next Week Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                const prev = Math.max(1, selectedWeek - 1);
                setSelectedWeek(prev);
                setActiveTab(`w${prev}_d${day.dayNumber}`);
              }}
              disabled={selectedWeek <= 1}
              className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Semana anterior"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-mono text-xs text-zinc-300 px-2">
              {selectedWeek} / 12
            </span>
            <button
              onClick={() => {
                const next = Math.min(12, selectedWeek + 1);
                setSelectedWeek(next);
                setActiveTab(`w${next}_d${day.dayNumber}`);
              }}
              disabled={selectedWeek >= 12}
              className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Semana siguiente"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Horizontal Week Pill Slider */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {programWeeksList.map((w) => {
            const isCurrent = w.weekNumber === selectedWeek;
            return (
              <button
                key={w.weekNumber}
                onClick={() => {
                  setSelectedWeek(w.weekNumber);
                  setActiveTab(`w${w.weekNumber}_d${day.dayNumber}`);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold shrink-0 transition-all ${
                  isCurrent
                    ? 'bg-yellow-500 text-black shadow-md shadow-yellow-500/20 scale-105'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800/80'
                }`}
              >
                Semana {w.weekNumber}
              </button>
            );
          })}
        </div>

        {/* Split Days Tabs within Current Week */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-zinc-800/80">
          {splitTabs.map((tab) => {
            const tabDayId = `w${selectedWeek}_d${tab.num}`;
            const isActive = day.dayNumber === tab.num;
            const tabRoutine = routineData[tabDayId];
            const isTabRecorded = workoutHistory.some(s => s.dayId === tabDayId);
            const tabCompleted = tabRoutine ? tabRoutine.exercises.filter(
              ex => completedExercises[`${tabDayId}-${ex.exerciseId}`] || completedExercises[`${tabDayId}-${ex.id}`]
            ).length : 0;
            const tabTotal = tabRoutine?.exercises.length || 0;
            const isTabFinished = isTabRecorded || (tabCompleted === tabTotal && tabTotal > 0);

            return (
              <button
                key={tab.num}
                onClick={() => setActiveTab(tabDayId)}
                className={`p-2.5 rounded-2xl text-left border transition-all ${
                  isActive
                    ? 'bg-gradient-to-br from-yellow-500/20 to-amber-500/10 border-yellow-500/50 shadow-md'
                    : 'bg-zinc-900/60 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold uppercase ${isActive ? 'text-yellow-400' : 'text-zinc-500'}`}>
                    Día {tab.num}
                  </span>
                  {isTabFinished ? (
                    <CheckCircle2 size={13} className="text-emerald-400" />
                  ) : (
                    <span className="text-[10px] font-mono text-zinc-500">{tabCompleted}/{tabTotal}</span>
                  )}
                </div>
                <p className={`text-xs font-bold mt-1 truncate ${isActive ? 'text-white' : 'text-zinc-300'}`}>
                  {tab.label}
                </p>
                <p className="text-[10px] text-zinc-400 truncate">{tab.tag}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Banner & Action Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
                Semana {day.weekNumber} · Día {day.dayNumber} ({day.dayName})
              </span>
              <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full text-xs font-medium border border-zinc-700 flex items-center gap-1.5">
                <Clock size={13} /> ~{day.estimatedDurationMin} min
              </span>
              {isDayFullyCompleted && (
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold flex items-center gap-1.5 animate-pulse">
                  <CheckCircle2 size={13} /> ¡Sesión Completada!
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              {day.title}
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 font-medium">
              {day.subtitle}
            </p>

            <div className="flex items-start gap-2 text-xs text-zinc-400 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80">
              <Target size={15} className="text-yellow-400 shrink-0 mt-0.5" />
              <span><strong className="text-zinc-200">Enfoque fisiológico: </strong>{day.focus}</span>
            </div>

            {/* Intensity Technique Badge for Weeks 8-12 */}
            {day.weekNumber >= 8 && (
              <div className="flex items-center gap-2 text-xs font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-300 p-2.5 rounded-xl">
                <Zap size={15} className="text-yellow-400 shrink-0" />
                <span>
                  <strong>Técnicas de Intensidad Activas:</strong> En la última serie de ejercicios seleccionados se aplican técnicas avanzadas (Drop sets, Myo-reps, Parciales).
                </span>
              </div>
            )}
          </div>

          {/* Launch Live Workout Button or Completed Banner */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            {isSessionAlreadyRecorded ? (
              <div className="space-y-2">
                <div className="py-3.5 px-6 bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-black text-sm rounded-2xl flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/10">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Sesión Registrada en Historial</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveTab('history')}
                    className="text-xs text-yellow-400 hover:text-yellow-300 font-bold underline flex items-center gap-1 transition-colors"
                  >
                    <History size={13} />
                    <span>Ver o editar datos en Historial →</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => startLiveWorkout(day.id)}
                className="py-3.5 px-6 bg-yellow-500 hover:bg-yellow-400 active:scale-95 text-black font-black text-sm rounded-2xl shadow-xl shadow-yellow-500/20 flex items-center justify-center gap-2.5 transition-all group"
              >
                <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
                <span>Iniciar Sesión en Vivo</span>
              </button>
            )}

            <div className="text-center text-xs font-mono text-zinc-500">
              {isSessionAlreadyRecorded ? (
                <span className="text-emerald-400 font-bold">✓ Día ya completado</span>
              ) : (
                <>Progreso: <span className="text-yellow-400 font-bold">{completedCount}</span> de {day.exercises.length} ejercicios</>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Exercises Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
            <Flame className="w-5 h-5 text-yellow-400" />
            <span>Ejercicios Programados ({day.exercises.length})</span>
          </h2>
          <span className="text-xs font-mono text-zinc-400">
            Haz clic en el nombre del ejercicio para ver el video tutorial
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {day.exercises.map((exercise, index) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              dayId={day.id}
              index={index}
              onOpenVideoModal={(ex) => setVideoExercise(ex)}
              onQuickLogPR={(ex) => {
                setSelectedExerciseForPR(ex);
                const existing = personalRecords[ex.exerciseId] || personalRecords[ex.id];
                setPrWeight(existing?.maxWeight || 50);
                setPrReps(existing?.repsAtMaxWeight || 8);
              }}
            />
          ))}
        </div>
      </div>

      {/* Video Guide Modal (Replaces animations with direct YouTube search & technical guides) */}
      <ExerciseVideoModal
        exercise={videoExercise}
        isOpen={videoExercise !== null}
        onClose={() => setVideoExercise(null)}
      />

      {/* Quick PR Update Modal */}
      {selectedExerciseForPR && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-yellow-500/40 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-yellow-500/20 text-yellow-400">
                  <Trophy size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Registrar Top / PR</h3>
                  <p className="text-xs text-zinc-400">{selectedExerciseForPR.name}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedExerciseForPR(null)}
                className="text-zinc-500 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePR} className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                  Peso Levantado (kg)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPrWeight(prev => Math.max(0, prev - 2.5))}
                    className="p-2.5 bg-zinc-800 text-zinc-200 rounded-xl font-bold hover:bg-zinc-700"
                  >
                    -2.5
                  </button>
                  <input
                    type="number"
                    step="0.5"
                    value={prWeight}
                    onChange={(e) => setPrWeight(parseFloat(e.target.value) || 0)}
                    className="flex-1 bg-zinc-950 border border-zinc-700 text-center font-mono font-bold text-lg text-yellow-400 rounded-xl py-2 focus:outline-none focus:border-yellow-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setPrWeight(prev => prev + 2.5)}
                    className="p-2.5 bg-zinc-800 text-zinc-200 rounded-xl font-bold hover:bg-zinc-700"
                  >
                    +2.5
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                  Repeticiones Completadas
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPrReps(prev => Math.max(1, prev - 1))}
                    className="p-2.5 bg-zinc-800 text-zinc-200 rounded-xl font-bold hover:bg-zinc-700"
                  >
                    -1
                  </button>
                  <input
                    type="number"
                    value={prReps}
                    onChange={(e) => setPrReps(parseInt(e.target.value) || 1)}
                    className="flex-1 bg-zinc-950 border border-zinc-700 text-center font-mono font-bold text-lg text-white rounded-xl py-2 focus:outline-none focus:border-yellow-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setPrReps(prev => prev + 1)}
                    className="p-2.5 bg-zinc-800 text-zinc-200 rounded-xl font-bold hover:bg-zinc-700"
                  >
                    +1
                  </button>
                </div>
              </div>

              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-center">
                <p className="text-[11px] text-zinc-400">1RM Estimado (Fórmula Epley):</p>
                <p className="text-lg font-mono font-black text-yellow-400">
                  ~{Math.round(prWeight * (1 + prReps / 30) * 10) / 10} kg
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedExerciseForPR(null)}
                  className="flex-1 py-2.5 bg-zinc-800 text-zinc-300 text-xs font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-black rounded-xl shadow-md shadow-yellow-500/20"
                >
                  Guardar Marca
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
