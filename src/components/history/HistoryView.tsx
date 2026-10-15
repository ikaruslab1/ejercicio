import React, { useState } from 'react';
import { useWorkout } from '../../context/WorkoutContext';
import type { WorkoutSession } from '../../types/workout';
import { EditSessionModal } from './EditSessionModal';
import { 
  History, 
  Dumbbell, 
  Calendar, 
  Trash2, 
  Edit3,
  ChevronDown, 
  ChevronUp, 
  Flame,
  CheckCircle2,
  Filter,
  Search,
  AlertTriangle
} from 'lucide-react';

export const HistoryView: React.FC = () => {
  const { workoutHistory, deleteWorkoutSession, updateWorkoutSession, startLiveWorkout, setActiveTab, selectedWeek } = useWorkout();
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState<WorkoutSession | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<WorkoutSession | null>(null);
  
  // Filter states
  const [selectedWeekFilter, setSelectedWeekFilter] = useState<string>('all');
  const [selectedSplitFilter, setSelectedSplitFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredHistory = workoutHistory.filter(session => {
    // 1. Week Filter
    if (selectedWeekFilter !== 'all') {
      const targetWeek = parseInt(selectedWeekFilter, 10);
      const sessionWeek = session.weekNumber || (session.dayId.startsWith('w') ? parseInt(session.dayId.split('_')[0].replace('w', ''), 10) : 1);
      if (sessionWeek !== targetWeek) return false;
    }

    // 2. Split Group Filter
    if (selectedSplitFilter !== 'all') {
      const titleLower = (session.dayTitle || '').toLowerCase();
      const idLower = (session.dayId || '').toLowerCase();
      const key = session.dayKey || '';

      let matchSplit = key === selectedSplitFilter;
      if (!matchSplit) {
        if (selectedSplitFilter === 'upper1') {
          matchSplit = titleLower.includes('upper 1') || idLower.endsWith('_d1') || idLower === 'd1';
        } else if (selectedSplitFilter === 'lower1') {
          matchSplit = titleLower.includes('lower 1') || idLower.endsWith('_d2') || idLower === 'd2';
        } else if (selectedSplitFilter === 'upper2') {
          matchSplit = titleLower.includes('upper 2') || idLower.endsWith('_d3') || idLower === 'd3';
        } else if (selectedSplitFilter === 'lower2') {
          matchSplit = titleLower.includes('lower 2') || idLower.endsWith('_d4') || idLower === 'd4';
        } else if (selectedSplitFilter === 'arms_delts') {
          matchSplit = titleLower.includes('arms') || titleLower.includes('brazos') || idLower.endsWith('_d5') || idLower === 'd5';
        }
      }

      if (!matchSplit) return false;
    }

    // 3. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDay = session.dayTitle.toLowerCase().includes(q);
      const matchExercise = session.exercises.some(e => e.exerciseName.toLowerCase().includes(q));
      const matchNotes = (session.notes || '').toLowerCase().includes(q);
      if (!matchDay && !matchExercise && !matchNotes) return false;
    }

    return true;
  });

  const totalVolumeKg = filteredHistory.reduce((sum, s) => sum + (s.totalVolumeKg || 0), 0);
  const avgDurationMin = filteredHistory.length > 0
    ? Math.round(filteredHistory.reduce((sum, s) => sum + (s.durationSeconds || 0), 0) / filteredHistory.length / 60)
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
            <span className="text-xs font-mono text-zinc-400">Historial de 12 Semanas</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Historial de Sesiones de Entrenamiento
          </h1>

          <p className="text-sm text-zinc-300 leading-relaxed">
            Revisa tus sesiones pasadas, filtra por semana o división corporal (Upper 1, Lower 1, etc.) y evalúa tu sobrecarga progresiva.
          </p>
        </div>

        {/* Aggregate Stats */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-zinc-800">
          <div className="bg-zinc-950/70 p-3.5 rounded-2xl border border-zinc-800 text-center sm:text-left">
            <p className="text-[10px] text-zinc-400 font-bold uppercase">Sesiones Filtradas</p>
            <p className="text-xl sm:text-2xl font-black text-white font-mono">{filteredHistory.length}</p>
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

      {/* Filter Bar */}
      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-3xl space-y-3 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Split Filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-mono text-zinc-400 flex items-center gap-1 font-bold mr-1">
              <Filter size={13} className="text-yellow-400" /> División:
            </span>
            {[
              { id: 'all', label: 'Todos los Grupos' },
              { id: 'upper1', label: 'Upper 1' },
              { id: 'lower1', label: 'Lower 1' },
              { id: 'upper2', label: 'Upper 2' },
              { id: 'lower2', label: 'Lower 2' },
              { id: 'arms_delts', label: 'Arms & Delts' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedSplitFilter(tab.id)}
                className={`px-3 py-1 text-xs font-mono rounded-xl transition-all ${
                  selectedSplitFilter === tab.id
                    ? 'bg-yellow-500 text-black font-bold shadow-md shadow-yellow-500/20'
                    : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar ejercicio o nota..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-yellow-500"
            />
          </div>
        </div>

        {/* Week Horizontal Slider */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-zinc-800/80 scrollbar-thin">
          <span className="text-xs font-mono text-zinc-400 font-bold shrink-0 mr-1">
            Semana:
          </span>
          <button
            onClick={() => setSelectedWeekFilter('all')}
            className={`px-2.5 py-1 text-xs font-mono rounded-lg shrink-0 transition-all ${
              selectedWeekFilter === 'all'
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 font-bold'
                : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            Todas
          </button>
          {Array.from({ length: 12 }, (_, i) => i + 1).map(w => (
            <button
              key={w}
              onClick={() => setSelectedWeekFilter(String(w))}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg shrink-0 transition-all ${
                selectedWeekFilter === String(w)
                  ? 'bg-yellow-500 text-black font-bold shadow-sm'
                  : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              Sem {w}
            </button>
          ))}
        </div>
      </div>

      {/* History List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
            <Flame className="text-yellow-400" size={18} />
            <span>Entrenamientos Finalizados ({filteredHistory.length})</span>
          </h2>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-800 space-y-4">
            <div className="w-12 h-12 bg-zinc-800 text-zinc-500 rounded-2xl flex items-center justify-center mx-auto">
              <Dumbbell size={24} />
            </div>
            <div>
              <p className="text-base font-bold text-white">No se encontraron sesiones con los filtros seleccionados.</p>
              <p className="text-xs text-zinc-500 mt-1">
                Inicia una sesión en vivo desde cualquier día de la rutina para registrar tus entrenamientos.
              </p>
            </div>
            <button
              onClick={() => { setActiveTab(`w${selectedWeek}_d1`); startLiveWorkout(`w${selectedWeek}_d1`); }}
              className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs rounded-xl shadow-lg shadow-yellow-500/20"
            >
              Iniciar Entrenamiento (Semana {selectedWeek} · Día 1)
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((session) => {
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
                        <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                          {session.dayTitle}
                        </span>
                        {session.weekNumber && (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                            Semana {session.weekNumber}
                          </span>
                        )}
                        <span className="text-xs text-zinc-400 font-mono flex items-center gap-1">
                          <Calendar size={13} /> {formatDate(session.startTime)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-400 text-sm">
                        {'★'.repeat(session.rating || 5)}
                        <span className="text-xs text-zinc-500 ml-1 font-mono">({session.rating || 5}/5)</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <button
                        onClick={() => setEditingSession(session)}
                        className="px-2.5 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold active:scale-95 shadow-sm"
                        title="Editar esta sesión (cargas, reps, fecha, notas)"
                      >
                        <Edit3 size={14} />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => setSessionToDelete(session)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                        title="Eliminar sesión del historial"
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

                  {/* General Session Notes if any */}
                  {session.notes && (
                    <div className="bg-zinc-950/60 p-3 rounded-2xl border border-zinc-800 text-xs text-zinc-300">
                      <strong className="text-yellow-400">Nota de la sesión: </strong>{session.notes}
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
                            <span className="font-bold text-white">#{idx + 1} {ex.exerciseName}</span>
                            <div className="flex items-center gap-1.5">
                              {ex.weightUnit && (
                                <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-yellow-400 border border-zinc-700">
                                  {ex.weightUnit}
                                </span>
                              )}
                              {ex.muscleGroup && (
                                <span className="text-zinc-500 font-mono text-[11px] bg-zinc-900 px-2 py-0.5 rounded">
                                  {ex.muscleGroup}
                                </span>
                              )}
                            </div>
                          </div>

                          {ex.notes && ex.notes.trim() && (
                            <p className="text-xs text-amber-300/90 italic bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-xl">
                              📝 <strong className="not-italic text-amber-400">Nota: </strong>{ex.notes}
                            </p>
                          )}

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {ex.sets.map((set, sIdx) => (
                              <div 
                                key={sIdx}
                                className={`p-2.5 rounded-xl border text-xs font-mono ${
                                  set.completed 
                                    ? set.isWarmup 
                                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                                      : 'bg-zinc-900 border-yellow-500/30 text-zinc-200' 
                                    : 'bg-zinc-900/40 border-zinc-800 text-zinc-500'
                                }`}
                              >
                                <div className="flex justify-between items-center mb-1">
                                  {set.isWarmup ? (
                                    <span className="text-[10px] font-bold text-emerald-400 uppercase">Aprox #{set.setNumber}</span>
                                  ) : (
                                    <span className="text-zinc-400 font-bold">Set #{set.setNumber}</span>
                                  )}
                                  {set.completed && <CheckCircle2 size={12} className={set.isWarmup ? 'text-emerald-400' : 'text-yellow-400'} />}
                                </div>
                                <p className="font-bold text-yellow-400 text-sm">
                                  {set.weight} {set.weightUnit || ex.weightUnit || 'kg'} × {set.reps} reps
                                </p>
                                {set.rir !== undefined && (
                                  <p className="text-[10px] text-zinc-400 mt-0.5">
                                    RIR: {set.rir}
                                  </p>
                                )}
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
      {/* Edit Session Modal */}
      {editingSession && (
        <EditSessionModal
          session={editingSession}
          onClose={() => setEditingSession(null)}
          onSave={async (updated) => {
            await updateWorkoutSession(updated);
            setEditingSession(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {sessionToDelete && (
        <div className="fixed inset-0 z-70 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-red-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">¿Eliminar esta sesión?</h3>
                <p className="text-xs text-zinc-400 font-mono">Esta acción no se puede deshacer</p>
              </div>
            </div>

            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-1.5">
              <p className="text-sm font-bold text-white">{sessionToDelete.dayTitle}</p>
              <p className="text-xs text-zinc-400 font-mono">
                {sessionToDelete.weekNumber ? `Semana ${sessionToDelete.weekNumber} · ` : ''}{formatDate(sessionToDelete.startTime)}
              </p>
              <p className="text-xs text-zinc-500 mt-2">
                Al eliminarla, este día quedará desbloqueado para volver a entrenarlo y se actualizarán tus estadísticas de volumen y series.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSessionToDelete(null)}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteWorkoutSession(sessionToDelete.id);
                  setSessionToDelete(null);
                }}
                className="px-5 py-2.5 bg-red-500 hover:bg-red-600 active:scale-95 text-white font-black text-xs rounded-xl shadow-lg shadow-red-500/20 flex items-center gap-1.5 transition-all"
              >
                <Trash2 size={14} />
                <span>Sí, Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
