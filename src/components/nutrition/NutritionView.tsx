import React, { useState } from 'react';
import { useWorkout } from '../../context/WorkoutContext';
import { calculateMetabolism, supplementPlan } from '../../data/nutritionData';
import { 
  Utensils, 
  Droplet, 
  Zap, 
  Coffee, 
  Info, 
  Scale, 
  Sliders,
  Clock
} from 'lucide-react';

export const NutritionView: React.FC = () => {
  const { userProfile, updateUserProfile } = useWorkout();

  const [weight, setWeight] = useState(userProfile.weightKg);
  const [height, setHeight] = useState(userProfile.heightCm);
  const [age, setAge] = useState(userProfile.age);
  const [activity] = useState(userProfile.activityFactor);
  const [goal, setGoal] = useState(userProfile.goal);

  // Recalculate metabolism
  const stats = calculateMetabolism(weight, height, age, activity);

  let targetCalories = stats.cleanSurplus;
  if (goal === 'mantenimiento') targetCalories = stats.tdee;
  if (goal === 'definicion') targetCalories = stats.deficit;

  const handleApplyProfile = () => {
    updateUserProfile({
      weightKg: weight,
      heightCm: height,
      age: age,
      activityFactor: activity,
      goal: goal
    });
  };

  const getSupplementIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap': return <Zap size={20} className="text-yellow-400" />;
      case 'Coffee': return <Coffee size={20} className="text-amber-400" />;
      case 'Droplet': return <Droplet size={20} className="text-blue-400" />;
      default: return <Utensils size={20} className="text-yellow-400" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-500/15 via-zinc-900 to-zinc-950 border border-yellow-500/30 p-6 sm:p-8">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-yellow-500 text-black rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-yellow-500/20">
              <Utensils size={13} /> Nutrición Basada en Evidencia
            </span>
            <span className="text-xs font-mono text-zinc-400">ACSM & ISSN Standards</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Evaluación Fisiológica & Nutrición
          </h1>

          <p className="text-sm text-zinc-300 leading-relaxed">
            La precisión metabólica no es opcional: es la piedra angular para maximizar la síntesis proteica muscular (MPS) y evitar acumulación lipídica innecesaria durante la hipertrofia.
          </p>
        </div>
      </div>

      {/* Interactive Metabolic Calculator */}
      <div className="bg-zinc-900/90 border border-zinc-800/90 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
              <Sliders size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Calculadora Metabólica Mifflin-St Jeor</h2>
              <p className="text-xs text-zinc-400">Ajusta tus parámetros corporales para recalcular tus requerimientos</p>
            </div>
          </div>

          <button
            onClick={handleApplyProfile}
            className="px-4 py-2 bg-zinc-800 hover:bg-yellow-500 hover:text-black text-zinc-200 text-xs font-bold rounded-xl transition-all border border-zinc-700 hover:border-yellow-500"
          >
            Guardar en mi Perfil
          </button>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1">
              Peso Corporal
            </label>
            <div className="flex items-center bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2">
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent font-mono font-bold text-lg text-yellow-400 focus:outline-none"
              />
              <span className="text-xs font-mono text-zinc-500 ml-1">kg</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1">
              Altura
            </label>
            <div className="flex items-center bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2">
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent font-mono font-bold text-lg text-white focus:outline-none"
              />
              <span className="text-xs font-mono text-zinc-500 ml-1">cm</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1">
              Edad
            </label>
            <div className="flex items-center bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2">
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                className="w-full bg-transparent font-mono font-bold text-lg text-white focus:outline-none"
              />
              <span className="text-xs font-mono text-zinc-500 ml-1">años</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1">
              Objetivo
            </label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value as any)}
              className="w-full bg-zinc-950 border border-zinc-700 text-xs font-bold text-yellow-400 rounded-xl p-2.5 focus:outline-none"
            >
              <option value="hipertrofia_limpia">Hipertrofia Limpia (+10%)</option>
              <option value="mantenimiento">Mantenimiento (TDEE)</option>
              <option value="definicion">Definición (-20%)</option>
            </select>
          </div>
        </div>

        {/* Metabolic Calculations Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 space-y-1">
            <p className="text-[11px] text-zinc-400 font-bold uppercase">Tasa Metabólica Basal (BMR)</p>
            <p className="text-3xl font-black font-mono text-white">
              ~{stats.bmr} <span className="text-sm font-normal text-zinc-500">kcal/día</span>
            </p>
            <p className="text-xs text-zinc-500 mt-2">Gasto energético vital en reposo absoluto.</p>
          </div>

          <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 space-y-1">
            <p className="text-[11px] text-zinc-400 font-bold uppercase">Gasto Diario Total (TDEE)</p>
            <p className="text-3xl font-black font-mono text-white">
              ~{stats.tdee} <span className="text-sm font-normal text-zinc-500">kcal/día</span>
            </p>
            <p className="text-xs text-zinc-500 mt-2">Factor de actividad {activity} (Fuerza + Universidad).</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-500/15 to-zinc-950 p-5 rounded-2xl border border-yellow-500/40 relative overflow-hidden space-y-1">
            <div className="absolute top-0 right-0 w-2 h-full bg-yellow-500" />
            <p className="text-[11px] text-yellow-400 font-bold uppercase">Calorías Objetivo ({goal})</p>
            <p className="text-3xl font-black font-mono text-yellow-400">
              {targetCalories} <span className="text-sm font-normal text-zinc-400">kcal/día</span>
            </p>
            <p className="text-xs text-zinc-400 mt-2">Ajustar ±100 kcal semanalmente según peso báscula.</p>
          </div>
        </div>

        {/* Macro Distribution Cards */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            <Scale size={16} className="text-yellow-400" />
            <span>Prescripción de Macronutrientes Diarios</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Proteínas */}
            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400 font-bold uppercase">Proteína (1.6 - 2.2 g/kg)</p>
                <p className="text-2xl font-black font-mono text-yellow-400 mt-1">
                  {stats.proteinLow}g - {stats.proteinHigh}g
                </p>
                <p className="text-[11px] text-zinc-500 font-mono">~35-45g por comida (4 tomas)</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center font-bold font-mono">
                PRO
              </div>
            </div>

            {/* Grasas */}
            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400 font-bold uppercase">Grasas Saludables (0.8-1g/kg)</p>
                <p className="text-2xl font-black font-mono text-blue-400 mt-1">
                  {stats.fatsTarget}g
                </p>
                <p className="text-[11px] text-zinc-500 font-mono">Entorno hormonal y testosterona</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold font-mono">
                FAT
              </div>
            </div>

            {/* Carbohidratos */}
            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400 font-bold uppercase">Carbohidratos Complejos</p>
                <p className="text-2xl font-black font-mono text-emerald-400 mt-1">
                  ~{stats.carbsTarget}g
                </p>
                <p className="text-[11px] text-zinc-500 font-mono">Glucógeno para tensión muscular</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold font-mono">
                CHO
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Supplementation Protocol Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Zap className="text-yellow-400" size={20} />
            <span>Prescripción de Suplementación Basada en Evidencia</span>
          </h2>
          <span className="text-xs font-mono text-zinc-400">Guía Clínica</span>
        </div>

        <div className="space-y-4">
          {supplementPlan.map((sup, index) => (
            <div 
              key={index}
              className="bg-zinc-900/90 border border-zinc-800/90 rounded-3xl p-5 sm:p-6 hover:border-zinc-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-lg"
            >
              <div className="md:w-1/3 space-y-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                    {getSupplementIcon(sup.iconName)}
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                    {sup.badge}
                  </span>
                </div>
                <h3 className="font-extrabold text-base text-white">{sup.name}</h3>
                <p className="text-xs font-mono font-bold text-yellow-400">{sup.dosage}</p>
              </div>

              <div className="md:w-2/3 space-y-2 bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800/60">
                <div className="flex items-start gap-2 text-xs text-zinc-300">
                  <Clock size={14} className="text-yellow-400 shrink-0 mt-0.5" />
                  <span><strong className="text-white">Timing óptimo: </strong>{sup.timing}</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-zinc-400">
                  <Info size={14} className="text-blue-400 shrink-0 mt-0.5" />
                  <span><strong className="text-zinc-200">Justificación científica: </strong>{sup.rationale}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
