import React, { useState } from 'react';
import type { WorkoutSession, WorkoutExerciseLog, WorkoutSetLog, WeightUnit } from '../../types/workout';
import { getLocalDateString } from '../../lib/dateUtils';
import { 
  X, 
  Save, 
  Calendar, 
  Star, 
  Trash2, 
  Plus, 
  Check, 
  AlertCircle, 
  Dumbbell, 
  FileText,
  Clock
} from 'lucide-react';

interface EditSessionModalProps {
  session: WorkoutSession;
  onClose: () => void;
  onSave: (updatedSession: WorkoutSession) => Promise<boolean | void> | void;
}

export const EditSessionModal: React.FC<EditSessionModalProps> = ({ session, onClose, onSave }) => {
  const [dateStr, setDateStr] = useState<string>(() => {
    try {
      return getLocalDateString(session.startTime);
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  });

  const [rating, setRating] = useState<number>(session.rating || 5);
  const [notes, setNotes] = useState<string>(session.notes || '');
  const [durationMinutes, setDurationMinutes] = useState<number>(Math.max(1, Math.round((session.durationSeconds || 3600) / 60)));
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Clone exercises and sets for local editing
  const [exercises, setExercises] = useState<WorkoutExerciseLog[]>(() => 
    JSON.parse(JSON.stringify(session.exercises || []))
  );

  // Calculate live volume and sets
  let liveVolumeKg = 0;
  let liveSetsCompleted = 0;

  exercises.forEach(ex => {
    const exUnit = ex.weightUnit || 'kg';
    ex.sets.forEach(s => {
      if (s.completed && s.weight > 0 && s.reps > 0) {
        const unit = s.weightUnit || exUnit;
        const kg = unit === 'lbs' ? s.weight * 0.45359237 : s.weight;
        liveVolumeKg += Math.round(kg * s.reps);
        liveSetsCompleted += 1;
      } else if (s.completed) {
        liveSetsCompleted += 1;
      }
    });
  });

  // Handle Set Update
  const handleUpdateSet = (
    exIdx: number, 
    setIdx: number, 
    field: keyof WorkoutSetLog, 
    val: any
  ) => {
    setExercises(prev => {
      const copy = [...prev];
      const ex = { ...copy[exIdx] };
      const sets = [...ex.sets];
      sets[setIdx] = { ...sets[setIdx], [field]: val };
      ex.sets = sets;
      copy[exIdx] = ex;
      return copy;
    });
  };

  // Toggle Exercise Unit
  const handleToggleExerciseUnit = (exIdx: number, newUnit: WeightUnit) => {
    setExercises(prev => {
      const copy = [...prev];
      const ex = { ...copy[exIdx] };
      ex.weightUnit = newUnit;
      ex.sets = ex.sets.map(s => ({
        ...s,
        weightUnit: newUnit
      }));
      copy[exIdx] = ex;
      return copy;
    });
  };

  // Add Set to Exercise
  const handleAddSet = (exIdx: number, isWarmup: boolean = false) => {
    setExercises(prev => {
      const copy = [...prev];
      const ex = { ...copy[exIdx] };
      const lastSet = ex.sets[ex.sets.length - 1];
      const currentUnit = ex.weightUnit || 'kg';
      const matchingCount = ex.sets.filter(s => !!s.isWarmup === isWarmup).length;

      const newSet: WorkoutSetLog = {
        setNumber: matchingCount + 1,
        weight: lastSet ? lastSet.weight : 0,
        weightUnit: currentUnit,
        reps: lastSet ? lastSet.reps : 8,
        rir: isWarmup ? 'N/A' : '1',
        isWarmup,
        completed: true,
        timestamp: new Date().toISOString()
      };

      ex.sets = [...ex.sets, newSet];
      copy[exIdx] = ex;
      return copy;
    });
  };

  // Remove Set from Exercise
  const handleRemoveSet = (exIdx: number, setIdx: number) => {
    setExercises(prev => {
      const copy = [...prev];
      const ex = { ...copy[exIdx] };
      ex.sets = ex.sets
        .filter((_, i) => i !== setIdx)
        .map((s, idx) => ({ ...s, setNumber: idx + 1 }));
      copy[exIdx] = ex;
      return copy;
    });
  };

  // Update Exercise Note
  const handleUpdateExerciseNote = (exIdx: number, note: string) => {
    setExercises(prev => {
      const copy = [...prev];
      copy[exIdx] = { ...copy[exIdx], notes: note };
      return copy;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);

    try {
      // Reconstruct timestamps preserving time component
      const timePart = session.startTime 
        ? new Date(session.startTime).toTimeString().split(' ')[0] 
        : '12:00:00';
      const combinedStart = new Date(`${dateStr}T${timePart}`);
      const validStartTime = isNaN(combinedStart.getTime()) ? session.startTime : combinedStart.toISOString();
      const validDurationSec = Math.max(60, durationMinutes * 60);
      const validEndTime = new Date(new Date(validStartTime).getTime() + validDurationSec * 1000).toISOString();

      const updated: WorkoutSession = {
        ...session,
        startTime: validStartTime,
        endTime: validEndTime,
        durationSeconds: validDurationSec,
        rating,
        notes: notes.trim() ? notes.trim() : undefined,
        exercises,
        totalVolumeKg: liveVolumeKg,
        totalSetsCompleted: liveSetsCompleted
      };

      await onSave(updated);
      setIsSaving(false);
      onClose();
    } catch (err: any) {
      console.error('Error saving edited session:', err);
      setErrorMessage(err?.message || 'Error al guardar los cambios.');
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-zinc-900 border border-yellow-500/40 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-zinc-950 border-b border-zinc-800 px-5 sm:px-8 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center border border-yellow-500/30 shrink-0">
              <Dumbbell size={20} />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-black text-white truncate flex items-center gap-2">
                <span>Editar Sesión</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                  {session.dayId.toUpperCase()}
                </span>
              </h2>
              <p className="text-xs text-zinc-400 font-mono truncate">
                {session.dayTitle} · Semana {session.weekNumber || 1}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors"
            title="Cerrar sin guardar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
          {errorMessage && (
            <div className="bg-red-500/20 border border-red-500/40 text-red-300 p-3 rounded-2xl text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Top Session Metadata (Date, Duration, Rating) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-zinc-950 p-4 sm:p-5 rounded-2xl border border-zinc-800/80">
            {/* Date Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={14} className="text-yellow-400" />
                <span>Fecha de la Sesión:</span>
              </label>
              <input
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-yellow-500"
                required
              />
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={14} className="text-yellow-400" />
                <span>Duración (minutos):</span>
              </label>
              <input
                type="number"
                min="1"
                max="360"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-yellow-500"
                required
              />
            </div>

            {/* Rating Stars */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Star size={14} className="text-yellow-400" />
                <span>Calificación:</span>
              </label>
              <div className="flex items-center gap-1 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-xl transition-transform active:scale-125 ${
                      star <= rating ? 'text-yellow-400 scale-105' : 'text-zinc-700'
                    }`}
                  >
                    ★
                  </button>
                ))}
                <span className="text-xs text-zinc-400 font-mono ml-2">({rating}/5)</span>
              </div>
            </div>

            {/* General Session Notes */}
            <div className="sm:col-span-3 space-y-1.5 pt-2 border-t border-zinc-800/80">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={14} className="text-yellow-400" />
                <span>Notas Generales de la Sesión:</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Sensaciones, fatiga, RIR general o ajustes en esta sesión..."
                rows={2}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-yellow-500"
              />
            </div>
          </div>

          {/* Exercises & Sets Editor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>Desglose de Ejercicios y Series</span>
                <span className="text-xs font-mono text-zinc-400">({exercises.length})</span>
              </h3>
            </div>

            {exercises.map((ex, exIdx) => {
              const currentUnit = ex.weightUnit || 'kg';
              const step = currentUnit === 'lbs' ? 5 : 2.5;

              return (
                <div 
                  key={ex.exerciseId || exIdx}
                  className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-md"
                >
                  {/* Exercise Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">
                        #{exIdx + 1}
                      </span>
                      <h4 className="text-sm sm:text-base font-black text-white capitalize-first">
                        {ex.exerciseName}
                      </h4>
                      {ex.muscleGroup && (
                        <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                          {ex.muscleGroup}
                        </span>
                      )}
                    </div>

                    {/* Weight Unit Selector: KG | LBS */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <div className="flex items-center bg-zinc-900 p-0.5 rounded-xl border border-zinc-700 shadow-inner">
                        <button
                          type="button"
                          onClick={() => handleToggleExerciseUnit(exIdx, 'kg')}
                          className={`px-2.5 py-1 text-xs font-mono font-black rounded-lg transition-all ${
                            currentUnit === 'kg'
                              ? 'bg-yellow-500 text-black shadow'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          KG
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleExerciseUnit(exIdx, 'lbs')}
                          className={`px-2.5 py-1 text-xs font-mono font-black rounded-lg transition-all ${
                            currentUnit === 'lbs'
                              ? 'bg-amber-400 text-black shadow'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          LBS
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Exercise Note Input */}
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={ex.notes || ''}
                      onChange={(e) => handleUpdateExerciseNote(exIdx, e.target.value)}
                      placeholder="Nota de ejecución para este ejercicio..."
                      className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-yellow-500"
                    />
                  </div>

                  {/* Sets Table */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-2 text-[10px] font-mono text-zinc-400 font-bold uppercase px-2">
                      <div className="col-span-2 text-center">Tipo</div>
                      <div className="col-span-4 sm:col-span-3 text-center">Carga ({currentUnit})</div>
                      <div className="col-span-3 sm:col-span-3 text-center">Reps</div>
                      <div className="col-span-1 sm:col-span-2 text-center hidden sm:block">RIR</div>
                      <div className="col-span-3 sm:col-span-2 text-center">Estado</div>
                    </div>

                    {ex.sets.map((set, setIdx) => {
                      return (
                        <div 
                          key={setIdx}
                          className={`grid grid-cols-12 gap-2 items-center p-2 rounded-xl border transition-all ${
                            set.completed 
                              ? set.isWarmup 
                                ? 'bg-emerald-500/10 border-emerald-500/30' 
                                : 'bg-zinc-900 border-yellow-500/30' 
                              : 'bg-zinc-900/40 border-zinc-800'
                          }`}
                        >
                          {/* Warmup / Working Set Toggle */}
                          <div className="col-span-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleUpdateSet(exIdx, setIdx, 'isWarmup', !set.isWarmup)}
                              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border transition-all ${
                                set.isWarmup
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                              }`}
                              title="Clic para cambiar entre serie efectiva o aproximación"
                            >
                              {set.isWarmup ? `Aprox #${set.setNumber}` : `Set #${set.setNumber}`}
                            </button>
                          </div>

                          {/* Weight Stepper */}
                          <div className="col-span-4 sm:col-span-3 flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleUpdateSet(exIdx, setIdx, 'weight', Math.max(0, (set.weight || 0) - step))}
                              className="w-6 h-6 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded font-bold text-xs flex items-center justify-center"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              step={currentUnit === 'lbs' ? '1' : '0.5'}
                              value={set.weight}
                              onChange={(e) => handleUpdateSet(exIdx, setIdx, 'weight', parseFloat(e.target.value) || 0)}
                              className="w-14 bg-zinc-950 border border-zinc-700 text-center font-mono font-bold text-xs text-yellow-400 rounded py-1 focus:outline-none focus:border-yellow-500"
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateSet(exIdx, setIdx, 'weight', (set.weight || 0) + step)}
                              className="w-6 h-6 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded font-bold text-xs flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>

                          {/* Reps Stepper */}
                          <div className="col-span-3 sm:col-span-3 flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleUpdateSet(exIdx, setIdx, 'reps', Math.max(0, (set.reps || 0) - 1))}
                              className="w-6 h-6 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded font-bold text-xs flex items-center justify-center"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={set.reps}
                              onChange={(e) => handleUpdateSet(exIdx, setIdx, 'reps', parseInt(e.target.value, 10) || 0)}
                              className="w-12 bg-zinc-950 border border-zinc-700 text-center font-mono font-bold text-xs text-white rounded py-1 focus:outline-none focus:border-yellow-500"
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateSet(exIdx, setIdx, 'reps', (set.reps || 0) + 1)}
                              className="w-6 h-6 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded font-bold text-xs flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>

                          {/* RIR Input */}
                          <div className="col-span-1 sm:col-span-2 hidden sm:flex items-center justify-center">
                            <input
                              type="text"
                              value={set.rir !== undefined ? String(set.rir) : '1'}
                              onChange={(e) => handleUpdateSet(exIdx, setIdx, 'rir', e.target.value)}
                              placeholder="RIR"
                              className="w-12 bg-zinc-950 border border-zinc-700 text-center font-mono text-xs text-zinc-300 rounded py-1 focus:outline-none focus:border-yellow-500"
                            />
                          </div>

                          {/* Completed Toggle & Delete Set */}
                          <div className="col-span-3 sm:col-span-2 flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleUpdateSet(exIdx, setIdx, 'completed', !set.completed)}
                              className={`p-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition-all ${
                                set.completed
                                  ? 'bg-yellow-500 text-black'
                                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
                              }`}
                              title={set.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
                            >
                              <Check size={13} className={set.completed ? 'stroke-[3]' : ''} />
                            </button>

                            {ex.sets.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveSet(exIdx, setIdx)}
                                className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
                                title="Eliminar serie"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Set Action Buttons */}
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleAddSet(exIdx, false)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-yellow-400 text-xs font-bold flex items-center gap-1 transition-all"
                    >
                      <Plus size={13} />
                      <span>Agregar Serie Efectiva</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddSet(exIdx, true)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-emerald-400 text-xs font-bold flex items-center gap-1 transition-all"
                    >
                      <Plus size={13} />
                      <span>Agregar Aproximación</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sticky/Bottom Footer */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky bottom-0 shadow-2xl">
            <div className="flex items-center gap-4 text-xs font-mono">
              <div>
                <span className="text-zinc-400">Volumen Recalculado: </span>
                <span className="text-yellow-400 font-bold">{liveVolumeKg.toLocaleString()} kg</span>
                <span className="text-zinc-500 text-[10px] ml-1">({Math.round(liveVolumeKg * 2.20462).toLocaleString()} lbs)</span>
              </div>
              <span className="text-zinc-700">|</span>
              <div>
                <span className="text-zinc-400">Series: </span>
                <span className="text-white font-bold">{liveSetsCompleted}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-400 active:scale-95 text-black font-black text-xs rounded-xl shadow-lg shadow-yellow-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <Save size={14} />
                <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
