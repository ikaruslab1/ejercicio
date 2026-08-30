import React, { useState } from 'react';
import { contingencyData } from '../../data/contingencyData';
import { 
  AlertTriangle, 
  Search, 
  ArrowRight, 
  Info, 
  Dumbbell, 
  Zap,
  Filter
} from 'lucide-react';

interface ContingencyViewProps {
  initialSearchQuery?: string;
}

export const ContingencyView: React.FC<ContingencyViewProps> = ({ initialSearchQuery = '' }) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedMuscle, setSelectedMuscle] = useState<string>('Todos');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('Todos');

  const muscleGroups = ['Todos', 'Piernas', 'Pectorales', 'Espalda', 'Hombros', 'Brazos'];
  const equipmentList = ['Todos', 'Mancuerna', 'Barra', 'Polea', 'Peso Corporal'];

  const filteredItems = contingencyData.filter(item => {
    const matchesSearch = 
      item.primaryMachine.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.primaryExercise.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.alternative.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.smartFitTip.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMuscle = selectedMuscle === 'Todos' || item.muscleGroup === selectedMuscle;
    const matchesEquipment = selectedEquipment === 'Todos' || item.altEquipment === selectedEquipment;

    return matchesSearch && matchesMuscle && matchesEquipment;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/20 via-zinc-900 to-zinc-950 border border-amber-500/30 p-6 sm:p-8 shadow-xl">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-amber-500 text-black rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-amber-500/20">
              <AlertTriangle size={13} /> Smart Fit Peak Hours
            </span>
            <span className="text-xs font-mono text-zinc-400">Sin Pérdida de Estímulo</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Plan de Contingencia (Horas Pico)
          </h1>

          <p className="text-sm text-zinc-300 leading-relaxed">
            La efectividad de un estímulo hipertrófico no depende de una máquina específica, sino de la <strong className="text-yellow-400">intención del vector biomecánico</strong>. Si tu equipo está ocupado, sustitúyelo al instante sin perder tiempo ni intensidad.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por máquina (ej. Máquina 21, Hack Squat, Poleas, Pecho)..."
            className="w-full bg-zinc-950 border border-zinc-700/80 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          {/* Muscle Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-[11px] font-bold text-zinc-500 uppercase mr-1 flex items-center gap-1">
              <Filter size={12} /> Zona:
            </span>
            {muscleGroups.map(group => (
              <button
                key={group}
                onClick={() => setSelectedMuscle(group)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedMuscle === group
                    ? 'bg-yellow-500 text-black shadow-md shadow-yellow-500/20'
                    : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {group}
              </button>
            ))}
          </div>

          {/* Equipment Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-[11px] font-bold text-zinc-500 uppercase mr-1">Equipo:</span>
            {equipmentList.map(eq => (
              <button
                key={eq}
                onClick={() => setSelectedEquipment(eq)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all whitespace-nowrap ${
                  selectedEquipment === eq
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-zinc-950 text-zinc-500 hover:text-zinc-300 border border-zinc-800'
                }`}
              >
                {eq}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contingency Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
            <Dumbbell className="text-yellow-400" size={18} />
            <span>Sustituciones Recomendadas ({filteredItems.length})</span>
          </h2>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-800">
            <AlertTriangle className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-zinc-400">No se encontraron alternativas para tu búsqueda.</p>
            <p className="text-xs text-zinc-600 mt-1">Prueba limpiando los filtros o usando términos como 'pecho', 'remo' o 'prensa'.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className="bg-zinc-900/90 border border-zinc-800/90 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl hover:border-amber-500/30 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Header Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800">
                      {item.muscleGroup}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Alternativa en: {item.altEquipment}
                    </span>
                  </div>

                  {/* Comparison Row */}
                  <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500 font-mono">Equipo Ocupado:</span>
                      <span className="font-bold text-zinc-300">{item.primaryMachine}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-800/60">
                      <span className="text-amber-400 font-mono font-bold flex items-center gap-1">
                        <ArrowRight size={13} /> Reemplazo Inmediato:
                      </span>
                      <span className="font-extrabold text-yellow-400">{item.alternative}</span>
                    </div>
                  </div>

                  {/* Biomechanics & SmartFit Tips */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-2 text-zinc-300 bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-800/50">
                      <Zap size={14} className="text-yellow-400 shrink-0 mt-0.5" />
                      <span><strong>Lógica Biomecánica: </strong>{item.biomechanicalLogic}</span>
                    </div>

                    <div className="flex items-start gap-2 text-zinc-400 bg-amber-500/5 p-2.5 rounded-xl border border-amber-500/15">
                      <Info size={14} className="text-amber-400 shrink-0 mt-0.5" />
                      <span><strong>Tip Smart Fit: </strong>{item.smartFitTip}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Consultant Tip Banner */}
      <div className="bg-yellow-500/10 border border-yellow-500/25 p-5 rounded-3xl flex items-start gap-4 shadow-lg">
        <div className="p-2.5 rounded-2xl bg-yellow-500/20 text-yellow-400 shrink-0">
          <Info size={20} />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-yellow-400 text-sm">Regla de Oro en Horas Pico (ACSM 2026)</h4>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Si la máquina principal está ocupada y las alternativas también tienen fila, puedes alternar el orden de tus ejercicios y realizar las series auxiliares (por ejemplo, abdomen o pantorrillas) primero. La evidencia demuestra que el orden de los ejercicios auxiliares no altera el resultado de hipertrofia total si se mantiene el esfuerzo efectivo.
          </p>
        </div>
      </div>
    </div>
  );
};
