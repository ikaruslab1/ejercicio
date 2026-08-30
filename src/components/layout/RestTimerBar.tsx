import React from 'react';
import { useWorkout } from '../../context/WorkoutContext';
import { Play, Pause, RotateCcw, Plus, Minus, Timer } from 'lucide-react';

export const RestTimerBar: React.FC = () => {
  const { restTimer, pauseRestTimer, resumeRestTimer, resetRestTimer, adjustRestTimer } = useWorkout();

  if (restTimer.remainingSeconds <= 0 && !restTimer.isRunning) {
    return null;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progress = restTimer.initialSeconds > 0 
    ? ((restTimer.initialSeconds - restTimer.remainingSeconds) / restTimer.initialSeconds) * 100 
    : 0;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-lg bg-zinc-900/95 backdrop-blur-md border border-yellow-500/40 rounded-2xl shadow-2xl shadow-yellow-500/10 p-3 sm:p-4 text-zinc-100 transition-all duration-300">
      {/* Progress Bar */}
      <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mb-3">
        <div 
          className="bg-yellow-500 h-full transition-all duration-500 ease-linear rounded-full"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        {/* Timer Display */}
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${restTimer.isRunning ? 'bg-yellow-500/20 text-yellow-400 animate-pulse' : 'bg-zinc-800 text-zinc-400'}`}>
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-2xl font-black text-yellow-400 tracking-tight">
                {formatTime(restTimer.remainingSeconds)}
              </span>
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Descanso
              </span>
            </div>
            {restTimer.exerciseName && (
              <p className="text-xs text-zinc-400 truncate max-w-[140px] sm:max-w-[200px]">
                {restTimer.exerciseName}
              </p>
            )}
          </div>
        </div>

        {/* Adjustments & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => adjustRestTimer(-15)}
            className="p-1.5 sm:p-2 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-300 rounded-lg text-xs font-mono font-bold flex items-center gap-0.5"
            title="Restar 15s"
          >
            <Minus className="w-3.5 h-3.5" /> 15s
          </button>

          <button
            onClick={() => adjustRestTimer(15)}
            className="p-1.5 sm:p-2 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-300 rounded-lg text-xs font-mono font-bold flex items-center gap-0.5"
            title="Sumar 15s"
          >
            <Plus className="w-3.5 h-3.5" /> 15s
          </button>

          {restTimer.isRunning ? (
            <button
              onClick={pauseRestTimer}
              className="p-2.5 bg-yellow-500 hover:bg-yellow-400 active:scale-95 text-black rounded-xl font-bold shadow-md shadow-yellow-500/20"
              title="Pausar"
            >
              <Pause className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={resumeRestTimer}
              className="p-2.5 bg-yellow-500 hover:bg-yellow-400 active:scale-95 text-black rounded-xl font-bold shadow-md shadow-yellow-500/20"
              title="Reanudar"
            >
              <Play className="w-4 h-4 fill-current" />
            </button>
          )}

          <button
            onClick={resetRestTimer}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-400 hover:text-red-400 rounded-xl"
            title="Cerrar temporizador"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
