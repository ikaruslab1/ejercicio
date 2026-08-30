import React, { useState } from 'react';
import { useWorkout } from '../../context/WorkoutContext';
import { routineData } from '../../data/routineData';
import { ExerciseCard } from './ExerciseCard';
import { ExerciseAnimationModal } from '../animations/ExerciseAnimationModal';
import type { Exercise } from '../../types/workout';
import { 
  Play, 
  Clock, 
  Target, 
  CheckCircle2, 
  Flame, 
  Trophy, 
  X
} from 'lucide-react';

interface RoutineViewProps {
  dayId: string;
  onOpenContingencyWithExercise?: (exerciseName: string) => void;
}

export const RoutineView: React.FC<RoutineViewProps> = ({ dayId, onOpenContingencyWithExercise }) => {
  const { startLiveWorkout, completedExercises, recordPR } = useWorkout();
  const day = routineData[dayId];

  // Quick PR Modal state
  const [selectedExerciseForPR, setSelectedExerciseForPR] = useState<Exercise | null>(null);
  const [prWeight, setPrWeight] = useState<number>(50);
  const [prReps, setPrReps] = useState<number>(8);

  // Technical Animation Modal state
  const [animatedExercise, setAnimatedExercise] = useState<Exercise | null>(null);

  if (!day) {
    return (
      <div className="p-8 text-center text-zinc-400">
        <p>No se encontró la rutina para el día seleccionado.</p>
      </div>
    );
  }


  // Calculate completed count for this day
  const completedCount = day.exercises.filter(ex => completedExercises[`${day.id}-${ex.id}`]).length;
  const isDayFullyCompleted = completedCount === day.exercises.length && day.exercises.length > 0;

  const handleSavePR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExerciseForPR) return;
    recordPR(
      selectedExerciseForPR.id,
      selectedExerciseForPR.name,
      selectedExerciseForPR.muscleGroup,
      prWeight,
      prReps
    );
    setSelectedExerciseForPR(null);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Day Banner & Action Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
                Día {day.dayNumber} de 5
              </span>
              <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full text-xs font-medium border border-zinc-700 flex items-center gap-1.5">
                <Clock size={13} /> ~{day.estimatedDurationMin} min
              </span>
              {isDayFullyCompleted && (
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold flex items-center gap-1.5 animate-pulse">
                  <CheckCircle2 size={13} /> ¡Día Completado!
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

            {/* Tags */}
            <div className="flex gap-2 flex-wrap pt-1">
              {day.tags.map(tag => (
                <span 
                  key={tag} 
                  className="px-2.5 py-1 bg-zinc-900 text-zinc-300 text-xs rounded-lg font-medium border border-zinc-800"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Launch Live Workout Button */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <button
              onClick={() => startLiveWorkout(dayId)}
              className="py-3.5 px-6 bg-yellow-500 hover:bg-yellow-400 active:scale-95 text-black font-black text-sm rounded-2xl shadow-xl shadow-yellow-500/20 flex items-center justify-center gap-2.5 transition-all group"
            >
              <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
              <span>Iniciar Sesión en Vivo</span>
            </button>

            <div className="text-center text-xs font-mono text-zinc-500">
              Progreso: <span className="text-yellow-400 font-bold">{completedCount}</span> de {day.exercises.length} ejercicios
            </div>
          </div>
        </div>
      </div>

      {/* Exercises Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
            <Flame className="w-5 h-5 text-yellow-400" />
            <span>Ejercicios Programados</span>
          </h2>
          <span className="text-xs font-mono text-zinc-400">
            {day.exercises.length} movimientos
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {day.exercises.map((exercise, index) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              dayId={dayId}
              index={index}
              onOpenContingency={onOpenContingencyWithExercise}
              onOpenAnimationModal={(ex) => setAnimatedExercise(ex)}
              onQuickLogPR={(ex) => {
                setSelectedExerciseForPR(ex);
                setPrWeight(50);
                setPrReps(8);
              }}
            />
          ))}
        </div>
      </div>

      {/* High Definition Animation Modal */}
      <ExerciseAnimationModal
        exercise={animatedExercise}
        isOpen={animatedExercise !== null}
        onClose={() => setAnimatedExercise(null)}
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
