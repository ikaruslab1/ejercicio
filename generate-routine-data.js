import fs from 'fs';

function parseCSV(text) {
  const rows = [];
  let row = [];
  let inQuotes = false;
  let current = '';
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i+1];
    if (c === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      row.push(current.trim());
      current = '';
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && next === '\n') i++;
      row.push(current.trim());
      if (row.length > 1 || row[0] !== '') {
        rows.push(row);
      }
      row = [];
      current = '';
    } else {
      current += c;
    }
  }
  if (current || row.length > 0) {
    row.push(current.trim());
    rows.push(row);
  }
  return rows;
}

const csv = fs.readFileSync('public/Min-Max_Program_5x.xlsx - 5x Per Week.csv', 'utf8');
const rows = parseCSV(csv);

const videos = JSON.parse(fs.readFileSync('extracted-videos.json', 'utf8'));

function getVideo(name) {
  if (!name || name === 'N/A' || name === 'See Notes') return undefined;
  return videos[name.trim()] || undefined;
}

const kgExercises = new Set([
  'Barbell Incline Press',
  'Pec Deck',
  'Incline DB Y-Raise',
  'EZ-Bar Preacher Curl',
  'Squat (Your Choice)',
  'Smith Machine Lunge'
]);

// Translations for all 33 exercises notes into clear, accurate Spanish:
const noteTranslations = {
  "Barbell Incline Press": "Un banco inclinado a 30° o 45° funcionará bien aquí. Haz una pausa de 1 segundo en la parte inferior de cada repetición manteniendo la tensión en los pectorales.",
  "Pec Deck": "Haz una pausa de 1 segundo en la parte inferior de cada repetición manteniendo la tensión en los pectorales.",
  "Incline DB Y-Raise": "Usa un banco inclinado a 30° (espalda apoyada contra el respaldo) y eleva las mancuernas hacia arriba y hacia afuera formando una 'Y'.",
  "Pull-Up (Wide Grip)": "Controla la fase excéntrica (bajada) y siente cómo se elongan tus dorsales. ¡Rango de movimiento completo (ROM)!",
  "Kelso Shrug": "Pausa durante aproximadamente 1 segundo arriba y permite que tus escápulas se separen de forma controlada en la bajada.",
  "EZ-Bar Preacher Curl": "Mantén los tríceps firmemente apoyados contra la almohadilla mientras realizas el curl. Repeticiones fluidas y controladas.",
  "Triceps Pressdown": "Puedes usar un agarre de cuerda o una barra recta, lo que te resulte más cómodo para los codos y muñecas.",
  "Dragon Flag": "Mantén tu cuerpo lo más rígido y recto posible durante todo el rango de movimiento.",
  "Lying Leg Curl": "Ajusta la máquina para obtener el mayor estiramiento posible en la posición inicial. Evita que los glúteos se eleven al flexionar las rodillas.",
  "Squat (Your Choice)": "Puede ser Sentadilla Trasera con Barra, Sentadilla Frontal, Sentadilla Pendulum, Sentadilla Hack, Belt Squat o Sentadilla en Smith.",
  "Smith Machine Lunge": "¡Minimiza la ayuda de la pierna trasera para focalizar toda la carga en la pierna adelantada!",
  "Leg Extension": "Coloca el respaldo lo más atrás posible donde sigas cómodo para estirar el recto femoral. Sujeta fuerte los agarres para no despegar los glúteos del asiento.",
  "Machine Hip Abduction": "Si es posible, coloca almohadillas de espuma entre la parte exterior de las rodillas y los cojines para aumentar el rango de movimiento en la apertura.",
  "Standing Calf Raise": "Pausa de 1 a 2 segundos en la posición inferior (estiramiento profundo). En lugar de solo elevarte sobre la punta, rueda los tobillos hacia adelante y atrás sobre el metatarso.",
  "Close-Grip Lat Pulldown": "Inclínate ligeramente hacia atrás (~15°) y lleva los codos hacia abajo mientras juntas las escápulas. Se sentirá en dorsales y trapecio medio.",
  "Chest-Supported T-Bar Row": "Abre los codos a unos 45° y aprieta fuertemente las escápulas en la contracción máxima de cada repetición.",
  "Machine Shrug": "Piensa en encoger los hombros 'hacia las orejas'. Usa correas (straps) si es posible para no limitar el agarre.",
  "Machine Chest Press": "Pausa de 1 segundo en la parte inferior manteniendo tensión continua sobre los pectorales.",
  "High-Cable Lateral Raise": "Coloca la polea aproximadamente a la altura de la cadera. Deja que la mano cruce un poco la línea media abajo para estirar profundamente el deltoides lateral.",
  "1-Arm Reverse Pec Deck": "Desplaza el peso hacia afuera creando el semicírculo más amplio posible con el brazo.",
  "Cable Crunch": "Redondea la zona lumbar mientras haces el crunch. Mantén una conexión mente-músculo estricta con el abdomen.",
  "Barbell RDL": "Empuja los glúteos directamente hacia atrás mientras bajas la barra verticalmente sobre la mitad del pie. Estiramiento profundo con columna neutra (sin redondear la espalda).",
  "Machine Hip Thrust": "Aprieta fuertemente los glúteos en el bloqueo arriba y controla la bajada de la carga.",
  "Leg Press": "Pies más abajo en la plataforma para mayor énfasis en cuádriceps. Baja tan profundo como puedas sin despegar la pelvis ni redondear la espalda baja.",
  "Bayesian Cable Curl": "Al flexionar, inclínate opcionalmente hacia adelante para evitar que el cable choque con la muñeca. Controla la bajada y siente el estiramiento profundo.",
  "Overhead Cable Triceps Extension": "Siente un estiramiento profundo en la cabeza larga del tríceps durante toda la fase excéntrica (bajada).",
  "Modified Zottman Curl": "Curl martillo en la subida y curl supinado (palmas hacia arriba) en la bajada excéntrica.",
  "Cable Triceps Kickback": "Mantén el brazo fijo detrás del torso durante todo el rango de movimiento.",
  "DB Wrist Curl": "Repeticiones suaves y controladas flexionando la muñeca en apoyo.",
  "DB Wrist Extension": "Repeticiones suaves y controladas extendiendo la muñeca en apoyo.",
  "Alternating DB Curl": "¡Repeticiones lentas y controladas con supinación activa!",
  "Machine Lateral Raise": "Enfócate en apretar y contraer el deltoides lateral para mover el peso sin impulsos de trapecio.",
  "Dead Hang (optional)": "¡Intenta añadir unos segundos más cada semana sosteniéndote de la barra!"
};

const intensityTranslations = {
  "N/A": "Estándar (Sin técnica de intensidad)",
  "Two Drop Sets (~25% per)": "Dos Drop Sets (~25% de reducción por serie)",
  "Lengthened Partials (Extend Set)": "Parciales en Posición Alargada (Extender serie al fallo)",
  "Myo-reps": "Myo-reps (Serie de activación + micro-series con pausas cortas)",
  "Weighted Static Hold (30 sec)": "Sostenido Estático con Carga (30 segundos al final de la serie)"
};

const muscleMap = {
  'Barbell Incline Press': 'Pectorales',
  'Pec Deck': 'Pectorales',
  'Incline DB Y-Raise': 'Hombros',
  'Pull-Up (Wide Grip)': 'Espalda',
  'Kelso Shrug': 'Espalda',
  'EZ-Bar Preacher Curl': 'Brazos',
  'Triceps Pressdown': 'Brazos',
  'Dragon Flag': 'Abdomen',
  'Lying Leg Curl': 'Piernas',
  'Squat (Your Choice)': 'Piernas',
  'Smith Machine Lunge': 'Piernas',
  'Leg Extension': 'Piernas',
  'Machine Hip Abduction': 'Piernas',
  'Standing Calf Raise': 'Piernas',
  'Close-Grip Lat Pulldown': 'Espalda',
  'Chest-Supported T-Bar Row': 'Espalda',
  'Machine Shrug': 'Espalda',
  'Machine Chest Press': 'Pectorales',
  'High-Cable Lateral Raise': 'Hombros',
  '1-Arm Reverse Pec Deck': 'Hombros',
  'Cable Crunch': 'Abdomen',
  'Barbell RDL': 'Piernas',
  'Machine Hip Thrust': 'Piernas',
  'Leg Press': 'Piernas',
  'Bayesian Cable Curl': 'Brazos',
  'Overhead Cable Triceps Extension': 'Brazos',
  'Modified Zottman Curl': 'Brazos',
  'Cable Triceps Kickback': 'Brazos',
  'DB Wrist Curl': 'Brazos',
  'DB Wrist Extension': 'Brazos',
  'Alternating DB Curl': 'Brazos',
  'Machine Lateral Raise': 'Hombros',
  'Dead Hang (optional)': 'Espalda'
};

function parseRestSeconds(rest) {
  if (!rest) return 90;
  if (rest.includes('3-5')) return 240; // 4 min
  if (rest.includes('2-4')) return 180; // 3 min
  if (rest.includes('2-3')) return 150; // 2.5 min
  if (rest.includes('1-2')) return 90;  // 1.5 min
  return 90;
}

function exerciseSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

let currentWeek = 0;
let currentDay = '';
const weekDays = {};

for (let r = 0; r < rows.length; r++) {
  const row = rows[r];
  const col1 = row[1] || '';
  if (col1.startsWith('Week ')) {
    currentWeek = parseInt(col1.replace('Week ', ''));
    weekDays[currentWeek] = {};
    continue;
  }
  const dayCol = row[1];
  if (dayCol && (dayCol.includes('Upper') || dayCol.includes('Lower') || dayCol.includes('Arms') || dayCol.includes('Rest'))) {
    currentDay = dayCol;
    if (!weekDays[currentWeek]) weekDays[currentWeek] = {};
    if (!weekDays[currentWeek][currentDay]) weekDays[currentWeek][currentDay] = [];
  }
  const exerciseName = row[2];
  if (exerciseName && exerciseName !== 'Exercise' && currentWeek > 0 && currentDay && !currentDay.includes('Rest')) {
    weekDays[currentWeek][currentDay].push({
      exercise: exerciseName,
      intensity: row[3] || 'N/A',
      warmup: row[4] || '',
      workingSets: parseInt(row[5]) || 2,
      repRange: row[6] || '',
      load1: row[7] || '',
      reps1: row[8] || '',
      load2: row[9] || '',
      reps2: row[10] || '',
      rir1: row[11] || '',
      rir2: row[12] || '',
      rest: row[13] || '',
      sub1: row[14] || '',
      sub2: row[15] || '',
      notes: row[16] || ''
    });
  }
}

// Build 33 Master Exercise Definitions
const masterExercises = {};
for (const [name, noteEs] of Object.entries(noteTranslations)) {
  const id = exerciseSlug(name);
  const sample = weekDays[1]['Upper 1'].find(e => e.exercise === name) ||
                 weekDays[1]['Lower 1'].find(e => e.exercise === name) ||
                 weekDays[1]['Upper 2'].find(e => e.exercise === name) ||
                 weekDays[1]['Lower 2'].find(e => e.exercise === name) ||
                 weekDays[1]['Arms/Delts'].find(e => e.exercise === name);

  masterExercises[id] = {
    id,
    name,
    muscleGroup: muscleMap[name] || 'Full Body',
    warmupSets: sample?.warmup || '1-2',
    workingSets: sample?.workingSets || 2,
    repRange: sample?.repRange || '6-8',
    restText: sample?.rest || '1-2 min',
    restSeconds: parseRestSeconds(sample?.rest),
    sub1: sample?.sub1 || 'N/A',
    sub2: sample?.sub2 || 'N/A',
    videoUrl: getVideo(name),
    sub1VideoUrl: getVideo(sample?.sub1),
    sub2VideoUrl: getVideo(sample?.sub2),
    weightUnit: kgExercises.has(name) ? 'kg' : 'lbs',
    note: noteEs
  };
}

// Map day names to IDs and metadata
const dayMeta = {
  'Upper 1': {
    dayNumber: 1,
    dayKey: 'upper1',
    title: 'Upper 1 (Torso & Tirón)',
    subtitle: 'Énfasis en Pectoral Superior, Espalda & Brazos',
    color: '#eab308',
    accentColor: 'from-amber-500/20 to-yellow-500/5',
    focus: 'Sobrecarga de empuje inclinado, tracción vertical pesada y aislamiento de brazos.'
  },
  'Lower 1': {
    dayNumber: 2,
    dayKey: 'lower1',
    title: 'Lower 1 (Tren Inferior Cuádriceps & Isquios)',
    subtitle: 'Sentadilla, Femoral Tumbado & Zancadas',
    color: '#3b82f6',
    accentColor: 'from-blue-500/20 to-indigo-500/5',
    focus: 'Tensión mecánica en flexión profunda de rodilla y flexión femoral aislada.'
  },
  'Upper 2': {
    dayNumber: 3,
    dayKey: 'upper2',
    title: 'Upper 2 (Torso Espalda & Pectoral)',
    subtitle: 'Jalón Neutro, Remo T-Bar & Press Máquina',
    color: '#10b981',
    accentColor: 'from-emerald-500/20 to-teal-500/5',
    focus: 'Densidad de espalda media, deltoides lateral en polea y estabilidad pectoral.'
  },
  'Lower 2': {
    dayNumber: 4,
    dayKey: 'lower2',
    title: 'Lower 2 (Cadena Posterior & Prensa)',
    subtitle: 'RDL con Barra, Hip Thrust & Prensa de Piernas',
    color: '#8b5cf6',
    accentColor: 'from-purple-500/20 to-fuchsia-500/5',
    focus: 'Bisagra de cadera pesada (glúteo e isquios) y sobrecarga en prensa.'
  },
  'Arms/Delts': {
    dayNumber: 5,
    dayKey: 'arms_delts',
    title: 'Arms & Delts (Brazos, Deltoides & Antebrazo)',
    subtitle: 'Curl Bayesiano, Tríceps sobre Cabeza & Laterales',
    color: '#ec4899',
    accentColor: 'from-pink-500/20 to-rose-500/5',
    focus: 'Hipertrofia localizada de brazos en posiciones de máximo estiramiento y bombeo lateral.'
  }
};

// Generate 12 weeks of routine data
const weeksData = {};
const routineDataExport = {};

for (let w = 1; w <= 12; w++) {
  weeksData[w] = {
    weekNumber: w,
    title: `Semana ${w}`,
    phase: w === 1 ? 'Intro Week' : w === 7 ? 'Deload Week' : w >= 8 ? 'Peak Intensity Block' : 'Progressive Overload Block',
    days: []
  };

  const dayOrder = ['Upper 1', 'Lower 1', 'Upper 2', 'Lower 2', 'Arms/Delts'];
  dayOrder.forEach((dayName, dayIdx) => {
    const rawExercises = weekDays[w][dayName] || [];
    const meta = dayMeta[dayName];
    const dayId = `w${w}_d${meta.dayNumber}`;

    const exercises = rawExercises.map((raw, exIdx) => {
      const base = masterExercises[exerciseSlug(raw.exercise)];
      const targetRir1 = raw.rir1 || '1';
      const targetRir2 = raw.rir2 || '0';
      const intensity = raw.intensity && raw.intensity !== 'N/A' ? raw.intensity : 'N/A';
      const intensityEs = intensityTranslations[intensity] || intensity;

      return {
        id: `${dayId}_ex${exIdx + 1}`,
        exerciseId: base.id,
        name: raw.exercise,
        muscleGroup: base.muscleGroup,
        warmupSets: raw.warmup || base.warmupSets,
        workingSetsCount: raw.workingSets || base.workingSets,
        repRange: raw.repRange || base.repRange,
        intensityTechnique: intensity,
        intensityTechniqueEs: intensityEs,
        targetRir1,
        targetRir2,
        restText: raw.rest || base.restText,
        restSeconds: parseRestSeconds(raw.rest),
        sub1: raw.sub1 && raw.sub1 !== 'N/A' ? raw.sub1 : undefined,
        sub2: raw.sub2 && raw.sub2 !== 'N/A' ? raw.sub2 : undefined,
        videoUrl: getVideo(raw.exercise),
        sub1VideoUrl: getVideo(raw.sub1),
        sub2VideoUrl: getVideo(raw.sub2),
        weightUnit: kgExercises.has(raw.exercise) ? 'kg' : 'lbs',
        note: noteTranslations[raw.exercise] || raw.notes,
        // Pre-filled data ONLY in week 1 days 1 and 2
        prefilledLoad1: (w === 1 && (meta.dayNumber === 1 || meta.dayNumber === 2)) && raw.load1 ? parseFloat(raw.load1) : undefined,
        prefilledReps1: (w === 1 && (meta.dayNumber === 1 || meta.dayNumber === 2)) && raw.reps1 ? parseInt(raw.reps1) : undefined,
        prefilledLoad2: (w === 1 && (meta.dayNumber === 1 || meta.dayNumber === 2)) && raw.load2 ? parseFloat(raw.load2) : undefined,
        prefilledReps2: (w === 1 && (meta.dayNumber === 1 || meta.dayNumber === 2)) && raw.reps2 ? parseInt(raw.reps2) : undefined
      };
    });

    const routineDay = {
      id: dayId,
      weekNumber: w,
      dayNumber: meta.dayNumber,
      dayKey: meta.dayKey,
      dayName,
      title: `Semana ${w} · ${meta.title}`,
      subtitle: meta.subtitle,
      color: meta.color,
      accentColor: meta.accentColor,
      focus: meta.focus,
      phase: weeksData[w].phase,
      estimatedDurationMin: dayName.includes('Arms') ? 50 : 65,
      exercises
    };

    routineDataExport[dayId] = routineDay;
    weeksData[w].days.push(dayId);
  });
}

// Generate the TypeScript file content
const tsContent = `// Min-Max Program 5x (Jeff Nippard 2025-2026)
// 12 Semanas completas · 5 Días por semana (Upper 1, Lower 1, Upper 2, Lower 2, Arms/Delts)
import type { MuscleGroup, WeightUnit } from '../types/workout';

export interface ExerciseDefinition {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  warmupSets: string; // e.g. "2-4", "1-2", "0-1"
  workingSets: number; // usually 1 or 2
  repRange: string; // e.g. "6-8", "8-10" (PLACEHOLDER for UI input)
  restText: string;
  restSeconds: number;
  sub1?: string;
  sub2?: string;
  videoUrl?: string;
  sub1VideoUrl?: string;
  sub2VideoUrl?: string;
  note: string; // Spanish translated note
  weightUnit?: WeightUnit;
}

export interface RoutineExercise {
  id: string; // e.g. "w1_d1_ex1"
  exerciseId: string; // slug e.g. "barbell-incline-press"
  name: string;
  muscleGroup: MuscleGroup;
  warmupSets: string; // Series de aproximación sugeridas
  workingSetsCount: number; // 1 or 2
  repRange: string; // Rango sugerido (PLACEHOLDER, no guardado/hardcodeado)
  intensityTechnique: string;
  intensityTechniqueEs: string;
  targetRir1: string; // "2", "1", "0 (Fallo)", "N/A"
  targetRir2: string; // "1", "0 (Fallo)", "N/A"
  restText: string;
  restSeconds: number;
  sub1?: string;
  sub2?: string;
  videoUrl?: string;
  sub1VideoUrl?: string;
  sub2VideoUrl?: string;
  note: string;
  weightUnit?: WeightUnit;
  prefilledLoad1?: number;
  prefilledReps1?: number;
  prefilledLoad2?: number;
  prefilledReps2?: number;
}

export interface RoutineDay {
  id: string; // e.g. "w1_d1"
  weekNumber: number; // 1..12
  dayNumber: number; // 1..5
  dayKey: 'upper1' | 'lower1' | 'upper2' | 'lower2' | 'arms_delts';
  dayName: string;
  title: string;
  subtitle: string;
  color: string;
  accentColor: string;
  focus: string;
  phase: string;
  estimatedDurationMin: number;
  exercises: RoutineExercise[];
}

export interface WeekProgram {
  weekNumber: number;
  title: string;
  phase: string;
  days: string[]; // array of routineDay IDs e.g. ["w1_d1", "w1_d2", "w1_d3", "w1_d4", "w1_d5"]
}

export const masterExercises: Record<string, ExerciseDefinition> = ${JSON.stringify(masterExercises, null, 2)};

export const programWeeks: Record<number, WeekProgram> = ${JSON.stringify(weeksData, null, 2)};

export const routineData: Record<string, RoutineDay> = ${JSON.stringify(routineDataExport, null, 2)};

// Helper to get all day IDs for a given split
export const getDaysBySplit = (splitKey: 'upper1' | 'lower1' | 'upper2' | 'lower2' | 'arms_delts'): RoutineDay[] => {
  return Object.values(routineData).filter(day => day.dayKey === splitKey);
};

// Helper to get days for a given week
export const getDaysByWeek = (weekNumber: number): RoutineDay[] => {
  return Object.values(routineData).filter(day => day.weekNumber === weekNumber);
};

export const programWeeksList: WeekProgram[] = Object.values(programWeeks);
`;

fs.writeFileSync('src/data/routineData.ts', tsContent, 'utf8');
console.log('src/data/routineData.ts generated successfully! Total days:', Object.keys(routineDataExport).length);

