import React, { useState, useEffect } from 'react';
import type { RoutineExercise } from '../../types/workout';
import { getExerciseVideoUrl, getYoutubeEmbedUrl } from '../../data/exerciseVideos';
import { 
  X, 
  Video, 
  ExternalLink, 
  Repeat, 
  Info, 
  Timer,
  Play
} from 'lucide-react';

interface ExerciseVideoModalProps {
  exercise: RoutineExercise | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ExerciseVideoModal: React.FC<ExerciseVideoModalProps> = ({
  exercise,
  isOpen,
  onClose
}) => {
  const [activeVariant, setActiveVariant] = useState<'main' | 'sub1' | 'sub2'>('main');

  // Reset variant to main when exercise changes
  useEffect(() => {
    setActiveVariant('main');
  }, [exercise?.id, exercise?.name]);

  if (!isOpen || !exercise) return null;

  // Resolve current active variant name and official video URL
  let currentName = exercise.name;
  let currentVideoUrl = exercise.videoUrl || getExerciseVideoUrl(exercise.name);

  if (activeVariant === 'sub1' && exercise.sub1) {
    currentName = exercise.sub1;
    currentVideoUrl = exercise.sub1VideoUrl || getExerciseVideoUrl(exercise.sub1);
  } else if (activeVariant === 'sub2' && exercise.sub2) {
    currentName = exercise.sub2;
    currentVideoUrl = exercise.sub2VideoUrl || getExerciseVideoUrl(exercise.sub2);
  }

  const embedUrl = getYoutubeEmbedUrl(currentVideoUrl || currentName);

  const handleOpenExternal = () => {
    if (currentVideoUrl) {
      window.open(currentVideoUrl, '_blank', 'noopener,noreferrer');
    } else {
      const fallback = `https://www.youtube.com/results?search_query=${encodeURIComponent(currentName + ' exercise form Jeff Nippard')}`;
      window.open(fallback, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-yellow-500/40 rounded-3xl p-4 sm:p-6 max-w-2xl w-full shadow-2xl space-y-4 animate-in zoom-in-95 my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-zinc-800 pb-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                {exercise.muscleGroup}
              </span>
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                Aproximación: {exercise.warmupSets} sets
              </span>
              {exercise.intensityTechnique && exercise.intensityTechnique !== 'N/A' && (
                <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                  ⚡ {exercise.intensityTechnique}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white capitalize-first">
              {currentName}
            </h2>
            {activeVariant !== 'main' && (
              <p className="text-xs font-mono text-zinc-400">
                Sustitución de: <span className="text-yellow-400 font-bold">{exercise.name}</span>
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors shrink-0"
            title="Cerrar ventana"
          >
            <X size={20} />
          </button>
        </div>

        {/* Variant Tabs: Main + Substitutions */}
        {(exercise.sub1 || exercise.sub2) && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
              <Repeat size={12} className="text-amber-400" />
              <span>Variantes & Sustituciones del Programa:</span>
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveVariant('main')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                  activeVariant === 'main'
                    ? 'bg-yellow-500 text-black border-yellow-400 shadow-md shadow-yellow-500/20'
                    : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <Play size={12} className={activeVariant === 'main' ? 'fill-black' : 'text-yellow-400'} />
                <span>Principal: {exercise.name}</span>
              </button>

              {exercise.sub1 && exercise.sub1 !== 'See Notes' && (
                <button
                  type="button"
                  onClick={() => setActiveVariant('sub1')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                    activeVariant === 'sub1'
                      ? 'bg-yellow-500 text-black border-yellow-400 shadow-md shadow-yellow-500/20'
                      : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <Play size={12} className={activeVariant === 'sub1' ? 'fill-black' : 'text-yellow-400'} />
                  <span>Sub 1: {exercise.sub1}</span>
                </button>
              )}

              {exercise.sub2 && exercise.sub2 !== 'See Notes' && (
                <button
                  type="button"
                  onClick={() => setActiveVariant('sub2')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                    activeVariant === 'sub2'
                      ? 'bg-yellow-500 text-black border-yellow-400 shadow-md shadow-yellow-500/20'
                      : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <Play size={12} className={activeVariant === 'sub2' ? 'fill-black' : 'text-yellow-400'} />
                  <span>Sub 2: {exercise.sub2}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Embedded Video Player */}
        <div className="space-y-2">
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-2xl flex items-center justify-center">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={`Tutorial ${currentName}`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-zinc-400 p-6 text-center space-y-2">
                <Video size={36} className="text-yellow-500" />
                <p className="text-sm font-bold text-white">Video del ejercicio</p>
                <p className="text-xs text-zinc-400">Puedes abrir el video directamente en YouTube</p>
              </div>
            )}
          </div>

          {/* Action Button: Open in Official YouTube */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
              <Video size={13} className="text-yellow-400" />
              <span>Video tutorial oficial Min-Max Program</span>
            </span>

            <button
              onClick={handleOpenExternal}
              className="px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 hover:text-yellow-300 border border-yellow-500/30 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 transition-all"
            >
              <span>Abrir en YouTube</span>
              <ExternalLink size={13} />
            </button>
          </div>
        </div>

        {/* Technical Spanish Note */}
        <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800 space-y-1">
          <h4 className="text-xs font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-1.5">
            <Info size={14} /> Consejos de Ejecución & Técnica (Español)
          </h4>
          <p className="text-xs text-zinc-200 leading-relaxed font-medium">
            {exercise.note}
          </p>
        </div>

        {/* Target Metrics */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800 text-center">
            <p className="text-[10px] text-zinc-400 font-bold uppercase">Series Efectivas</p>
            <p className="font-mono font-bold text-sm text-yellow-400 mt-0.5">
              {exercise.workingSetsCount} {exercise.workingSetsCount === 1 ? 'Serie' : 'Series'}
            </p>
            <p className="text-[10px] text-zinc-500 font-mono">Reps: {exercise.repRange}</p>
          </div>

          <div className="bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800 text-center">
            <p className="text-[10px] text-zinc-400 font-bold uppercase">RIR Objetivo</p>
            <p className="font-mono font-bold text-sm text-zinc-200 mt-0.5">
              S1: {exercise.targetRir1} · S2: {exercise.targetRir2}
            </p>
            <p className="text-[10px] text-zinc-500 font-mono">
              {exercise.targetRir2 === '0' ? 'Última al fallo' : 'Cerca del fallo'}
            </p>
          </div>

          <div className="bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800 text-center">
            <p className="text-[10px] text-zinc-400 font-bold uppercase">Descanso Sugerido</p>
            <p className="font-mono font-bold text-sm text-emerald-400 mt-0.5 flex items-center justify-center gap-1">
              <Timer size={13} /> {exercise.restText}
            </p>
            <p className="text-[10px] text-zinc-500 font-mono">~{exercise.restSeconds}s contador</p>
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-1">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-xl transition-all"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
