import React, { useState } from 'react';
import { useWorkout } from '../../context/WorkoutContext';
import { 
  History, 
  Dumbbell, 
  Calendar, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Flame,
  CheckCircle2
} from 'lucide-react';

export const HistoryView: React.FC = () => {
  const { workoutHistory, deleteWorkoutSession, startLiveWorkout, setActiveTab } = useWorkout();
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  const totalVolumeKg = workoutHistory.reduce((sum, s) => sum + (s.totalVolumeKg || 0), 0);
  const avgDurationMin = workoutHistory.length > 0
    ? Math.round(workoutHistory.reduce((sum, s) => sum + (s.durationSeconds || 0), 0) / workoutHistory.length / 60)
    : 0;


  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-MX', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border border-zinc-800 p-6 sm:p-8 shadow-xl">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-yellow-500 text-black rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-yellow-500/20">
              <History size={13} /> Registro de Actividad
            </span>
            <span className="text-xs font-mono text-zinc-400">Historial Completo</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Historial de Sesiones de Entrenamiento
          </h1>

          <p className="text-sm text-zinc-300 leading-relaxed">
            Revisa tus sesiones pasadas, el volumen total acumulado por sesión y tus notas de esfuerzo percibido.
          </p>
        </div>

        {/* Aggregate Stats */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-zinc-800">
          <div className="bg-zinc-950/70 p-3.5 rounded-2xl border border-zinc-800 text-center sm:text-left">
            <p className="text-[10px] text-zinc-400 font-bold uppercase">Sesiones</p>
            <p className="text-xl sm:text-2xl font-black text-white font-mono">{workoutHistory.length}</p>
          </div>
          <div className="bg-zinc-950/70 p-3.5 rounded-2xl border border-zinc-800 text-center sm:text-left">
            <p className="text-[10px] text-zinc-400 font-bold uppercase">Volumen Total</p>
            <p className="text-xl sm:text-2xl font-black text-yellow-400 font-mono">
              {totalVolumeKg > 1000 ? `${(totalVolumeKg / 1000).toFixed(1)}k` : totalVolumeKg} kg
            </p>
          </div>
          <div className="bg-zinc-950/70 p-3.5 rounded-2xl border border-zinc-800 text-center sm:text-left">
            <p className="text-[10px] text-zinc-400 font-bold uppercase">Duración Media</p>
            <p className="text-xl sm:text-2xl font-black text-blue-400 font-mono">~{avgDurationMin} min</p>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
            <Flame className="text-yellow-400" size={18} />
            <span>Entrenamientos Finalizados ({workoutHistory.length})</span>
          </h2>
        </div>

        {workoutHistory.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-800 space-y-4">
            <div className="w-12 h-12 bg-zinc-800 text-zinc-500 rounded-2xl flex items-center justify-center mx-auto">
              <Dumbbell size={24} />
            </div>
            <div>
              <p className="text-base font-bold text-white">Aún no has registrado ninguna sesión.</p>
              <p className="text-xs text-zinc-500 mt-1">
                Inicia una sesión en vivo desde cualquier día de la rutina para registrar tu primer entrenamiento.
              </p>
            </div>
            <button
              onClick={() => { setActiveTab('d1'); startLiveWorkout('d1'); }}
              className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs rounded-xl shadow-lg shadow-yellow-500/20"
            >
              Iniciar Primer Entrenamiento (Día 1)
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {workoutHistory.map((session) => {
              const isExpanded = expandedSessionId === session.id;
              const durationMins = Math.round((session.durationSeconds || 0) / 60);

              return (
                <div
                  key={session.id}
                  className="bg-zinc-900/90 border border-zinc-800/90 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl hover:border-zinc-700 transition-all"
                >
                  {/* Session Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                          {session.dayTitle}
                        </span>
                        <span className="text-xs text-zinc-400 font-mono flex items-center gap-1">
                          <Calendar size={13} /> {formatDate(session.startTime)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-400 text-sm">
                        {'★'.repeat(session.rating || 5)}
                        <span className="text-xs text-zinc-500 ml-1 font-mono">({session.rating || 5}/5)</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => deleteWorkoutSession(session.id)}
                        className="p-2 text-zinc-600 hover:text-red-400 rounded-xl hover:bg-zinc-800 transition-colors"
                        title="Eliminar sesión"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Summary Metric Pills */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800/80 text-center">
                      <p className="text-[10px] text-zinc-400 font-bold uppercase">Duración</p>
                      <p className="font-mono font-black text-sm sm:text-base text-white">{durationMins} min</p>
                    </div>

                    <div className="bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800/80 text-center">
                      <p className="text-[10px] text-zinc-400 font-bold uppercase">Volumen</p>
                      <p className="font-mono font-black text-sm sm:text-base text-yellow-400">{session.totalVolumeKg.toLocaleString()} kg</p>
                    </div>

                    <div className="bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800/80 text-center">
                      <p className="text-[10px] text-zinc-400 font-bold uppercase">Series</p>
                      <p className="font-mono font-black text-sm sm:text-base text-blue-400">{session.totalSetsCompleted} sets</p>
                    </div>
                  </div>

                  {/* Notes if any */}
                  {session.notes && (
                    <div className="bg-zinc-950/60 p-3 rounded-2xl border border-zinc-800 text-xs text-zinc-300">
                      <strong className="text-yellow-400">Notas: </strong>{session.notes}
                    </div>
                  )}

                  {/* Expand / Collapse Details Button */}
                  <div className="pt-2 border-t border-zinc-800/80 flex justify-end">
                    <button
                      onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                      className="text-xs font-bold text-yellow-400 hover:text-yellow-300 flex items-center gap-1"
                    >
                      <span>{isExpanded ? 'Ocultar desglose de series' : 'Ver detalle serie por serie'}</span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>

                  {/* Detailed Exercise Breakdown */}
                  {isExpanded && (
                    <div className="pt-3 space-y-3 animate-in fade-in duration-200">
                      {session.exercises.map((ex, idx) => (
                        <div key={idx} className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-white">{ex.exerciseName}</span>
                            <span className="text-zinc-500 font-mono">{ex.machine}</span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {ex.sets.map((set, sIdx) => (
                              <div 
                                key={sIdx}
                                className={`p-2 rounded-xl border text-xs font-mono ${
                                  set.completed 
                                    ? 'bg-zinc-900 border-yellow-500/30 text-zinc-200' 
                                    : 'bg-zinc-900/40 border-zinc-800 text-zinc-500'
                                }`}
                              >
                                <div className="flex justify-between">
                                  <span className="text-zinc-500">Set #{set.setNumber}</span>
                                  {set.completed && <CheckCircle2 size={12} className="text-yellow-400" />}
                                </div>
                                <p className="font-bold text-yellow-400 mt-1">
                                  {set.weight} kg × {set.reps} reps
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
