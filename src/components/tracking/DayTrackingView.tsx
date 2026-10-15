import React, { useState } from 'react';
import { useWorkout, calculate1RM } from '../../context/WorkoutContext';
import { getLocalDateString } from '../../lib/dateUtils';
import { 
  CalendarDays, 
  Scale, 
  Download, 
  Trash2, 
  Clock, 
  Flame, 
  Filter, 
  Search, 
  CheckCircle2, 
  Star, 
  Plus, 
  FileSpreadsheet
} from 'lucide-react';


export const DayTrackingView: React.FC = () => {
  const { 
    workoutHistory, 
    deleteWorkoutSession, 
    bodyWeightLogs, 
    addBodyWeightLog, 
    deleteBodyWeightLog,
    userProfile,
    exportDataCSV 
  } = useWorkout();

  // Weight logger state
  const [inputWeight, setInputWeight] = useState<number>(userProfile.weightKg || 90);
  const [inputDate, setInputDate] = useState<string>(() => getLocalDateString());
  const [inputNotes, setInputNotes] = useState<string>('');
  const [weightSavedToast, setWeightSavedToast] = useState(false);

  // Filters state (Semana & Grupo/Split)
  const [selectedWeekFilter, setSelectedWeekFilter] = useState<string>('all');
  const [selectedSplitFilter, setSelectedSplitFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // CSV Export Date Range state
  const [csvStartDate, setCsvStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return getLocalDateString(d);
  });
  const [csvEndDate, setCsvEndDate] = useState<string>(() => {
    return getLocalDateString();
  });

  const handleSaveWeight = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputWeight <= 0) return;
    addBodyWeightLog(inputWeight, inputDate, inputNotes.trim() || undefined);
    setInputNotes('');
    setWeightSavedToast(true);
    setTimeout(() => setWeightSavedToast(false), 3000);
  };

  // Filtered Sessions by Week, Split Group, and Search Query
  const filteredSessions = workoutHistory.filter(session => {
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

    // 3. Text Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDay = session.dayTitle.toLowerCase().includes(q);
      const matchExercise = session.exercises.some(e => e.exerciseName.toLowerCase().includes(q));
      const matchNotes = (session.notes || '').toLowerCase().includes(q);
      if (!matchDay && !matchExercise && !matchNotes) return false;
    }
    return true;
  });

  // Calculate high level metrics
  const totalVolumeLifetime = workoutHistory.reduce((acc, s) => acc + s.totalVolumeKg, 0);
  const totalSessionsCount = workoutHistory.length;
  const avgDurationMin = totalSessionsCount > 0 
    ? Math.round(workoutHistory.reduce((acc, s) => acc + s.durationSeconds, 0) / totalSessionsCount / 60)
    : 0;

  const currentWeight = bodyWeightLogs.length > 0 ? bodyWeightLogs[0].weightKg : userProfile.weightKg;
  const initialWeight = bodyWeightLogs.length > 0 ? bodyWeightLogs[bodyWeightLogs.length - 1].weightKg : currentWeight;
  const weightDelta = currentWeight - initialWeight;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 p-6 rounded-3xl relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                <CalendarDays size={20} />
              </span>
              <span className="text-xs font-mono text-yellow-400 font-bold uppercase tracking-wider">
                Bitácora de Sesiones & Métricas
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Seguimiento de Días de Entrenamiento
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
              Consulta en detalle cada serie, repetición, carga y RIR de tus 5 días de entrenamiento. Registra tu peso corporal diario y descarga la base de datos en CSV por rangos de fecha.
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
            <div className="bg-zinc-950/80 border border-zinc-800 p-3 rounded-2xl text-center">
              <p className="text-[10px] font-mono text-zinc-400 uppercase font-bold">Sesiones</p>
              <p className="text-lg font-black text-white font-mono">{totalSessionsCount}</p>
            </div>
            <div className="bg-zinc-950/80 border border-zinc-800 p-3 rounded-2xl text-center">
              <p className="text-[10px] font-mono text-zinc-400 uppercase font-bold">Volumen Total</p>
              <p className="text-lg font-black text-yellow-400 font-mono">{(totalVolumeLifetime / 1000).toFixed(1)}t</p>
            </div>
            <div className="bg-zinc-950/80 border border-zinc-800 p-3 rounded-2xl text-center">
              <p className="text-[10px] font-mono text-zinc-400 uppercase font-bold">Peso Actual</p>
              <p className="text-lg font-black text-white font-mono">{currentWeight} kg</p>
              <p className={`text-[10px] font-mono ${weightDelta < 0 ? 'text-emerald-400' : weightDelta > 0 ? 'text-amber-400' : 'text-zinc-500'}`}>
                {weightDelta > 0 ? `+${weightDelta.toFixed(1)}kg` : `${weightDelta.toFixed(1)}kg`}
              </p>
            </div>
            <div className="bg-zinc-950/80 border border-zinc-800 p-3 rounded-2xl text-center">
              <p className="text-[10px] font-mono text-zinc-400 uppercase font-bold">Promedio</p>
              <p className="text-lg font-black text-zinc-200 font-mono">{avgDurationMin} min</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Layout: Body Weight Logger + CSV Exporter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Body Weight Logger (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-5 shadow-lg">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center border border-yellow-500/30">
                  <Scale size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Registrar Peso Corporal
                  </h3>
                  <p className="text-[11px] text-zinc-400">Actualiza tu peso para sincronizar nutrición y BMR</p>
                </div>
              </div>
            </div>

            {weightSavedToast && (
              <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold p-3 rounded-2xl flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 size={16} />
                <span>¡Peso guardado y sincronizado con Neon PostgreSQL!</span>
              </div>
            )}

            <form onSubmit={handleSaveWeight} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {/* Weight Input */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase">
                    Peso (kg):
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setInputWeight(prev => Math.max(40, Math.round((prev - 0.2) * 10) / 10))}
                      className="w-8 h-9 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl active:scale-95"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      step="0.1"
                      min="40"
                      max="250"
                      value={inputWeight}
                      onChange={(e) => setInputWeight(parseFloat(e.target.value) || 0)}
                      required
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl py-1.5 text-center font-mono font-bold text-yellow-400 focus:outline-none focus:border-yellow-500 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setInputWeight(prev => Math.round((prev + 0.2) * 10) / 10)}
                      className="w-8 h-9 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl active:scale-95"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Date Input */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase">
                    Fecha:
                  </label>
                  <input
                    type="date"
                    value={inputDate}
                    onChange={(e) => setInputDate(e.target.value)}
                    required
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-2.5 py-1.5 font-mono text-xs text-white focus:outline-none focus:border-yellow-500 h-9"
                  />
                </div>
              </div>

              {/* Notes Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase">
                  Notas (Opcional):
                </label>
                <input
                  type="text"
                  value={inputNotes}
                  onChange={(e) => setInputNotes(e.target.value)}
                  placeholder="En ayunas, post-entreno, etc."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-yellow-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-400 active:scale-95 text-black font-black text-xs rounded-xl shadow-md shadow-yellow-500/20 flex items-center justify-center gap-1.5 transition-all"
              >
                <Plus size={15} />
                <span>Guardar Peso de Hoy ({inputWeight} kg)</span>
              </button>
            </form>

            {/* Weight History Log Table */}
            <div className="space-y-2 pt-2 border-t border-zinc-800/80">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-zinc-400 uppercase">
                <span>Historial de Peso</span>
                <span>{bodyWeightLogs.length} registros</span>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {bodyWeightLogs.map((log) => {
                  const heightM = userProfile.heightCm / 100;
                  const imc = (log.weightKg / (heightM * heightM)).toFixed(1);
                  return (
                    <div
                      key={log.id}
                      className="bg-zinc-950/70 border border-zinc-800/80 p-2.5 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-yellow-400">{log.weightKg} kg</span>
                          <span className="text-[10px] font-mono text-zinc-500">IMC {imc}</span>
                        </div>
                        <p className="text-[10px] font-mono text-zinc-400">{log.date} {log.notes ? `· ${log.notes}` : ''}</p>
                      </div>

                      <button
                        onClick={() => deleteBodyWeightLog(log.id)}
                        className="text-zinc-600 hover:text-red-400 p-1.5 transition-colors"
                        title="Eliminar registro de peso"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: CSV Database Exporter by Date Range (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-5 shadow-lg">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Download size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Descargar Base de Datos en CSV
                  </h3>
                  <p className="text-[11px] text-zinc-400">Exporta series, reps, RIR y peso corporal filtrado por fechas</p>
                </div>
              </div>
              <span className="text-xs font-mono bg-zinc-950 px-2 py-0.5 rounded text-zinc-400 border border-zinc-800">
                UTF-8 Excel Ready
              </span>
            </div>

            {/* Date Range Selection Form */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="text-zinc-400 font-mono font-bold uppercase text-[10px]">Atajos:</span>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() - 7);
                    setCsvStartDate(getLocalDateString(d));
                    setCsvEndDate(getLocalDateString());
                  }}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-[11px]"
                >
                  Últimos 7 días
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() - 30);
                    setCsvStartDate(getLocalDateString(d));
                    setCsvEndDate(getLocalDateString());
                  }}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-[11px]"
                >
                  Últimos 30 días
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCsvStartDate('2026-01-01');
                    setCsvEndDate(getLocalDateString());
                  }}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-[11px]"
                >
                  Todo el Historial
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-zinc-400 uppercase font-bold">Desde (Fecha Inicio):</label>
                  <input
                    type="date"
                    value={csvStartDate}
                    onChange={(e) => setCsvStartDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-yellow-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-zinc-400 uppercase font-bold">Hasta (Fecha Fin):</label>
                  <input
                    type="date"
                    value={csvEndDate}
                    onChange={(e) => setCsvEndDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-yellow-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => exportDataCSV(csvStartDate, csvEndDate, 'workouts')}
                  className="py-2.5 px-3 bg-zinc-950 hover:bg-zinc-800 active:scale-95 text-yellow-400 font-bold text-xs rounded-xl border border-yellow-500/30 flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <FileSpreadsheet size={15} />
                  <span>Descargar CSV de Entrenos</span>
                </button>

                <button
                  type="button"
                  onClick={() => exportDataCSV(csvStartDate, csvEndDate, 'bodyweight')}
                  className="py-2.5 px-3 bg-zinc-950 hover:bg-zinc-800 active:scale-95 text-zinc-200 font-bold text-xs rounded-xl border border-zinc-800 flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Scale size={15} />
                  <span>Descargar CSV de Peso</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => exportDataCSV(csvStartDate, csvEndDate, 'all')}
                className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono rounded-xl transition-colors"
              >
                📥 Descargar Paquete Completo (Ambos Archivos)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Detailed Training Sessions Breakdown */}
      <div className="space-y-4">
        {/* Filter & Search Bar */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl space-y-3 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Split Group Filters */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-mono text-zinc-400 flex items-center gap-1 font-bold mr-1">
                <Filter size={13} className="text-yellow-400" /> División:
              </span>
              {[
                { id: 'all', label: 'Todos los Grupos' },
                { id: 'upper1', label: 'Upper 1 (Torso)' },
                { id: 'lower1', label: 'Lower 1 (Cuádriceps)' },
                { id: 'upper2', label: 'Upper 2 (Espalda/Pecho)' },
                { id: 'lower2', label: 'Lower 2 (Femoral/Glúteo)' },
                { id: 'arms_delts', label: 'Arms & Delts (Brazos)' }
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

            {/* Search Input */}
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

          {/* Week Filters (Semana 1..12) */}
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

        {/* Sessions List */}
        {filteredSessions.length === 0 ? (
          <div className="bg-zinc-900/50 border border-dashed border-zinc-800 rounded-3xl p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 text-zinc-500 flex items-center justify-center mx-auto">
              <CalendarDays size={24} />
            </div>
            <h3 className="text-base font-bold text-white">No se encontraron sesiones registradas</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Cuando inicies y finalices un entrenamiento en vivo, toda la información detallada de cargas, series y repeticiones aparecerá aquí.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredSessions.map(session => {
              const dateFormatted = new Date(session.startTime).toLocaleDateString('es-MX', {
                weekday: 'long',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });
              const timeFormatted = new Date(session.startTime).toLocaleTimeString('es-MX', {
                hour: '2-digit',
                minute: '2-digit'
              });
              const durationMin = Math.round(session.durationSeconds / 60);

              return (
                <div 
                  key={session.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl transition-all hover:border-zinc-700"
                >
                  {/* Session Header Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-mono font-bold bg-yellow-500/20 text-yellow-400 px-2.5 py-0.5 rounded-md border border-yellow-500/30">
                          {session.dayId.toUpperCase()}
                        </span>
                        <span className="text-xs font-mono text-zinc-400 capitalize">
                          📅 {dateFormatted} · {timeFormatted}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-white">
                        {session.dayTitle}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Metric Badges */}
                      <div className="flex items-center gap-2 bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-800 text-xs font-mono">
                        <div className="flex items-center gap-1 text-yellow-400 font-bold">
                          <Flame size={13} />
                          <span>{session.totalVolumeKg.toLocaleString()} kg</span>
                        </div>
                        <span className="text-zinc-700">|</span>
                        <div className="flex items-center gap-1 text-zinc-300">
                          <Clock size={13} />
                          <span>{durationMin} min</span>
                        </div>
                        <span className="text-zinc-700">|</span>
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {Array.from({ length: session.rating || 5 }).map((_, i) => (
                            <Star key={i} size={11} className="fill-current" />
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (window.confirm('¿Deseas eliminar esta sesión del historial?')) {
                            deleteWorkoutSession(session.id);
                          }
                        }}
                        className="p-2 text-zinc-600 hover:text-red-400 hover:bg-zinc-800 rounded-xl transition-colors"
                        title="Eliminar sesión"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Session Notes if any */}
                  {session.notes && (
                    <div className="bg-zinc-950/70 border border-zinc-800/80 p-3 rounded-2xl text-xs text-zinc-300 italic">
                      💬 <span className="text-zinc-400">Nota:</span> "{session.notes}"
                    </div>
                  )}

                  {/* Exercises & Sets Detailed Table */}
                  <div className="space-y-4">
                    {session.exercises.map((exLog, exIdx) => {
                      const exUnit = exLog.weightUnit || 'kg';
                      const exerciseVolume = exLog.sets.reduce((acc, s) => acc + (s.completed ? s.weight * s.reps : 0), 0);

                      return (
                        <div 
                          key={exIdx}
                          className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-4 space-y-3"
                        >
                          {/* Exercise Name & Machine */}
                          <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">
                                #{exIdx + 1}
                              </span>
                              <h4 className="text-sm font-bold text-white capitalize-first">
                                {exLog.exerciseName}
                              </h4>
                              {exLog.weightUnit && (
                                <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-yellow-400 border border-zinc-700">
                                  {exLog.weightUnit}
                                </span>
                              )}
                              {exLog.muscleGroup && (
                                <span className="text-[11px] font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded hidden sm:inline">
                                  {exLog.muscleGroup}
                                </span>
                              )}
                            </div>
                            <span className="text-xs font-mono font-bold text-yellow-400">
                              Volumen: {exerciseVolume.toLocaleString()} {exUnit}
                            </span>
                          </div>

                          {/* Exercise user notes if present */}
                          {exLog.notes && exLog.notes.trim() && (
                            <div className="bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-xl text-xs text-yellow-300">
                              📝 <strong className="text-yellow-400">Nota del ejercicio:</strong> {exLog.notes}
                            </div>
                          )}

                          {/* Sets Detailed Grid */}
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs font-mono">
                              <thead>
                                <tr className="text-zinc-500 border-b border-zinc-900 text-[10px] uppercase font-bold">
                                  <th className="py-1 px-2">Serie</th>
                                  <th className="py-1 px-2">Carga ({exUnit})</th>
                                  <th className="py-1 px-2">Reps</th>
                                  <th className="py-1 px-2">RIR</th>
                                  <th className="py-1 px-2">Volumen</th>
                                  <th className="py-1 px-2">1RM Est.</th>
                                  <th className="py-1 px-2 text-right">Estado</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-zinc-900">
                                {exLog.sets.map((set, sIdx) => {
                                  const setUnit = set.weightUnit || exUnit;
                                  const e1rm = calculate1RM(set.weight, set.reps);
                                  const setVol = set.weight * set.reps;

                                  return (
                                    <tr key={sIdx} className="hover:bg-zinc-900/40 transition-colors">
                                      <td className="py-1.5 px-2 font-bold text-zinc-300">
                                        {set.isWarmup ? (
                                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                            Aprox #{set.setNumber}
                                          </span>
                                        ) : (
                                          <span>Set #{set.setNumber}</span>
                                        )}
                                      </td>
                                      <td className="py-1.5 px-2 text-yellow-400 font-bold">{set.weight} {setUnit}</td>
                                      <td className="py-1.5 px-2 text-white font-bold">{set.reps} reps</td>
                                      <td className="py-1.5 px-2 text-zinc-400">{set.rir !== undefined ? `${set.rir} RIR` : '-'}</td>
                                      <td className="py-1.5 px-2 text-zinc-300">{setVol} {setUnit}</td>
                                      <td className="py-1.5 px-2 text-amber-400">~{e1rm} {setUnit}</td>
                                      <td className="py-1.5 px-2 text-right">
                                        <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-bold ${
                                          set.completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
                                        }`}>
                                          {set.completed ? 'Completada' : 'Pendiente'}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
