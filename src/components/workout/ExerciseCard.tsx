import React, { useState } from 'react';
import type { RoutineExercise } from '../../types/workout';
import { useWorkout } from '../../context/WorkoutContext';
import { getExerciseVideoUrl } from '../../data/exerciseVideos';
import { 
  CheckCircle2, 
  Circle, 
  Video, 
  ExternalLink, 
  Info, 
  Trophy, 
  Timer, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';

interface ExerciseCardProps {
  exercise: RoutineExercise;
  dayId: string;
  index: number;
  onOpenVideoModal?: (exercise: RoutineExercise) => void;
  onQuickLogPR?: (exercise: RoutineExercise) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  dayId,
  index,
  onOpenVideoModal,
  onQuickLogPR
}) => {
  const { completedExercises, toggleExerciseCompletion, personalRecords, startRestTimer } = useWorkout();
  const [isExpanded, setIsExpanded] = useState(false);

  const isCompleted = completedExercises[`${dayId}-${exercise.exerciseId}`] || completedExercises[`${dayId}-${exercise.id}`];
  const pr = personalRecords[exercise.exerciseId] || personalRecords[exercise.id];

  const openVideoDirect = (term: string) => {
    const directUrl = exercise.videoUrl || getExerciseVideoUrl(term);
    if (directUrl) {
      window.open(directUrl, '_blank', 'noopener,noreferrer');
    } else {
      const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(term + ' exercise form Jeff Nippard')}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div 
      className={`rounded-3xl border transition-all duration-300 overflow-hidden ${
        isCompleted 
          ? 'bg-zinc-950/80 border-yellow-500/40 opacity-90' 
          : 'bg-zinc-900/90 border-zinc-800/80 hover:border-zinc-700 shadow-xl shadow-black/40'
      }`}
    >
      {/* Top Header Card */}
      <div className="p-4 sm:p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            {/* Completion Toggle */}
            <button
              onClick={() => toggleExerciseCompletion(dayId, exercise.exerciseId || exercise.id)}
              className="mt-0.5 text-zinc-400 hover:text-yellow-400 transition-transform active:scale-90 shrink-0"
              title={isCompleted ? 'Marcar como pendiente' : 'Marcar como completado'}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-6 h-6 text-yellow-500 fill-yellow-500/10" />
              ) : (
                <Circle className="w-6 h-6 hover:stroke-yellow-400" />
              )}
            </button>

            {/* Exercise Title and Video Button */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="text-xs font-mono font-bold text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded-md">
                  #{index + 1}
                </span>
                <span className="text-xs font-mono font-bold text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 px-2 py-0.5 rounded-md">
                  {exercise.muscleGroup}
                </span>
                {exercise.weightUnit && (
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border uppercase ${
                    exercise.weightUnit === 'lbs'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                  }`}>
                    {exercise.weightUnit}
                  </span>
                )}
                <span className="text-[11px] font-mono text-zinc-300 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700/60">
                  Aproximación: {exercise.warmupSets} sets
                </span>
                {exercise.intensityTechnique && exercise.intensityTechnique !== 'N/A' && (
                  <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                    ⚡ {exercise.intensityTechnique}
                  </span>
                )}
              </div>

              {/* Exercise Name as Interactive Button to open Video Modal */}
              <button
                type="button"
                onClick={() => onOpenVideoModal ? onOpenVideoModal(exercise) : openVideoDirect(exercise.name)}
                className="text-left group/title flex items-center gap-2"
                title="Hacer clic para ver video tutorial en YouTube"
              >
                <h3 className={`text-lg sm:text-xl font-extrabold capitalize-first tracking-tight group-hover/title:text-yellow-400 transition-colors ${
                  isCompleted ? 'text-zinc-400 line-through' : 'text-white'
                }`}>
                  {exercise.name}
                </h3>
                <span className="p-1 rounded-lg bg-zinc-800 group-hover/title:bg-yellow-500 group-hover/title:text-black text-yellow-400 text-xs transition-all shrink-0">
                  <Video size={14} />
                </span>
              </button>
            </div>
          </div>

          {/* Rest Timer Button */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => startRestTimer(exercise.restSeconds || 90, exercise.name)}
              className="p-2 rounded-xl bg-zinc-800/80 hover:bg-yellow-500/20 hover:text-yellow-400 text-zinc-400 border border-zinc-700/60 transition-colors flex items-center gap-1.5 text-xs font-mono font-bold"
              title={`Iniciar descanso sugerido de ${exercise.restText}`}
            >
              <Timer size={15} />
              <span className="hidden sm:inline">{exercise.restText}</span>
            </button>
          </div>
        </div>

        {/* Metrics Pill Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {/* Target Rep Range (Notice: explicitly marked as Placeholder / Sugerido) */}
          <div className="bg-zinc-950/80 border border-zinc-800/80 p-2.5 rounded-xl text-center">
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Series x Reps</p>
            <p className={`font-mono text-sm sm:text-base font-bold ${isCompleted ? 'text-zinc-400' : 'text-yellow-400'}`}>
              {exercise.workingSetsCount} {exercise.workingSetsCount === 1 ? 'Set' : 'Sets'} × ({exercise.repRange})
            </p>
            <p className="text-[10px] text-zinc-500 font-mono">Placeholder sugerido</p>
          </div>

          {/* Non-editable RIR Requirement */}
          <div className="bg-zinc-950/80 border border-zinc-800/80 p-2.5 rounded-xl text-center">
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">RIR Programado</p>
            <p className="font-mono text-xs sm:text-sm font-bold text-zinc-200 mt-0.5">
              S1: {exercise.targetRir1} {exercise.workingSetsCount > 1 ? `· S2: ${exercise.targetRir2}` : ''}
            </p>
            <p className="text-[10px] text-zinc-500 font-mono">
              {exercise.targetRir2 === '0' || exercise.targetRir1 === '0' ? 'Al Fallo' : 'Reps en Reserva'}
            </p>
          </div>

          {/* Warmup Suggestion */}
          <div className="bg-zinc-950/80 border border-zinc-800/80 p-2.5 rounded-xl text-center">
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Aproximación</p>
            <p className="font-mono text-xs sm:text-sm font-bold text-emerald-400 mt-0.5">
              {exercise.warmupSets} Series
            </p>
            <p className="text-[10px] text-zinc-500 font-mono">No fatigantes</p>
          </div>
        </div>

        {/* Personal Record / Top Badge */}
        {pr && pr.maxWeight > 0 && (
          <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/5 border border-yellow-500/25 rounded-xl p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-zinc-200">Tu Marca Registrada: </span>
                <span className="text-xs font-mono font-black text-yellow-400">
                  {pr.maxWeight} {pr.weightUnit || exercise.weightUnit || 'kg'}
                </span>
                <span className="text-xs text-zinc-400 font-mono"> × {pr.repsAtMaxWeight} reps</span>
                <span className="text-[10px] text-zinc-400 ml-1.5 font-mono">
                  (1RM ~{pr.estimated1RM} {pr.weightUnit || exercise.weightUnit || 'kg'})
                </span>
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

        {/* Technical Note Translated into Spanish */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex gap-2.5 items-start">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-zinc-300 leading-relaxed font-medium">
            <strong className="text-blue-300 font-semibold">Nota técnica (Min-Max): </strong>
            {exercise.note}
          </p>
        </div>

        {/* Collapsible Section: Video Buttons & Substitutions */}
        {isExpanded && (
          <div className="pt-3 border-t border-zinc-800 space-y-3 animate-in fade-in duration-200">
            {/* Video Direct Action */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Video size={13} className="text-yellow-400" />
                <span>Tutoriales en Video:</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => openVideoDirect(exercise.name)}
                  className="p-2.5 bg-zinc-950 hover:bg-zinc-800 border border-yellow-500/30 rounded-xl text-left flex items-center justify-between transition-colors group"
                >
                  <div className="min-w-0 pr-1">
                    <p className="text-[10px] text-yellow-400 font-mono uppercase font-bold">Principal</p>
                    <p className="text-xs font-bold text-white truncate">{exercise.name}</p>
                  </div>
                  <ExternalLink size={13} className="text-zinc-500 group-hover:text-yellow-400 shrink-0" />
                </button>

                {exercise.sub1 && exercise.sub1 !== 'See Notes' && (
                  <button
                    type="button"
                    onClick={() => openVideoDirect(exercise.sub1!)}
                    className="p-2.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-left flex items-center justify-between transition-colors group"
                  >
                    <div className="min-w-0 pr-1">
                      <p className="text-[10px] text-zinc-500 font-mono uppercase">Sustitución 1</p>
                      <p className="text-xs font-bold text-zinc-300 truncate">{exercise.sub1}</p>
                    </div>
                    <ExternalLink size={13} className="text-zinc-500 group-hover:text-white shrink-0" />
                  </button>
                )}

                {exercise.sub2 && exercise.sub2 !== 'See Notes' && (
                  <button
                    type="button"
                    onClick={() => openVideoDirect(exercise.sub2!)}
                    className="p-2.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-left flex items-center justify-between transition-colors group"
                  >
                    <div className="min-w-0 pr-1">
                      <p className="text-[10px] text-zinc-500 font-mono uppercase">Sustitución 2</p>
                      <p className="text-xs font-bold text-zinc-300 truncate">{exercise.sub2}</p>
                    </div>
                    <ExternalLink size={13} className="text-zinc-500 group-hover:text-white shrink-0" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Toggle Details Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-xs font-semibold text-zinc-400">
          <button
            onClick={() => onOpenVideoModal ? onOpenVideoModal(exercise) : openVideoDirect(exercise.name)}
            className="hover:text-yellow-400 flex items-center gap-1.5 transition-colors"
          >
            <Video size={14} className="text-yellow-400" />
            <span>Ver Video & Sustituciones</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="hover:text-zinc-200 flex items-center gap-1 transition-colors"
          >
            <span>{isExpanded ? 'Menos opciones' : 'Videos de sustitución'}</span>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
};
