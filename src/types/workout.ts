export type MuscleGroup = 'Pectorales' | 'Espalda' | 'Hombros' | 'Piernas' | 'Brazos' | 'Abdomen' | 'Full Body';

export type WeightUnit = 'kg' | 'lbs';

export interface ExerciseSet {
  setNumber: number;
  weight: number; // in kg or lbs
  weightUnit?: WeightUnit;
  reps: number;
  rir?: number | string;
  isWarmup?: boolean;
  completed: boolean;
  isPR?: boolean;
}

export interface RoutineExercise {
  id: string; // e.g. "w1_d1_ex1"
  exerciseId: string; // slug e.g. "barbell-incline-press"
  name: string;
  muscleGroup: MuscleGroup;
  warmupSets: string; // Series de aproximación sugeridas, e.g. "2-4"
  workingSetsCount: number; // 1 or 2
  repRange: string; // Rango sugerido (PLACEHOLDER en input de UI, no hardcodeado)
  intensityTechnique: string;
  intensityTechniqueEs: string;
  targetRir1: string; // e.g. "2", "1", "0"
  targetRir2: string; // e.g. "1", "0", "N/A"
  restText: string; // e.g. "3-5 min"
  restSeconds: number; // e.g. 240
  sub1?: string;
  sub2?: string;
  videoUrl?: string;
  sub1VideoUrl?: string;
  sub2VideoUrl?: string;
  note: string; // Spanish translated note
  weightUnit?: WeightUnit;
  prefilledLoad1?: number;
  prefilledReps1?: number;
  prefilledLoad2?: number;
  prefilledReps2?: number;
}

// Alias Exercise to RoutineExercise for compatibility
export type Exercise = RoutineExercise;

export interface RoutineDay {
  id: string; // e.g. "w1_d1"
  weekNumber: number; // 1..12
  dayNumber: number; // 1..5
  dayKey: 'upper1' | 'lower1' | 'upper2' | 'lower2' | 'arms_delts';
  dayName: string; // e.g. "Upper 1"
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
  days: string[]; // ["w1_d1", "w1_d2", "w1_d3", "w1_d4", "w1_d5"]
}

export interface WorkoutSetLog {
  setNumber: number;
  weight: number;
  weightUnit?: WeightUnit;
  reps: number;
  rir?: number | string;
  isWarmup?: boolean;
  completed: boolean;
  timestamp: string;
}

export interface WorkoutExerciseLog {
  exerciseId: string;
  exerciseName: string;
  muscleGroup?: MuscleGroup;
  weightUnit?: WeightUnit;
  sets: WorkoutSetLog[];
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  dayId: string;
  weekNumber?: number;
  dayNumber?: number;
  dayKey?: string;
  dayTitle: string;
  startTime: string;
  endTime?: string;
  durationSeconds: number;
  exercises: WorkoutExerciseLog[];
  totalVolumeKg: number;
  totalSetsCompleted: number;
  notes?: string;
  rating?: number; // 1 to 5
}

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: MuscleGroup;
  maxWeight: number; // Max weight lifted
  weightUnit?: WeightUnit; // 'kg' | 'lbs'
  repsAtMaxWeight: number;
  estimated1RM: number; // Calculated 1RM
  achievedDate: string;
  history: {
    date: string;
    weight: number;
    weightUnit?: WeightUnit;
    reps: number;
    estimated1RM: number;
  }[];
}

export interface UserProfile {
  name: string;
  age: number;
  weightKg: number;
  heightCm: number;
  goal: 'hipertrofia_limpia' | 'mantenimiento' | 'definicion';
  activityFactor: number;
  customCalories?: number;
  customProteinG?: number;
  customCarbsG?: number;
  customFatsG?: number;
}

export interface ContingencyItem {
  id: string;
  muscleGroup: MuscleGroup;
  primaryMachine: string;
  primaryExercise: string;
  alternative: string;
  altEquipment: 'Mancuerna' | 'Barra' | 'Polea' | 'Máquina Alternativa' | 'Peso Corporal';
  biomechanicalLogic: string;
  smartFitTip: string;
}

export interface BodyWeightLog {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  notes?: string;
  time?: string;
}
