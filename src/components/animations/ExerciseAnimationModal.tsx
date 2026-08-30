import React from 'react';
import type { Exercise } from '../../types/workout';
import { ExerciseVisualizer } from './ExerciseVisualizer';
import { 
  X, 
  Zap, 
  Info
} from 'lucide-react';


interface ExerciseAnimationModalProps {
  exercise: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ExerciseAnimationModal: React.FC<ExerciseAnimationModalProps> = ({
  exercise,
  isOpen,
  onClose
}) => {
  if (!isOpen || !exercise) return null;

  return (
    <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-zinc-900 border border-yellow-500/40 rounded-3xl p-5 sm:p-7 max-w-2xl w-full shadow-2xl space-y-5 animate-in zoom-in-95 my-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-zinc-800 pb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                {exercise.muscleGroup}
              </span>
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                {exercise.machine} · {exercise.zone}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white capitalize-first">
              {exercise.name}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Big HD Visualizer */}
        <div className="rounded-2xl overflow-hidden border border-zinc-800">
          <ExerciseVisualizer
            exerciseId={exercise.id}
            exerciseName={exercise.name}
            muscleGroup={exercise.muscleGroup}
            machine={exercise.machine}
            tempo={exercise.tempo}
            cue={exercise.cue}
            heightClass="h-64 sm:h-80"
          />
        </div>

        {/* Biomechanical Cues and Execution Checkpoints */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-1.5">
            <h4 className="text-xs font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap size={14} /> Clave Biomecánica
            </h4>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {exercise.cue}
            </p>
          </div>

          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-1.5">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Info size={14} /> Nota Técnica del Consultor
            </h4>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {exercise.note}
            </p>
          </div>
        </div>

        {/* Parameters Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-800 text-center">
            <p className="text-[10px] text-zinc-400 font-bold uppercase">Series x Reps</p>
            <p className="font-mono font-bold text-sm text-yellow-400 mt-0.5">{exercise.sets}</p>
          </div>
          <div className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-800 text-center">
            <p className="text-[10px] text-zinc-400 font-bold uppercase">RIR Objetivo</p>
            <p className="font-mono font-bold text-sm text-zinc-200 mt-0.5">RIR {exercise.rir}</p>
          </div>
          <div className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-800 text-center">
            <p className="text-[10px] text-zinc-400 font-bold uppercase">Cadencia / Tempo</p>
            <p className="font-mono font-bold text-sm text-emerald-400 mt-0.5">{exercise.tempo || '3-0-1-0'}</p>
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-1">
          <button
            onClick={onClose}
            className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-xl transition-all"
          >
            Entendido · Volver a la Rutina
          </button>
        </div>
      </div>
    </div>
  );
};
