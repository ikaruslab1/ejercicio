import React, { useState } from 'react';
import { 
  BatteryCharging, 
  Moon, 
  Activity, 
  CheckCircle2, 
  Flame, 
  Brain,
  ShieldCheck
} from 'lucide-react';

export const OptimizationView: React.FC = () => {
  const [selectedRIR, setSelectedRIR] = useState<number>(2);

  const rirDescriptions = {
    0: {
      title: 'RIR 0: Fallo Muscular Absoluto',
      status: 'Fatiga Exponencial',
      color: 'text-red-400 border-red-500/40 bg-red-500/10',
      description: 'Incapacidad mecánica de completar la fase concéntrica. Genera alta fatiga en el Sistema Nervioso Central (SNC) y daño muscular que prolonga la recuperación hasta 72 horas. Reservar solo para la última serie de ejercicios de aislamiento.'
    },
    1: {
      title: 'RIR 1: Una repetición en reserva',
      status: 'Zona Hipertrófica Óptima',
      color: 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10',
      description: 'Punto dulce de reclutamiento de unidades motoras de alto umbral. Estímulo de máxima calidad biomecánica con fatiga residual manejable.'
    },
    2: {
      title: 'RIR 2: Dos repeticiones en reserva',
      status: 'Estándar de Oro (Hipertrofia Sostenible)',
      color: 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10',
      description: 'Recomendado por directrices ACSM 2026 para ejercicios compuestos pesados (Press de pecho, Hack Squat, Remos). Mantiene la técnica estricta y previene lesiones articulares.'
    },
    3: {
      title: 'RIR 3: Tres repeticiones en reserva',
      status: 'Estímulo Efectivo / Series de Aproximación',
      color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
      description: 'Apropiado para primeras series efectivas de la sesión o cuando el nivel de energía del día es bajo.'
    }
  };

  const currentRIRInfo = rirDescriptions[selectedRIR as keyof typeof rirDescriptions] || rirDescriptions[2];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border border-zinc-800 p-6 sm:p-8 shadow-xl">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 rounded-full text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
              <BatteryCharging size={13} /> Directrices ACSM 2026
            </span>
            <span className="text-xs font-mono text-zinc-400">Ciencia del Rendimiento</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Optimización & Gestión de la Fatiga
          </h1>

          <p className="text-sm text-zinc-300 leading-relaxed">
            La hipertrofia no se produce en el gimnasio, sino durante la recuperación. Una gestión milimétrica de la proximidad al fallo, el cardio y el sueño garantiza progreso sostenido sin agotar tu energía vital.
          </p>
        </div>
      </div>

      {/* Interactive RIR Visualizer */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            <Flame size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Escala Interactiva RIR (Repeticiones en Reserva)</h2>
            <p className="text-xs text-zinc-400">Selecciona el nivel de RIR para conocer su impacto fisiológico y momento de uso</p>
          </div>
        </div>

        {/* Interactive Selector Buttons */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {[
            { rir: 0, label: 'RIR 0 (Fallo)' },
            { rir: 1, label: 'RIR 1 (Límite)' },
            { rir: 2, label: 'RIR 2 (Óptimo)' },
            { rir: 3, label: 'RIR 3 (Seguro)' }
          ].map(btn => (
            <button
              key={btn.rir}
              onClick={() => setSelectedRIR(btn.rir)}
              className={`py-3 px-2 rounded-2xl font-mono text-xs sm:text-sm font-black transition-all ${
                selectedRIR === btn.rir
                  ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20 scale-102'
                  : 'bg-zinc-950 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-800'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Visual Bar Spectrum */}
        <div className="space-y-2 pt-2">
          <div className="w-full bg-zinc-950 h-3 rounded-full overflow-hidden flex border border-zinc-800">
            <div className="bg-red-500 w-1/4 h-full" title="RIR 0 (Fallo)"></div>
            <div className="bg-yellow-500 w-2/4 h-full" title="RIR 1-2 (Zona Óptima)"></div>
            <div className="bg-emerald-500 w-1/4 h-full" title="RIR 3+ (Lejos del fallo)"></div>
          </div>
          <div className="flex justify-between text-[11px] font-mono text-zinc-400 uppercase">
            <span className="text-red-400 font-bold">Fallo (RIR 0)</span>
            <span className="text-yellow-400 font-bold">Zona Hipertrófica Óptima (RIR 1 - 2)</span>
            <span className="text-emerald-400 font-bold">Aproximación (RIR 3+)</span>
          </div>
        </div>

        {/* RIR Active Detail Box */}
        <div className={`p-5 rounded-2xl border ${currentRIRInfo.color} space-y-2 transition-all`}>
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-white">{currentRIRInfo.title}</h3>
            <span className="text-xs font-bold font-mono uppercase px-2.5 py-0.5 rounded-full bg-zinc-950 border border-current">
              {currentRIRInfo.status}
            </span>
          </div>
          <p className="text-xs text-zinc-200 leading-relaxed">
            {currentRIRInfo.description}
          </p>
        </div>
      </div>

      {/* Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cardio Estratégico */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-7 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Activity size={20} />
            </div>
            <h3 className="font-extrabold text-lg text-white">Cardio Estratégico & Glucógeno</h3>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed">
            En la jerarquía de la fatiga muscular, la preservación del <span className="text-yellow-400 font-semibold">glucógeno intra-muscular</span> para la tensión mecánica es primordial.
          </p>

          <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800 space-y-2 text-xs text-zinc-400">
            <div className="flex items-start gap-2">
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Pre-entrenamiento:</strong> 5-8 min a baja intensidad (RPE 3/10) únicamente como facilitador metabólico y aumento de temperatura sin agotar reservas.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Post-entrenamiento:</strong> 15-20 min caminata inclinada (inclinación 8-10%, velocidad 4.5-5.5 km/h) para salud cardiovascular sin interferencia en hipertrofia.</span>
            </div>
          </div>
        </div>

        {/* Higiene del Sueño */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-7 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Moon size={20} />
            </div>
            <h3 className="font-extrabold text-lg text-white">Higiene del Sueño (7 - 9 Horas)</h3>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed">
            El sueño profundo es el entorno hormonal primario para la liberación de <span className="text-yellow-400 font-semibold">hormona del crecimiento (GH)</span> y la reparación del tejido contráctil.
          </p>

          <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800 space-y-2 text-xs text-zinc-400">
            <div className="flex items-start gap-2">
              <Brain size={15} className="text-indigo-400 shrink-0 mt-0.5" />
              <span><strong>Recuperación SNC:</strong> Evita la fatiga periférica acumulada para llegar con máxima claridad a tus clases en la UNAM e investigaciones nocturnas.</span>
            </div>
            <div className="flex items-start gap-2">
              <ShieldCheck size={15} className="text-indigo-400 shrink-0 mt-0.5" />
              <span><strong>Protocolo nocturno:</strong> Cortar cafeína 6-8 horas antes de dormir, habitación a 19-21°C y desconexión de pantallas 30 min antes.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
