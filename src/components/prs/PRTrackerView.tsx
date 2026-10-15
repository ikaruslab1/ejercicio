import React, { useState, useMemo } from 'react';
import { useWorkout, calculate1RM } from '../../context/WorkoutContext';
import { getLocalDateString } from '../../lib/dateUtils';
import type { MuscleGroup, WeightUnit } from '../../types/workout';
import { routineData } from '../../data/routineData';
import { PRChart } from './PRChart';
import { 
  Trophy, 
  Plus, 
  Calculator, 
  Calendar, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  X,
  Flame
} from 'lucide-react';


export const PRTrackerView: React.FC = () => {
  const { personalRecords, recordPR, deletePR } = useWorkout();

  const [selectedMuscle, setSelectedMuscle] = useState<string>('Todos');
  const [expandedPRId, setExpandedPRId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state for new PR
  const [newExerciseId, setNewExerciseId] = useState('');
  const [newCustomName, setNewCustomName] = useState('');
  const [newMuscleGroup, setNewMuscleGroup] = useState<MuscleGroup>('Pectorales');
  const [newWeight, setNewWeight] = useState<number>(60);
  const [newWeightUnit, setNewWeightUnit] = useState<WeightUnit>('kg');
  const [newReps, setNewReps] = useState<number>(8);
  const [newDate, setNewDate] = useState<string>(() => getLocalDateString());

  // 1RM Quick Calculator State
  const [calcWeight, setCalcWeight] = useState<number>(80);
  const [calcReps, setCalcReps] = useState<number>(5);

  const calculatedCalc1RM = calculate1RM(calcWeight, calcReps);

  const muscleGroups: string[] = ['Todos', 'Pectorales', 'Espalda', 'Hombros', 'Piernas', 'Brazos'];

  // Deduplicated unique exercises across the Min-Max program
  const allRoutineExercises = useMemo(() => {
    const map = new Map<string, typeof routineData['w1_d1']['exercises'][0]>();
    Object.values(routineData).forEach(d => {
      d.exercises.forEach(ex => {
        const key = ex.exerciseId || ex.name;
        if (!map.has(key)) {
          map.set(key, ex);
        }
      });
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const prList = Object.values(personalRecords).filter(pr => {
    if (selectedMuscle === 'Todos') return true;
    return pr.muscleGroup === selectedMuscle;
  });

  // Calculate summary stats
  const totalPRCount = Object.keys(personalRecords).length;
  const highest1RM = Object.values(personalRecords).reduce((max, pr) => Math.max(max, pr.estimated1RM), 0);

  const handleCreatePR = (e: React.FormEvent) => {
    e.preventDefault();
    let exerciseId = newExerciseId;
    let exerciseName = newCustomName;
    let muscleGroup = newMuscleGroup;

    if (newExerciseId && newExerciseId !== 'custom') {
      const found = allRoutineExercises.find(ex => ex.id === newExerciseId);
      if (found) {
        exerciseName = found.name;
        muscleGroup = found.muscleGroup;
      }
    } else {
      exerciseId = `custom_${Date.now()}`;
    }

    if (!exerciseName) return;

    recordPR(exerciseId, exerciseName, muscleGroup, newWeight, newReps, newDate, newWeightUnit);
    setIsAddModalOpen(false);
    setNewCustomName('');
    setNewExerciseId('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-zinc-950 border border-yellow-500/30 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-yellow-500 text-black rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-yellow-500/20">
                <Trophy size={13} /> Récords Personales (PRs)
              </span>
              <span className="text-xs font-mono text-zinc-400">Sobrecarga Progresiva</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Tops & Progresión de Fuerza
            </h1>
            <p className="text-sm text-zinc-300">
              Registra tus cargas máximas, repeticiones efectivas y evolución de 1RM por ejercicio y grupo muscular.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="py-3.5 px-6 bg-yellow-500 hover:bg-yellow-400 active:scale-95 text-black font-black text-sm rounded-2xl shadow-xl shadow-yellow-500/20 flex items-center justify-center gap-2 transition-all shrink-0"
          >
            <Plus size={18} />
            <span>Registrar Nuevo Top</span>
          </button>
        </div>

        {/* Highlight Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-yellow-500/20">
          <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
            <p className="text-[10px] text-zinc-400 font-bold uppercase">Ejercicios Monitoreados</p>
            <p className="text-xl sm:text-2xl font-black text-white font-mono">{totalPRCount}</p>
          </div>
          <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
            <p className="text-[10px] text-zinc-400 font-bold uppercase">Máximo 1RM Registrado</p>
            <p className="text-xl sm:text-2xl font-black text-yellow-400 font-mono">~{highest1RM} kg</p>
          </div>
          <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800 col-span-2 sm:col-span-1">
            <p className="text-[10px] text-zinc-400 font-bold uppercase">Principio Hipertrofia</p>
            <p className="text-xs text-zinc-300 font-medium mt-1">Tensión mecánica continua en RIR 1-2.</p>
          </div>
        </div>
      </div>

      {/* 1RM Interactive Calculator Widget */}
      <div className="bg-zinc-900/90 border border-zinc-800/90 rounded-3xl p-5 sm:p-7 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            <Calculator size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Calculadora Instantánea de 1RM & Porcentajes</h2>
            <p className="text-xs text-zinc-400">Estimación basada en la fórmula de Epley (Sobrecarga de hipertrofia)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Inputs */}
          <div className="md:col-span-5 grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1.5">
                Peso (kg)
              </label>
              <input
                type="number"
                value={calcWeight}
                onChange={(e) => setCalcWeight(parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-950 border border-zinc-700 text-center font-mono font-bold text-xl text-yellow-400 rounded-xl py-2.5 focus:outline-none focus:border-yellow-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1.5">
                Repeticiones
              </label>
              <input
                type="number"
                value={calcReps}
                onChange={(e) => setCalcReps(parseInt(e.target.value) || 1)}
                className="w-full bg-zinc-950 border border-zinc-700 text-center font-mono font-bold text-xl text-white rounded-xl py-2.5 focus:outline-none focus:border-yellow-500"
              />
            </div>
          </div>

          {/* 1RM Result Badge */}
          <div className="md:col-span-3 bg-zinc-950 border border-yellow-500/30 p-4 rounded-2xl text-center">
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">1RM Estimado</p>
            <p className="text-3xl font-black font-mono text-yellow-400 my-1">
              ~{calculatedCalc1RM} <span className="text-sm font-normal text-zinc-400">kg</span>
            </p>
            <p className="text-[10px] text-zinc-500">100% de fuerza máxima teórica</p>
          </div>

          {/* Percentages Breakdown */}
          <div className="md:col-span-4 grid grid-cols-3 gap-2">
            {[
              { pct: 95, reps: '2 reps' },
              { pct: 90, reps: '4 reps' },
              { pct: 85, reps: '6 reps' },
              { pct: 80, reps: '8 reps' },
              { pct: 75, reps: '10 reps' },
              { pct: 70, reps: '12 reps' }
            ].map(item => (
              <div key={item.pct} className="bg-zinc-950/70 p-2 rounded-xl border border-zinc-800 text-center">
                <p className="text-[10px] font-mono text-zinc-400">{item.pct}% ({item.reps})</p>
                <p className="font-mono font-bold text-xs text-zinc-200">
                  {Math.round(calculatedCalc1RM * (item.pct / 100) * 10) / 10} kg
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Muscle Group Filter Tabs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
            <Flame className="w-5 h-5 text-yellow-400" />
            <span>Marcas Registradas por Ejercicio</span>
          </h2>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {muscleGroups.map(group => (
            <button
              key={group}
              onClick={() => setSelectedMuscle(group)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedMuscle === group
                  ? 'bg-yellow-500 text-black shadow-md shadow-yellow-500/20'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {group}
            </button>
          ))}
        </div>
      </div>

      {/* PR Cards Grid */}
      {prList.length === 0 ? (
        <div className="text-center py-12 bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-800">
          <Trophy className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-zinc-400">No hay marcas registradas para {selectedMuscle}.</p>
          <p className="text-xs text-zinc-600 mt-1">Haz clic en "Registrar Nuevo Top" para guardar tu primera marca.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {prList.map((pr) => {
            const isExpanded = expandedPRId === pr.exerciseId;

            return (
              <div 
                key={pr.exerciseId}
                className="bg-zinc-900/90 border border-zinc-800/90 rounded-3xl p-5 space-y-4 shadow-xl hover:border-zinc-700 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                      {pr.muscleGroup}
                    </span>
                    <h3 className="text-lg font-black text-white mt-1.5 capitalize-first">
                      {pr.exerciseName}
                    </h3>
                  </div>

                  <button
                    onClick={() => deletePR(pr.exerciseId)}
                    className="p-1.5 text-zinc-600 hover:text-red-400 rounded-lg transition-colors"
                    title="Eliminar marca"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Metric Badges */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800/80 text-center">
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">Carga Máx</p>
                    <p className="font-mono font-black text-lg text-yellow-400">
                      {pr.maxWeight} {pr.weightUnit || 'kg'}
                    </p>
                  </div>

                  <div className="bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800/80 text-center">
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">Reps</p>
                    <p className="font-mono font-black text-lg text-white">{pr.repsAtMaxWeight}</p>
                  </div>

                  <div className="bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800/80 text-center">
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">1RM Est.</p>
                    <p className="font-mono font-black text-lg text-blue-400">
                      ~{pr.estimated1RM} {pr.weightUnit || 'kg'}
                    </p>
                  </div>
                </div>

                {/* Achieved Date & Progression Toggle */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="flex items-center gap-1.5 text-zinc-400 font-mono">
                    <Calendar size={13} />
                    <span>Fecha: {pr.achievedDate}</span>
                  </div>

                  <button
                    onClick={() => setExpandedPRId(isExpanded ? null : pr.exerciseId)}
                    className="flex items-center gap-1 text-yellow-400 hover:text-yellow-300 font-bold text-xs"
                  >
                    <span>{isExpanded ? 'Ocultar Gráfica' : 'Ver Progresión'}</span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>

                {/* Expandable Chart */}
                {isExpanded && (
                  <div className="pt-3 border-t border-zinc-800 animate-in fade-in duration-200">
                    <p className="text-[11px] font-bold text-zinc-400 uppercase mb-1">
                      Historial de Cargas y 1RM
                    </p>
                    <PRChart pr={pr} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Top / PR Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-yellow-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center border border-yellow-500/30">
                  <Trophy size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Registrar Nuevo Top</h3>
                  <p className="text-xs text-zinc-400">Guarda una nueva marca personal</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreatePR} className="space-y-4 pt-2">
              {/* Select from Routine or Custom */}
              <div>
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                  Seleccionar Ejercicio de tu Rutina
                </label>
                <select
                  value={newExerciseId}
                  onChange={(e) => setNewExerciseId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs rounded-xl p-2.5 focus:outline-none focus:border-yellow-500"
                >
                  <option value="">-- Elige un ejercicio o crea uno manual --</option>
                  {allRoutineExercises.map(ex => (
                    <option key={ex.exerciseId || ex.id} value={ex.exerciseId || ex.id}>
                      {ex.name} ({ex.muscleGroup})
                    </option>
                  ))}
                  <option value="custom">+ Ejercicio Personalizado / No listado</option>
                </select>
              </div>

              {/* Custom Exercise Name & Muscle Group if chosen */}
              {(!newExerciseId || newExerciseId === 'custom') && (
                <div className="space-y-3 bg-zinc-950/70 p-3 rounded-2xl border border-zinc-800">
                  <div>
                    <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                      Nombre del Ejercicio
                    </label>
                    <input
                      type="text"
                      value={newCustomName}
                      onChange={(e) => setNewCustomName(e.target.value)}
                      placeholder="Ej. Press Banca Plano con Barra"
                      className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs rounded-xl p-2.5 focus:outline-none focus:border-yellow-500"
                      required={!newExerciseId || newExerciseId === 'custom'}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                      Grupo Muscular
                    </label>
                    <select
                      value={newMuscleGroup}
                      onChange={(e) => setNewMuscleGroup(e.target.value as MuscleGroup)}
                      className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs rounded-xl p-2.5 focus:outline-none focus:border-yellow-500"
                    >
                      <option value="Pectorales">Pectorales</option>
                      <option value="Espalda">Espalda</option>
                      <option value="Hombros">Hombros</option>
                      <option value="Piernas">Piernas</option>
                      <option value="Brazos">Brazos</option>
                      <option value="Abdomen">Abdomen</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Weight and Reps */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                      Peso ({newWeightUnit})
                    </label>
                    <div className="flex items-center bg-zinc-950 p-0.5 rounded-lg border border-zinc-800 text-[10px] font-mono">
                      <button
                        type="button"
                        onClick={() => setNewWeightUnit('kg')}
                        className={`px-1.5 py-0.5 rounded font-bold ${newWeightUnit === 'kg' ? 'bg-yellow-500 text-black' : 'text-zinc-400'}`}
                      >
                        KG
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewWeightUnit('lbs')}
                        className={`px-1.5 py-0.5 rounded font-bold ${newWeightUnit === 'lbs' ? 'bg-amber-400 text-black' : 'text-zinc-400'}`}
                      >
                        LBS
                      </button>
                    </div>
                  </div>
                  <input
                    type="number"
                    step={newWeightUnit === 'lbs' ? "1" : "0.5"}
                    value={newWeight}
                    onChange={(e) => setNewWeight(parseFloat(e.target.value) || 0)}
                    className="w-full bg-zinc-950 border border-zinc-700 text-center font-mono font-bold text-base text-yellow-400 rounded-xl p-2 focus:outline-none focus:border-yellow-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                    Repeticiones
                  </label>
                  <input
                    type="number"
                    value={newReps}
                    onChange={(e) => setNewReps(parseInt(e.target.value) || 1)}
                    className="w-full bg-zinc-950 border border-zinc-700 text-center font-mono font-bold text-base text-white rounded-xl p-2 focus:outline-none focus:border-yellow-500"
                    required
                  />
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                  Fecha de la Marca
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs rounded-xl p-2.5 focus:outline-none focus:border-yellow-500 font-mono"
                />
              </div>

              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-center">
                <p className="text-[11px] text-zinc-400">1RM Estimado calculado:</p>
                <p className="text-lg font-mono font-black text-yellow-400">
                  ~{calculate1RM(newWeight, newReps)} kg
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 bg-zinc-800 text-zinc-300 text-xs font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-black rounded-xl shadow-lg shadow-yellow-500/20"
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
