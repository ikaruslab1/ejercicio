export type MuscleGroup = 'Pectorales' | 'Espalda' | 'Hombros' | 'Piernas' | 'Brazos' | 'Abdomen' | 'Full Body';

export interface ExerciseSet {
  setNumber: number;
  weight: number; // in kg
  reps: number;
  rir?: number;
  completed: boolean;
  isPR?: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  machine: string;
  zone: string;
  zoneColor?: string; // e.g. Amarillo, Rojo, Gris, Verde, Azul
  sets: string; // "3 x 8-10"
  targetSets: number;
  targetReps: string;
  rir: string;
  note: string;
  cue: string; // biomechanical cue
  imageQuery: string;
  tempo?: string; // e.g. 3-0-1-0
}

export interface RoutineDay {
  id: string;
  dayNumber: number;
  title: string;
  subtitle: string;
  tags: string[];
  color: string;
  accentColor: string;
  focus: string;
  estimatedDurationMin: number;
  exercises: Exercise[];
}

export interface WorkoutSetLog {
  setNumber: number;
  weight: number;
  reps: number;
  rir?: number;
  completed: boolean;
  timestamp: string;
}

export interface WorkoutExerciseLog {
  exerciseId: string;
  exerciseName: string;
  machine: string;
  sets: WorkoutSetLog[];
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  dayId: string;
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
  maxWeight: number; // Max weight lifted in kg
  repsAtMaxWeight: number;
  estimated1RM: number; // Calculated 1RM
  achievedDate: string;
  history: {
    date: string;
    weight: number;
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
