import { neon } from '@neondatabase/serverless';
import type { 
  UserProfile, 
  PersonalRecord, 
  WorkoutSession,
  BodyWeightLog
} from '../types/workout';

declare const __NEON_DATABASE_URL__: string | undefined;

// Connection string from Vite define, env, or verified Neon cloud endpoint
const connectionString = 
  (typeof __NEON_DATABASE_URL__ !== 'undefined' && __NEON_DATABASE_URL__) ||
  import.meta.env.VITE_NEON_DATABASE_URL || 
  'postgresql://neondb_owner:npg_4CcXLBt9SOKj@ep-mute-night-ah7v3nbz-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

let sqlClient: ReturnType<typeof neon> | null = null;

try {
  sqlClient = neon(connectionString);
} catch (e) {
  console.warn('Neon client initialization error:', e);
}


export const checkNeonHealth = async (): Promise<{ ok: boolean; latencyMs: number; error?: string }> => {
  if (!sqlClient) return { ok: false, latencyMs: 0, error: 'Cliente Neon no inicializado' };
  const start = Date.now();
  try {
    const res = (await sqlClient`SELECT 1 as ping;`) as any[];
    const latencyMs = Date.now() - start;
    return { ok: Array.isArray(res) && res.length > 0, latencyMs };
  } catch (err: any) {
    return { ok: false, latencyMs: Date.now() - start, error: err.message || 'Error de conexión' };
  }
};

// Profile Sync
export const cloudFetchProfile = async (): Promise<UserProfile | null> => {
  if (!sqlClient) return null;
  try {
    const rows = (await sqlClient`
      SELECT name, age, weight_kg, height_cm, goal, activity_factor 
      FROM user_profile 
      WHERE id = 'default_user' 
      LIMIT 1;
    `) as any[];
    if (!Array.isArray(rows) || rows.length === 0) return null;
    const r = rows[0];
    return {
      name: r.name,
      age: Number(r.age),
      weightKg: Number(r.weight_kg),
      heightCm: Number(r.height_cm),
      goal: r.goal,
      activityFactor: Number(r.activity_factor)
    };
  } catch (err) {
    console.error('Error fetching profile from Neon:', err);
    return null;
  }
};

export const cloudSaveProfile = async (profile: UserProfile): Promise<boolean> => {
  if (!sqlClient) return false;
  try {
    await sqlClient`
      INSERT INTO user_profile (id, name, age, weight_kg, height_cm, goal, activity_factor, updated_at)
      VALUES (
        'default_user', 
        ${profile.name}, 
        ${profile.age}, 
        ${profile.weightKg}, 
        ${profile.heightCm}, 
        ${profile.goal}, 
        ${profile.activityFactor}, 
        CURRENT_TIMESTAMP
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        age = EXCLUDED.age,
        weight_kg = EXCLUDED.weight_kg,
        height_cm = EXCLUDED.height_cm,
        goal = EXCLUDED.goal,
        activity_factor = EXCLUDED.activity_factor,
        updated_at = CURRENT_TIMESTAMP;
    `;
    return true;
  } catch (err) {
    console.error('Error saving profile to Neon:', err);
    return false;
  }
};

// Personal Records (Tops) Sync
export const cloudFetchPRs = async (): Promise<Record<string, PersonalRecord> | null> => {
  if (!sqlClient) return null;
  try {
    const rows = (await sqlClient`
      SELECT exercise_id, exercise_name, muscle_group, max_weight, reps_at_max_weight, estimated_1rm, achieved_date, history
      FROM personal_records;
    `) as any[];
    if (!Array.isArray(rows)) return null;
    const prs: Record<string, PersonalRecord> = {};
    rows.forEach((r: any) => {
      prs[r.exercise_id] = {
        exerciseId: r.exercise_id,
        exerciseName: r.exercise_name,
        muscleGroup: r.muscle_group,
        maxWeight: Number(r.max_weight),
        repsAtMaxWeight: Number(r.reps_at_max_weight),
        estimated1RM: Number(r.estimated_1rm),
        achievedDate: typeof r.achieved_date === 'string' ? r.achieved_date.split('T')[0] : new Date(r.achieved_date).toISOString().split('T')[0],
        history: typeof r.history === 'string' ? JSON.parse(r.history) : (r.history || [])
      };
    });
    return prs;
  } catch (err) {
    console.error('Error fetching PRs from Neon:', err);
    return null;
  }
};

export const cloudSavePR = async (pr: PersonalRecord): Promise<boolean> => {
  if (!sqlClient) return false;
  try {
    const historyJson = JSON.stringify(pr.history || []);
    await sqlClient`
      INSERT INTO personal_records (
        exercise_id, exercise_name, muscle_group, max_weight, reps_at_max_weight, estimated_1rm, achieved_date, history, updated_at
      )
      VALUES (
        ${pr.exerciseId}, 
        ${pr.exerciseName}, 
        ${pr.muscleGroup}, 
        ${pr.maxWeight}, 
        ${pr.repsAtMaxWeight}, 
        ${pr.estimated1RM}, 
        ${pr.achievedDate}, 
        ${historyJson}::jsonb, 
        CURRENT_TIMESTAMP
      )
      ON CONFLICT (exercise_id) DO UPDATE SET
        exercise_name = EXCLUDED.exercise_name,
        muscle_group = EXCLUDED.muscle_group,
        max_weight = EXCLUDED.max_weight,
        reps_at_max_weight = EXCLUDED.reps_at_max_weight,
        estimated_1rm = EXCLUDED.estimated_1rm,
        achieved_date = EXCLUDED.achieved_date,
        history = EXCLUDED.history,
        updated_at = CURRENT_TIMESTAMP;
    `;
    return true;
  } catch (err) {
    console.error('Error saving PR to Neon:', err);
    return false;
  }
};

export const cloudDeletePR = async (exerciseId: string): Promise<boolean> => {
  if (!sqlClient) return false;
  try {
    await sqlClient`DELETE FROM personal_records WHERE exercise_id = ${exerciseId};`;
    return true;
  } catch (err) {
    console.error('Error deleting PR from Neon:', err);
    return false;
  }
};

// Workout Sessions History Sync
export const cloudFetchWorkoutHistory = async (): Promise<WorkoutSession[] | null> => {
  if (!sqlClient) return null;
  try {
    const rows = (await sqlClient`
      SELECT id, day_id, day_title, start_time, end_time, duration_seconds, exercises, total_volume_kg, total_sets_completed, notes, rating
      FROM workout_sessions
      ORDER BY start_time DESC;
    `) as any[];
    if (!Array.isArray(rows)) return null;
    return rows.map((r: any) => ({
      id: r.id,
      dayId: r.day_id,
      dayTitle: r.day_title,
      startTime: r.start_time,
      endTime: r.end_time,
      durationSeconds: Number(r.duration_seconds),
      exercises: typeof r.exercises === 'string' ? JSON.parse(r.exercises) : (r.exercises || []),
      totalVolumeKg: Number(r.total_volume_kg),
      totalSetsCompleted: Number(r.total_sets_completed),
      notes: r.notes || undefined,
      rating: Number(r.rating || 5)
    }));
  } catch (err) {
    console.error('Error fetching workout history from Neon:', err);
    return null;
  }
};

export const cloudSaveWorkoutSession = async (session: WorkoutSession): Promise<boolean> => {
  if (!sqlClient) return false;
  try {
    const exercisesJson = JSON.stringify(session.exercises || []);
    await sqlClient`
      INSERT INTO workout_sessions (
        id, day_id, day_title, start_time, end_time, duration_seconds, exercises, total_volume_kg, total_sets_completed, notes, rating, created_at
      )
      VALUES (
        ${session.id},
        ${session.dayId},
        ${session.dayTitle},
        ${session.startTime},
        ${session.endTime || null},
        ${session.durationSeconds},
        ${exercisesJson}::jsonb,
        ${session.totalVolumeKg},
        ${session.totalSetsCompleted},
        ${session.notes || null},
        ${session.rating || 5},
        CURRENT_TIMESTAMP
      )
      ON CONFLICT (id) DO UPDATE SET
        notes = EXCLUDED.notes,
        rating = EXCLUDED.rating;
    `;
    return true;
  } catch (err) {
    console.error('Error saving session to Neon:', err);
    return false;
  }
};

export const cloudDeleteWorkoutSession = async (sessionId: string): Promise<boolean> => {
  if (!sqlClient) return false;
  try {
    await sqlClient`DELETE FROM workout_sessions WHERE id = ${sessionId};`;
    return true;
  } catch (err) {
    console.error('Error deleting session from Neon:', err);
    return false;
  }
};

// Body Weight Tracking Sync
export const cloudFetchBodyWeightLogs = async (): Promise<BodyWeightLog[] | null> => {
  if (!sqlClient) return null;
  try {
    const rows = (await sqlClient`
      SELECT id, date, weight_kg, notes
      FROM body_weight_logs
      ORDER BY date DESC, created_at DESC;
    `) as any[];
    if (!Array.isArray(rows)) return null;
    return rows.map((r: any) => ({
      id: r.id,
      date: typeof r.date === 'string' ? r.date.split('T')[0] : new Date(r.date).toISOString().split('T')[0],
      weightKg: Number(r.weight_kg),
      notes: r.notes || undefined
    }));
  } catch (err) {
    console.error('Error fetching body weight logs from Neon:', err);
    return null;
  }
};

export const cloudSaveBodyWeightLog = async (log: BodyWeightLog): Promise<boolean> => {
  if (!sqlClient) return false;
  try {
    await sqlClient`
      INSERT INTO body_weight_logs (id, date, weight_kg, notes, created_at)
      VALUES (${log.id}, ${log.date}, ${log.weightKg}, ${log.notes || null}, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        date = EXCLUDED.date,
        weight_kg = EXCLUDED.weight_kg,
        notes = EXCLUDED.notes;
    `;
    return true;
  } catch (err) {
    console.error('Error saving body weight log to Neon:', err);
    return false;
  }
};

export const cloudDeleteBodyWeightLog = async (id: string): Promise<boolean> => {
  if (!sqlClient) return false;
  try {
    await sqlClient`DELETE FROM body_weight_logs WHERE id = ${id};`;
    return true;
  } catch (err) {
    console.error('Error deleting body weight log from Neon:', err);
    return false;
  }
};
