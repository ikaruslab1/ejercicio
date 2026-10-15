import React, { useState, useMemo } from 'react';
import { useWorkout, calculate1RM } from '../../context/WorkoutContext';
import { routineData, programWeeksList } from '../../data/routineData';
import { getLocalDateString } from '../../lib/dateUtils';
import { ExerciseVideoModal } from './ExerciseVideoModal';
import type { RoutineExercise, WeightUnit } from '../../types/workout';
import { 
  Check, 
  Plus, 
  Trash2, 
  Timer, 
  Trophy, 
  Minimize2, 
  Award, 
  Sparkles, 
  Video, 
  BookOpen, 
  FileText, 
  Calendar,
  Flame,
  X,
  ArrowRightLeft
} from 'lucide-react';

export const LiveWorkoutModal: React.FC = () => {
  const { 
    activeSession, 
    isLiveModalOpen, 
    setIsLiveModalOpen, 
    updateLiveSet, 
    addLiveSet, 
    removeLiveSet, 
    updateLiveExerciseNote,
    updateLiveExerciseUnit,
    finishLiveWorkout, 
    cancelLiveWorkout,
    personalRecords, 
    workoutHistory,
    startRestTimer,
    restTimer
  } = useWorkout();

  const [sessionNotes, setSessionNotes] = useState('');
  const [sessionRating, setSessionRating] = useState(5);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [showPrevNotesModal, setShowPrevNotesModal] = useState(false);
  const [exerciseNotesAtFinish, setExerciseNotesAtFinish] = useState<Record<string, string>>({});
  const [finishDate, setFinishDate] = useState<string>('');
  const [finishDayId, setFinishDayId] = useState<string>('');
  const [videoModalExercise, setVideoModalExercise] = useState<RoutineExercise | null>(null);
  const [convertPrompt, setConvertPrompt] = useState<{ exerciseId: string; fromUnit: WeightUnit; toUnit: WeightUnit } | null>(null);

  const handleUnitChange = (exerciseId: string, targetUnit: WeightUnit) => {
    const exLog = activeSession?.exercises.find(e => e.exerciseId === exerciseId);
    if (!exLog) return;
    const currentUnit: WeightUnit = exLog.weightUnit || 'kg';
    if (currentUnit === targetUnit) return;

    const hasWeights = exLog.sets.some(s => s.weight > 0);
    // Cambiar inmediatamente la unidad manteniendo valores por defecto para rapidez
    updateLiveExerciseUnit(exerciseId, targetUnit, false);

    if (hasWeights) {
      setConvertPrompt({ exerciseId, fromUnit: currentUnit, toUnit: targetUnit });
      setTimeout(() => {
        setConvertPrompt(prev => (prev?.exerciseId === exerciseId ? null : prev));
      }, 7000);
    }
  };

  const currentRoutine = activeSession ? routineData[activeSession.dayId] : null;

  // Find previous session for this routine day from database history (MUST be called before any return)
  const previousSession = useMemo(() => {
    if (!activeSession) return null;
    return (
      workoutHistory
        .filter(s => s.dayId === activeSession.dayId || s.dayKey === currentRoutine?.dayKey)
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())[0] || null
    );
  }, [activeSession?.dayId, currentRoutine?.dayKey, workoutHistory]);

  const previousGeneralNote = previousSession?.notes?.trim();
  const previousExercisesWithNotes = useMemo(() => {
    if (!previousSession?.exercises) return [];
    return previousSession.exercises.filter(e => e.notes && e.notes.trim().length > 0);
  }, [previousSession]);

  const hasAnyPreviousNotes = Boolean(
    (previousGeneralNote && previousGeneralNote.length > 0) ||
    previousExercisesWithNotes.length > 0
  );

  // All Hooks have been called. Safe to exit early if modal is not active.
  if (!isLiveModalOpen || !activeSession) return null;

  // Calculate live statistics
  let totalVolumeKg = 0;
  let totalSetsCompleted = 0;
  let totalTargetSets = 0;

  activeSession.exercises.forEach(ex => {
    const exerciseUnit: WeightUnit = ex.weightUnit || 'kg';
    ex.sets.forEach(s => {
      totalTargetSets += 1;
      if (s.completed) {
        totalSetsCompleted += 1;
        if (s.weight > 0 && s.reps > 0) {
          const setUnit: WeightUnit = s.weightUnit || exerciseUnit;
          const weightKg = setUnit === 'lbs' ? s.weight * 0.45359237 : s.weight;
          totalVolumeKg += Math.round(weightKg * s.reps);
        }
      }
    });
  });

  const progressPercent = totalTargetSets > 0 ? (totalSetsCompleted / totalTargetSets) * 100 : 0;

  const formatElapsed = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOpenFinishConfirm = () => {
    const notesMap: Record<string, string> = {};
    activeSession.exercises.forEach(ex => {
      notesMap[ex.exerciseId] = ex.notes || '';
    });
    setExerciseNotesAtFinish(notesMap);
    setFinishDayId(activeSession.dayId);
    setFinishDate(getLocalDateString(activeSession.startTime || new Date()));
    setShowFinishConfirm(true);
  };

  const handleFinish = () => {
    finishLiveWorkout(sessionNotes, sessionRating, exerciseNotesAtFinish, finishDate, finishDayId);
    setShowFinishConfirm(false);
    setSessionNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between overflow-hidden">
      {/* Top Header Bar */}
      <div className="bg-zinc-950 border-b border-zinc-800 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLiveModalOpen(false)}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800"
            title="Minimizar (el entreno continuará en segundo plano)"
          >
            <Minimize2 size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-base sm:text-lg font-black text-white">
                {currentRoutine?.title || 'Entrenamiento en Vivo'}
              </h2>
            </div>
            <p className="text-xs font-mono text-yellow-400">
              Tiempo: {formatElapsed(activeSession.elapsedSeconds)} · {currentRoutine?.phase}
            </p>
          </div>
        </div>

        {/* Live Metrics & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {hasAnyPreviousNotes && (
            <button
              type="button"
              onClick={() => setShowPrevNotesModal(true)}
              className="px-2.5 sm:px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 active:scale-95 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
              title="Ver notas de la sesión anterior"
            >
              <BookOpen size={14} className="text-amber-400" />
              <span className="hidden sm:inline">Notas Previas</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-3 bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800 text-xs font-mono">
            <div>
              <span className="text-zinc-400">Volumen: </span>
              <span className="text-yellow-400 font-bold">{totalVolumeKg.toLocaleString()} kg</span>
              <span className="text-zinc-500 text-[10px] ml-1">({Math.round(totalVolumeKg * 2.20462).toLocaleString()} lbs)</span>
            </div>
            <span className="text-zinc-700">|</span>
            <div>
              <span className="text-zinc-400">Series: </span>
              <span className="text-white font-bold">{totalSetsCompleted}</span>
              <span className="text-zinc-500">/{totalTargetSets}</span>
            </div>
          </div>

          <button
            onClick={handleOpenFinishConfirm}
            className="px-3 sm:px-5 py-2 bg-yellow-500 hover:bg-yellow-400 active:scale-95 text-black font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-yellow-500/20 flex items-center gap-1.5 transition-all"
          >
            <Award size={16} />
            <span>Finalizar</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-zinc-900 h-1">
        <div 
          className="bg-gradient-to-r from-yellow-500 to-amber-400 h-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Scrollable Workout Body */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-6 max-w-4xl w-full mx-auto">
        {/* Quick Rest Timer Controller inside modal */}
        <div className="bg-zinc-900/90 border border-zinc-800 p-3 sm:p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-yellow-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">Temporizador de Descanso Automático:</span>
            <span className="font-mono font-bold text-yellow-400 text-sm">
              {restTimer.remainingSeconds > 0 ? `${restTimer.remainingSeconds}s` : 'Listo'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {[45, 60, 90, 120, 150, 180, 240].map(secs => (
              <button
                key={secs}
                onClick={() => startRestTimer(secs)}
                className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition-all ${
                  restTimer.remainingSeconds === secs && restTimer.isRunning
                    ? 'bg-yellow-500 text-black shadow-sm'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                }`}
              >
                {secs}s
              </button>
            ))}
          </div>
        </div>

        {/* Exercises List */}
        {activeSession.exercises.map((exLog, exIdx) => {
          const exerciseDef = currentRoutine?.exercises.find(e => e.exerciseId === exLog.exerciseId || e.id === exLog.exerciseId);
          const currentPR = personalRecords[exLog.exerciseId];
          const restSecs = exerciseDef?.restSeconds || 90;
          const currentUnit: WeightUnit = exLog.weightUnit || exerciseDef?.weightUnit || 'kg';
          const weightStep = currentUnit === 'lbs' ? 5 : 2.5;

          return (
            <div 
              key={exLog.exerciseId}
              className="bg-zinc-900 border border-zinc-800/90 rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg shadow-black/40"
            >
              {/* Exercise Header */}
              <div className="flex items-start justify-between gap-2 border-b border-zinc-800/80 pb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-mono font-bold bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded border border-yellow-500/30">
                      Ejercicio #{exIdx + 1}
                    </span>
                    <span className="text-xs font-mono text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded">
                      {exerciseDef?.muscleGroup || exLog.muscleGroup || 'General'}
                    </span>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                      Aproximación: {exerciseDef?.warmupSets || '1-2'} sets
                    </span>
                    {exerciseDef?.intensityTechnique && exerciseDef.intensityTechnique !== 'N/A' && (
                      <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                        ⚡ {exerciseDef.intensityTechnique}
                      </span>
                    )}
                  </div>

                  {/* Exercise Name as Button for Video */}
                  <button
                    type="button"
                    onClick={() => exerciseDef && setVideoModalExercise(exerciseDef)}
                    className="text-left group flex items-center gap-2"
                    title="Ver video tutorial y técnica de este ejercicio"
                  >
                    <h3 className="text-base sm:text-lg font-black text-white group-hover:text-yellow-400 transition-colors capitalize-first">
                      {exLog.exerciseName}
                    </h3>
                    <span className="p-1 rounded-lg bg-zinc-800 group-hover:bg-yellow-500 group-hover:text-black text-yellow-400 text-xs transition-all">
                      <Video size={14} />
                    </span>
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* PR / Top Badge */}
                  {currentPR && currentPR.maxWeight > 0 && (
                    <div className="text-right bg-zinc-950 px-2.5 py-1 rounded-xl border border-yellow-500/30 text-xs">
                      <p className="text-[10px] text-zinc-400 font-bold uppercase">Tu Top</p>
                      <p className="font-mono font-bold text-yellow-400">
                        {currentPR.maxWeight} {currentPR.weightUnit || 'kg'} <span className="text-zinc-400 text-[10px]">x{currentPR.repsAtMaxWeight}</span>
                      </p>
                    </div>
                  )}

                  {/* Weight Unit Switcher: KG | LBS */}
                  <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 shadow-inner">
                    <button
                      type="button"
                      onClick={() => handleUnitChange(exLog.exerciseId, 'kg')}
                      className={`px-2.5 py-1 text-xs font-mono font-black rounded-lg transition-all ${
                        currentUnit === 'kg'
                          ? 'bg-yellow-500 text-black shadow-md shadow-yellow-500/20'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                      title="Registrar máquina/barra en Kilogramos (kg)"
                    >
                      KG
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUnitChange(exLog.exerciseId, 'lbs')}
                      className={`px-2.5 py-1 text-xs font-mono font-black rounded-lg transition-all ${
                        currentUnit === 'lbs'
                          ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                      title="Registrar máquina/polea en Libras (lbs)"
                    >
                      LBS
                    </button>
                  </div>
                </div>
              </div>

              {/* Optional Inline Conversion Banner */}
              {convertPrompt && convertPrompt.exerciseId === exLog.exerciseId && (
                <div className="bg-amber-500/15 border border-amber-500/40 rounded-xl px-3 py-2 flex items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 min-w-0">
                    <ArrowRightLeft size={14} className="text-amber-400 shrink-0" />
                    <span className="text-amber-200 text-xs truncate">
                      Cambiado a <strong>{convertPrompt.toUnit.toUpperCase()}</strong>. ¿Deseas convertir las cargas numéricas ({convertPrompt.fromUnit} ➔ {convertPrompt.toUnit})?
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        updateLiveExerciseUnit(exLog.exerciseId, convertPrompt.toUnit, true);
                        setConvertPrompt(null);
                      }}
                      className="px-2.5 py-1 bg-yellow-500 hover:bg-yellow-400 text-black font-black rounded-lg text-xs active:scale-95 transition-all shadow"
                    >
                      Convertir
                    </button>
                    <button
                      type="button"
                      onClick={() => setConvertPrompt(null)}
                      className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-lg text-xs"
                    >
                      Mantener
                    </button>
                  </div>
                </div>
              )}

              {/* Previous Session Note for this Exercise */}
              {(() => {
                const prevExLog = previousSession?.exercises?.find(e => e.exerciseId === exLog.exerciseId);
                const prevExNote = prevExLog?.notes?.trim();
                if (!prevExNote) return null;
                return (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 flex items-start gap-2.5">
                    <FileText className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
                        Nota de tu sesión previa:
                      </span>
                      <p className="text-xs text-zinc-200 mt-0.5 italic">
                        "{prevExNote}"
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Technical Note in Spanish */}
              {exerciseDef && (
                <p className="text-xs text-zinc-300 italic bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-800/50">
                  💡 <strong className="text-yellow-400 not-italic font-semibold">Técnica: </strong>
                  {exerciseDef.note}
                </p>
              )}

              {/* Sets Table */}
              <div className="space-y-2.5">
                <div className="grid grid-cols-12 gap-2 text-[11px] font-mono text-zinc-400 font-bold uppercase px-2">
                  <div className="col-span-2 sm:col-span-2 text-center">Tipo / Set</div>
                  <div className="col-span-4 sm:col-span-3 text-center">Carga ({currentUnit})</div>
                  <div className="col-span-3 sm:col-span-3 text-center">Reps</div>
                  <div className="col-span-1 sm:col-span-2 text-center hidden sm:block">RIR Objetivo</div>
                  <div className="col-span-3 sm:col-span-2 text-center">Listo</div>
                </div>

                {exLog.sets.map((set, setIdx) => {
                  const set1RM = calculate1RM(set.weight, set.reps);
                  const isNewEstimatedPR = currentPR && set1RM > currentPR.estimated1RM && set.completed && !set.isWarmup;

                  // Target RIR label according to CSV
                  let targetRirLabel = 'N/A';
                  if (!set.isWarmup) {
                    if (set.setNumber === 1) targetRirLabel = exerciseDef?.targetRir1 || '1';
                    else if (set.setNumber === 2) targetRirLabel = exerciseDef?.targetRir2 || '0';
                    else targetRirLabel = '0';
                  }

                  const repPlaceholder = exerciseDef?.repRange || '6-8';

                  return (
                    <div 
                      key={setIdx}
                      className={`grid grid-cols-12 gap-2 items-center p-2 rounded-xl border transition-all ${
                        set.completed 
                          ? 'bg-yellow-500/10 border-yellow-500/40' 
                          : set.isWarmup 
                            ? 'bg-zinc-950/80 border-emerald-500/30' 
                            : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {/* Set Number / Warmup Badge */}
                      <div className="col-span-2 sm:col-span-2 text-center">
                        {set.isWarmup ? (
                          <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Aprox #{set.setNumber}
                          </span>
                        ) : (
                          <span className="font-mono font-bold text-sm text-zinc-200">
                            Set #{set.setNumber}
                          </span>
                        )}
                      </div>

                      {/* Weight Stepper */}
                      <div className="col-span-4 sm:col-span-3 flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => updateLiveSet(exLog.exerciseId, setIdx, Math.max(0, set.weight - weightStep), set.reps, set.rir)}
                          className="w-6 sm:w-7 h-7 bg-zinc-800 hover:bg-zinc-700 active:scale-90 text-zinc-300 rounded-lg font-bold text-xs flex items-center justify-center shrink-0"
                          title={`-${weightStep} ${currentUnit}`}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          step={currentUnit === 'lbs' ? "1" : "0.5"}
                          placeholder="0"
                          value={set.weight === 0 && !set.completed ? '' : set.weight}
                          onChange={(e) => updateLiveSet(exLog.exerciseId, setIdx, parseFloat(e.target.value) || 0, set.reps, set.rir)}
                          className="w-14 sm:w-18 bg-zinc-900 border border-zinc-700 text-center font-mono font-bold text-sm text-yellow-400 rounded-lg py-1 focus:outline-none focus:border-yellow-500"
                        />
                        <button
                          type="button"
                          onClick={() => updateLiveSet(exLog.exerciseId, setIdx, set.weight + weightStep, set.reps, set.rir)}
                          className="w-6 sm:w-7 h-7 bg-zinc-800 hover:bg-zinc-700 active:scale-90 text-zinc-300 rounded-lg font-bold text-xs flex items-center justify-center shrink-0"
                          title={`+${weightStep} ${currentUnit}`}
                        >
                          +
                        </button>
                      </div>

                      {/* Reps Stepper (With repRange as PLACEHOLDER, NOT hardcoded value) */}
                      <div className="col-span-3 sm:col-span-3 flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => updateLiveSet(exLog.exerciseId, setIdx, set.weight, Math.max(0, set.reps - 1), set.rir)}
                          className="w-6 sm:w-7 h-7 bg-zinc-800 hover:bg-zinc-700 active:scale-90 text-zinc-300 rounded-lg font-bold text-xs flex items-center justify-center shrink-0"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          placeholder={repPlaceholder}
                          value={set.reps === 0 && !set.completed ? '' : set.reps}
                          onChange={(e) => updateLiveSet(exLog.exerciseId, setIdx, set.weight, parseInt(e.target.value) || 0, set.rir)}
                          className="w-12 sm:w-16 bg-zinc-900 border border-zinc-700 text-center font-mono font-bold text-sm text-white rounded-lg py-1 focus:outline-none focus:border-yellow-500"
                        />
                        <button
                          type="button"
                          onClick={() => updateLiveSet(exLog.exerciseId, setIdx, set.weight, set.reps + 1, set.rir)}
                          className="w-6 sm:w-7 h-7 bg-zinc-800 hover:bg-zinc-700 active:scale-90 text-zinc-300 rounded-lg font-bold text-xs flex items-center justify-center shrink-0"
                        >
                          +
                        </button>
                      </div>

                      {/* Non-editable RIR badge */}
                      <div className="col-span-1 sm:col-span-2 hidden sm:flex items-center justify-center">
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                          targetRirLabel === '0'
                            ? 'bg-red-500/20 text-red-400 border-red-500/30'
                            : targetRirLabel === '1'
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                              : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                        }`}>
                          RIR: {targetRirLabel}
                        </span>
                      </div>

                      {/* Complete Checkbox Button (triggers automatic rest timer on completion) */}
                      <div className="col-span-3 sm:col-span-2 flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const willComplete = !set.completed;
                            updateLiveSet(exLog.exerciseId, setIdx, set.weight, set.reps, set.rir, willComplete);
                            if (willComplete) {
                              startRestTimer(restSecs, exLog.exerciseName);
                            }
                          }}
                          className={`w-full py-1.5 rounded-xl font-bold flex items-center justify-center gap-1 text-xs transition-all active:scale-95 ${
                            set.completed
                              ? 'bg-yellow-500 text-black shadow-md shadow-yellow-500/20'
                              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                          }`}
                        >
                          <Check size={14} className={set.completed ? 'stroke-[3]' : ''} />
                          <span className="hidden sm:inline">{set.completed ? 'Listo' : 'Marcar'}</span>
                        </button>

                        {exLog.sets.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLiveSet(exLog.exerciseId, setIdx)}
                            className="text-zinc-600 hover:text-red-400 p-1 transition-colors"
                            title="Eliminar serie"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>

                      {/* PR Alert Banner */}
                      {isNewEstimatedPR && (
                        <div className="col-span-12 bg-yellow-500/20 border border-yellow-500/40 rounded-lg px-2 py-1 text-center text-xs font-bold text-yellow-400 flex items-center justify-center gap-1 animate-pulse">
                          <Trophy size={13} />
                          <span>¡Nuevo récord estimado! (1RM: ~{set1RM} {currentUnit})</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons to Add Working Set or Warmup Set */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => addLiveSet(exLog.exerciseId, false)}
                  className="py-2 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 text-xs font-bold rounded-xl border border-dashed border-zinc-700/80 hover:border-yellow-500/50 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus size={14} className="text-yellow-400" />
                  <span>+ Serie Efectiva</span>
                </button>

                <button
                  type="button"
                  onClick={() => addLiveSet(exLog.exerciseId, true)}
                  className="py-2 bg-zinc-950 hover:bg-zinc-800 text-emerald-400 text-xs font-bold rounded-xl border border-dashed border-emerald-500/30 hover:border-emerald-500/60 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus size={14} />
                  <span>+ Aproximación</span>
                </button>
              </div>

              {/* Exercise User Note Input */}
              <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80 space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText size={13} className="text-yellow-400" />
                  <span>Nota de este ejercicio (se conservará en historial y base de datos):</span>
                </label>
                <input
                  type="text"
                  value={exLog.notes || ''}
                  onChange={(e) => updateLiveExerciseNote(exLog.exerciseId, e.target.value)}
                  placeholder="P. ej. Subir 2.5kg próxima semana, asiento en posición 3..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-yellow-500 transition-colors"
                />
              </div>
            </div>
          );
        })}

        {/* Discard Workout */}
        <div className="pt-4 text-center">
          <button
            onClick={cancelLiveWorkout}
            className="text-xs text-red-400/80 hover:text-red-400 underline underline-offset-4"
          >
            Descartar sesión actual y salir
          </button>
        </div>
      </div>

      {/* Confirmation Modal to Finish Workout */}
      {showFinishConfirm && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-yellow-500/40 rounded-3xl p-5 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-yellow-500/20 text-yellow-400 rounded-2xl flex items-center justify-center mx-auto border border-yellow-500/30">
                <Sparkles size={28} />
              </div>
              <h3 className="text-xl font-black text-white">¡Gran Sesión de Entrenamiento!</h3>
              <p className="text-xs text-zinc-400">
                Has completado {totalSetsCompleted} series con un volumen de {totalVolumeKg.toLocaleString()} kg en {formatElapsed(activeSession.elapsedSeconds)}.
              </p>
            </div>

            {/* Date and Routine Day Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar size={14} className="text-yellow-400" />
                  <span>Fecha de Entrenamiento:</span>
                </label>
                <input
                  type="date"
                  value={finishDate}
                  onChange={(e) => setFinishDate(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-yellow-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame size={14} className="text-yellow-400" />
                  <span>Día de Rutina:</span>
                </label>
                <select
                  value={finishDayId}
                  onChange={(e) => setFinishDayId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500 font-mono"
                >
                  {programWeeksList.flatMap(w => [
                    { id: `w${w.weekNumber}_d1`, label: `Sem ${w.weekNumber} · Día 1: Upper 1` },
                    { id: `w${w.weekNumber}_d2`, label: `Sem ${w.weekNumber} · Día 2: Lower 1` },
                    { id: `w${w.weekNumber}_d3`, label: `Sem ${w.weekNumber} · Día 3: Upper 2` },
                    { id: `w${w.weekNumber}_d4`, label: `Sem ${w.weekNumber} · Día 4: Lower 2` },
                    { id: `w${w.weekNumber}_d5`, label: `Sem ${w.weekNumber} · Día 5: Arms & Delts` },
                  ]).map(opt => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Rating */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block text-center">
                ¿Cómo te sentiste hoy?
              </label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSessionRating(star)}
                    className={`text-2xl transition-transform active:scale-125 ${
                      star <= sessionRating ? 'text-yellow-400 scale-110' : 'text-zinc-700'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* Exercise Notes Review/Edit at Finish */}
            <div className="space-y-2 text-left">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={14} className="text-yellow-400" />
                <span>Notas por Ejercicio (Opcional):</span>
              </label>
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1 border border-zinc-800/80 rounded-2xl p-2.5 bg-zinc-950/60">
                {activeSession.exercises.map((ex) => (
                  <div key={ex.exerciseId} className="space-y-1 bg-zinc-900/90 p-2.5 rounded-xl border border-zinc-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white truncate mr-2">{ex.exerciseName}</span>
                      <span className="text-[10px] font-mono text-zinc-500 shrink-0">{ex.muscleGroup || ''}</span>
                    </div>
                    <input
                      type="text"
                      value={exerciseNotesAtFinish[ex.exerciseId] || ''}
                      onChange={(e) => setExerciseNotesAtFinish(prev => ({
                        ...prev,
                        [ex.exerciseId]: e.target.value
                      }))}
                      placeholder="Nota para este ejercicio..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-yellow-500 transition-colors"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* General Session Notes */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Notas Generales de la Sesión:
              </label>
              <textarea
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="Sensaciones generales, fatiga, RIR percibido, ajustes..."
                rows={2}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-yellow-500"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowFinishConfirm(false)}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl"
              >
                Continuar Entrenando
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="flex-1 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-black rounded-xl shadow-lg shadow-yellow-500/20"
              >
                Guardar y Finalizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Previous Session Notes Reference Modal */}
      {showPrevNotesModal && previousSession && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-amber-500/40 rounded-3xl p-5 sm:p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Notas de la Sesión Anterior</h3>
                  <p className="text-xs text-zinc-400 font-mono">
                    {previousSession.dayTitle} · {new Date(previousSession.startTime).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPrevNotesModal(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5 pt-1">
              {previousGeneralNote && (
                <div className="bg-zinc-950/80 p-3.5 rounded-2xl border border-zinc-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-400 flex items-center gap-1.5">
                    <FileText size={12} /> Nota General de la Sesión
                  </span>
                  <p className="text-xs text-zinc-200 leading-relaxed italic">
                    "{previousGeneralNote}"
                  </p>
                </div>
              )}

              {previousExercisesWithNotes.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Notas por Ejercicio de la Sesión Anterior:
                  </span>
                  {previousExercisesWithNotes.map(prevEx => (
                    <div key={prevEx.exerciseId} className="bg-zinc-950/80 p-3 rounded-2xl border border-zinc-800 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white">{prevEx.exerciseName}</span>
                      </div>
                      <p className="text-xs text-amber-300/90 italic">
                        "{prevEx.notes}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowPrevNotesModal(false)}
              className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Video Modal */}
      <ExerciseVideoModal
        exercise={videoModalExercise}
        isOpen={videoModalExercise !== null}
        onClose={() => setVideoModalExercise(null)}
      />
    </div>
  );
};
