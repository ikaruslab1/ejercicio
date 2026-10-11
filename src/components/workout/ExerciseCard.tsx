import React, { useState } from 'react';
import type { Exercise } from '../../types/workout';
import { useWorkout } from '../../context/WorkoutContext';
import { ExerciseVisualizer } from '../animations/ExerciseVisualizer';
import { 
  CheckCircle2, 
  Circle, 
  Info, 
  Trophy, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Timer,
  Zap,
  PlaySquare,
  Maximize2
} from 'lucide-react';

interface ExerciseCardProps {
  exercise: Exercise;
  dayId: string;
  index: number;
  onOpenContingency?: (exerciseName: string) => void;
  onQuickLogPR?: (exercise: Exercise) => void;
  onOpenAnimationModal?: (exercise: Exercise) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  dayId,
  index,
  onOpenContingency,
  onQuickLogPR,
  onOpenAnimationModal
}) => {
  const { completedExercises, toggleExerciseCompletion, personalRecords, startRestTimer } = useWorkout();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAnimation, setShowAnimation] = useState(true);

  const isCompleted = completedExercises[`${dayId}-${exercise.id}`];
  const pr = personalRecords[exercise.id];

  return (
    <div 
      className={`rounded-3xl border transition-all duration-300 overflow-hidden ${
        isCompleted 
          ? 'bg-zinc-950/70 border-yellow-500/40 opacity-85' 
          : 'bg-zinc-900/90 border-zinc-800/80 hover:border-zinc-700 shadow-xl shadow-black/40'
      }`}
    >
      {/* Animated Biomechanical Reference Section */}
      {showAnimation && (
        <div className="relative border-b border-zinc-800/80 bg-zinc-950">
          <ExerciseVisualizer
            exerciseId={exercise.id}
            exerciseName={exercise.name}
            muscleGroup={exercise.muscleGroup}
            machine={exercise.machine}
            tempo={exercise.tempo}
            cue={exercise.cue}
            heightClass="h-48 sm:h-56"
            onOpenFullModal={() => onOpenAnimationModal && onOpenAnimationModal(exercise)}
          />
        </div>
      )}

      {/* Top Bar with Number, Name and Machine */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            {/* Completion Check Button */}
            <button
              onClick={() => toggleExerciseCompletion(dayId, exercise.id)}
              className="mt-0.5 text-zinc-400 hover:text-yellow-400 transition-transform active:scale-90 shrink-0"
              title={isCompleted ? 'Marcar como pendiente' : 'Marcar como completado'}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-6 h-6 text-yellow-500 fill-yellow-500/10" />
              ) : (
                <Circle className="w-6 h-6 hover:stroke-yellow-400" />
              )}
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-mono font-bold text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded-md">
                  #{index + 1}
                </span>
                <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-md border ${exercise.zoneColor || 'border-zinc-700 text-zinc-300'}`}>
                  {exercise.machine}
                </span>
                <span className="text-[11px] font-mono text-zinc-400 bg-zinc-800/40 px-2 py-0.5 rounded">
                  {exercise.zone}
                </span>
              </div>

              <h3 className={`text-lg sm:text-xl font-extrabold capitalize-first tracking-tight ${
                isCompleted ? 'text-zinc-400 line-through' : 'text-white'
              }`}>
                {exercise.name}
              </h3>
            </div>
          </div>

          {/* Quick Rest Timer and Animation Modal Trigger */}
          <div className="flex items-center gap-1.5 shrink-0">
            {onOpenAnimationModal && (
              <button
                onClick={() => onOpenAnimationModal(exercise)}
                className="p-2 rounded-xl bg-zinc-800/80 hover:bg-yellow-500/20 hover:text-yellow-400 text-zinc-400 border border-zinc-700/60 transition-colors"
                title="Ver animación en pantalla completa"
              >
                <Maximize2 size={16} />
              </button>
            )}

            <button
              onClick={() => startRestTimer(90, exercise.name)}
              className="p-2 rounded-xl bg-zinc-800/80 hover:bg-yellow-500/20 hover:text-yellow-400 text-zinc-400 border border-zinc-700/60 transition-colors"
              title="Iniciar descanso de 90s"
            >
              <Timer size={16} />
            </button>
          </div>
        </div>

        {/* Target Metrics Pill Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4">
          <div className="bg-zinc-950/80 border border-zinc-800/80 p-2.5 rounded-xl text-center">
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Series x Reps</p>
            <p className={`font-mono text-sm sm:text-base font-bold ${isCompleted ? 'text-zinc-400' : 'text-yellow-400'}`}>
              {exercise.sets}
            </p>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800/80 p-2.5 rounded-xl text-center">
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">RIR Objetivo</p>
            <p className={`font-mono text-sm sm:text-base font-bold ${isCompleted ? 'text-zinc-400' : 'text-zinc-200'}`}>
              RIR {exercise.rir}
            </p>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800/80 p-2.5 rounded-xl text-center">
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Tempo</p>
            <p className="font-mono text-xs sm:text-sm font-semibold text-zinc-300">
              {exercise.tempo || '3-0-1-0'}
            </p>
          </div>
        </div>

        {/* Top/PR Display if exists */}
        {pr && pr.maxWeight > 0 && (
          <div className="mt-3.5 bg-gradient-to-r from-yellow-500/10 to-amber-500/5 border border-yellow-500/25 rounded-xl p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-zinc-200">Top Actual: </span>
                <span className="text-xs font-mono font-black text-yellow-400">{pr.maxWeight} kg</span>
                <span className="text-xs text-zinc-400 font-mono"> × {pr.repsAtMaxWeight} reps</span>
                <span className="text-[10px] text-zinc-400 ml-1.5 font-mono">(1RM ~{pr.estimated1RM}kg)</span>
              </div>
            </div>
            {onQuickLogPR && (
              <button
                onClick={() => onQuickLogPR(exercise)}
                className="text-[11px] font-bold text-yellow-400 hover:text-yellow-300 underline underline-offset-2 ml-2"
              >
                Actualizar
              </button>
            )}
          </div>
        )}

        {/* Key Note & Execution Cue */}
        <div className="mt-3.5 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex gap-2.5 items-start">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-zinc-300 leading-relaxed">
            <strong className="text-blue-300 font-semibold">Nota técnica: </strong>
            {exercise.note}
          </p>
        </div>

        {/* Collapsible Biomechanics & Machine Alternative */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-zinc-800 space-y-2.5 animate-in fade-in duration-200">
            <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
              <p className="text-[11px] font-bold text-yellow-500/90 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Zap size={13} /> Clave Biomecánica
              </p>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {exercise.cue}
              </p>
            </div>

            {onOpenContingency && (
              <button
                onClick={() => onOpenContingency(exercise.name)}
                className="w-full py-2 px-3 bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 border border-zinc-700/50 transition-colors"
              >
                <AlertCircle size={14} className="text-yellow-400" />
                <span>¿Máquina ocupada? Ver alternativas de contingencia</span>
              </button>
            )}
          </div>
        )}

        {/* Toggle Details & Animation visibility Buttons */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-800/60 text-xs font-semibold text-zinc-400">
          <button
            onClick={() => setShowAnimation(!showAnimation)}
            className="hover:text-yellow-400 flex items-center gap-1.5 transition-colors"
          >
            <PlaySquare size={14} className="text-yellow-400" />
            <span>{showAnimation ? 'Ocultar animación' : 'Mostrar animación'}</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="hover:text-zinc-200 flex items-center gap-1 transition-colors"
          >
            <span>{isExpanded ? 'Menos detalles' : 'Claves biomecánicas'}</span>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
};
