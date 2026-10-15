import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = 
  process.env.VITE_NEON_DATABASE_URL || 
  process.env.DATABASE_URL || 
  process.env.POSTGRES_URL || 
  'postgresql://neondb_owner:npg_4CcXLBt9SOKj@ep-mute-night-ah7v3nbz-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

const sql = neon(connectionString);

async function resetAndSetupMinMaxDB() {
  console.log('🔌 Conectando a Neon PostgreSQL...');

  // 1. Limpiar y recrear estructura de tablas
  console.log('🧹 Limpiando base de datos previa y recreando tablas...');

  await sql`DROP TABLE IF EXISTS workout_sessions CASCADE;`;
  await sql`DROP TABLE IF EXISTS personal_records CASCADE;`;
  await sql`DROP TABLE IF EXISTS completed_exercises CASCADE;`;

  // Crear user_profile si no existe
  await sql`
    CREATE TABLE IF NOT EXISTS user_profile (
      id VARCHAR(50) PRIMARY KEY DEFAULT 'default_user',
      name TEXT NOT NULL DEFAULT 'Ikaru (UNAM)',
      age INTEGER NOT NULL DEFAULT 27,
      weight_kg NUMERIC NOT NULL DEFAULT 90.0,
      height_cm NUMERIC NOT NULL DEFAULT 175.0,
      goal TEXT NOT NULL DEFAULT 'hipertrofia_limpia',
      activity_factor NUMERIC NOT NULL DEFAULT 1.55,
      custom_calories INTEGER,
      custom_protein_g INTEGER,
      custom_carbs_g INTEGER,
      custom_fats_g INTEGER,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // Tabla: workout_sessions (Historial de Entrenamientos por Semana y Día)
  await sql`
    CREATE TABLE IF NOT EXISTS workout_sessions (
      id VARCHAR(80) PRIMARY KEY,
      day_id VARCHAR(50) NOT NULL,
      week_number INTEGER NOT NULL DEFAULT 1,
      day_number INTEGER NOT NULL DEFAULT 1,
      day_key VARCHAR(50),
      day_title TEXT NOT NULL,
      start_time TIMESTAMP WITH TIME ZONE NOT NULL,
      end_time TIMESTAMP WITH TIME ZONE,
      duration_seconds INTEGER NOT NULL DEFAULT 0,
      exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
      total_volume_kg NUMERIC NOT NULL DEFAULT 0,
      total_sets_completed INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      rating INTEGER DEFAULT 5,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // Tabla: personal_records (Tops & PRs)
  await sql`
    CREATE TABLE IF NOT EXISTS personal_records (
      exercise_id VARCHAR(80) PRIMARY KEY,
      exercise_name TEXT NOT NULL,
      muscle_group TEXT NOT NULL,
      max_weight NUMERIC NOT NULL,
      reps_at_max_weight INTEGER NOT NULL,
      estimated_1rm NUMERIC NOT NULL,
      achieved_date DATE NOT NULL,
      history JSONB NOT NULL DEFAULT '[]'::jsonb,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // Tabla: completed_exercises (Checks de rutina por día)
  await sql`
    CREATE TABLE IF NOT EXISTS completed_exercises (
      id VARCHAR(80) PRIMARY KEY,
      day_id VARCHAR(50) NOT NULL,
      exercise_id VARCHAR(80) NOT NULL,
      completed BOOLEAN NOT NULL DEFAULT true,
      completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // Tabla: body_weight_logs (Histórico de Peso Corporal)
  await sql`
    CREATE TABLE IF NOT EXISTS body_weight_logs (
      id VARCHAR(80) PRIMARY KEY,
      date DATE NOT NULL,
      weight_kg NUMERIC NOT NULL,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // Asegurar perfil
  await sql`
    INSERT INTO user_profile (id, name, age, weight_kg, height_cm, goal, activity_factor, updated_at)
    VALUES ('default_user', 'Ikaru (UNAM)', 27, 90.0, 175.0, 'hipertrofia_limpia', 1.55, CURRENT_TIMESTAMP)
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      age = EXCLUDED.age,
      weight_kg = EXCLUDED.weight_kg,
      height_cm = EXCLUDED.height_cm;
  `;

  // Asegurar registro inicial de peso corporal si no existe
  const bwCount = await sql`SELECT count(*) FROM body_weight_logs;`;
  if (Number(bwCount[0].count) === 0) {
    const today = new Date().toISOString().split('T')[0];
    await sql`
      INSERT INTO body_weight_logs (id, date, weight_kg, notes, created_at)
      VALUES ('bw_init', ${today}, 90.0, 'Peso inicial de calibración Min-Max', CURRENT_TIMESTAMP);
    `;
  }

  console.log('✅ Esquema nuevo creado correctamente en Neon.');

  // 2. Sembrar Semana 1 Día 1 (Upper 1) y Semana 1 Día 2 (Lower 1) con los datos del CSV
  console.log('📥 Insertando información real de Semana 1 Día 1 y Día 2...');

  // Día 1: Upper 1
  const sessionW1D1 = {
    id: 'session_w1_d1',
    dayId: 'w1_d1',
    weekNumber: 1,
    dayNumber: 1,
    dayKey: 'upper1',
    dayTitle: 'Semana 1 · Upper 1 (Torso & Tirón)',
    startTime: '2026-10-12T14:30:00.000Z',
    endTime: '2026-10-12T15:40:00.000Z',
    durationSeconds: 4200,
    rating: 5,
    notes: 'Inicio formal del Min-Max Program (Jeff Nippard). Primera sesión de Upper 1 completada con excelente estímulo.',
    exercises: [
      {
        exerciseId: 'barbell-incline-press',
        exerciseName: 'Barbell Incline Press',
        muscleGroup: 'Pectorales',
        sets: [
          { setNumber: 1, weight: 25, reps: 8, rir: 2, isWarmup: false, completed: true, timestamp: '2026-10-12T14:35:00.000Z' },
          { setNumber: 2, weight: 25, reps: 10, rir: 1, isWarmup: false, completed: true, timestamp: '2026-10-12T14:39:00.000Z' }
        ]
      },
      {
        exerciseId: 'pec-deck',
        exerciseName: 'Pec Deck',
        muscleGroup: 'Pectorales',
        sets: [
          { setNumber: 1, weight: 9, reps: 8, rir: 1, isWarmup: false, completed: true, timestamp: '2026-10-12T14:43:00.000Z' },
          { setNumber: 2, weight: 10, reps: 9, rir: 0, isWarmup: false, completed: true, timestamp: '2026-10-12T14:46:00.000Z' }
        ]
      },
      {
        exerciseId: 'incline-db-y-raise',
        exerciseName: 'Incline DB Y-Raise',
        muscleGroup: 'Hombros',
        sets: [
          { setNumber: 1, weight: 8, reps: 7, rir: 1, isWarmup: false, completed: true, timestamp: '2026-10-12T14:50:00.000Z' },
          { setNumber: 2, weight: 8, reps: 10, rir: 0, isWarmup: false, completed: true, timestamp: '2026-10-12T14:53:00.000Z' }
        ]
      },
      {
        exerciseId: 'pull-up-wide-grip',
        exerciseName: 'Pull-Up (Wide Grip)',
        muscleGroup: 'Espalda',
        sets: [
          { setNumber: 1, weight: 115, reps: 6, rir: 2, isWarmup: false, completed: true, timestamp: '2026-10-12T14:58:00.000Z' },
          { setNumber: 2, weight: 115, reps: 7, rir: 1, isWarmup: false, completed: true, timestamp: '2026-10-12T15:02:00.000Z' }
        ]
      },
      {
        exerciseId: 'kelso-shrug',
        exerciseName: 'Kelso Shrug',
        muscleGroup: 'Espalda',
        sets: [
          { setNumber: 1, weight: 12, reps: 8, rir: 2, isWarmup: false, completed: true, timestamp: '2026-10-12T15:07:00.000Z' },
          { setNumber: 2, weight: 12, reps: 10, rir: 1, isWarmup: false, completed: true, timestamp: '2026-10-12T15:11:00.000Z' }
        ]
      },
      {
        exerciseId: 'ez-bar-preacher-curl',
        exerciseName: 'EZ-Bar Preacher Curl',
        muscleGroup: 'Brazos',
        sets: [
          { setNumber: 1, weight: 18, reps: 8, rir: 1, isWarmup: false, completed: true, timestamp: '2026-10-12T15:16:00.000Z' },
          { setNumber: 2, weight: 18, reps: 9, rir: 0, isWarmup: false, completed: true, timestamp: '2026-10-12T15:20:00.000Z' }
        ]
      },
      {
        exerciseId: 'triceps-pressdown',
        exerciseName: 'Triceps Pressdown',
        muscleGroup: 'Brazos',
        sets: [
          { setNumber: 1, weight: 42.5, reps: 8, rir: 1, isWarmup: false, completed: true, timestamp: '2026-10-12T15:25:00.000Z' },
          { setNumber: 2, weight: 42.5, reps: 10, rir: 0, isWarmup: false, completed: true, timestamp: '2026-10-12T15:29:00.000Z' }
        ]
      },
      {
        exerciseId: 'dragon-flag',
        exerciseName: 'Dragon Flag',
        muscleGroup: 'Abdomen',
        sets: [
          { setNumber: 1, weight: 0, reps: 8, rir: 1, isWarmup: false, completed: true, timestamp: '2026-10-12T15:34:00.000Z' },
          { setNumber: 2, weight: 0, reps: 8, rir: 0, isWarmup: false, completed: true, timestamp: '2026-10-12T15:38:00.000Z' }
        ]
      }
    ]
  };

  let volW1D1 = 0;
  let setsW1D1 = 0;
  sessionW1D1.exercises.forEach(e => {
    e.sets.forEach(s => {
      volW1D1 += s.weight * s.reps;
      setsW1D1++;
    });
  });
  sessionW1D1.totalVolumeKg = volW1D1;
  sessionW1D1.totalSetsCompleted = setsW1D1;

  // Día 2: Lower 1
  const sessionW1D2 = {
    id: 'session_w1_d2',
    dayId: 'w1_d2',
    weekNumber: 1,
    dayNumber: 2,
    dayKey: 'lower1',
    dayTitle: 'Semana 1 · Lower 1 (Tren Inferior Cuádriceps & Isquios)',
    startTime: '2026-10-13T14:30:00.000Z',
    endTime: '2026-10-13T15:45:00.000Z',
    durationSeconds: 4500,
    rating: 5,
    notes: 'Segunda sesión: piernas con enfoque en flexión profunda. Sentadilla sólida y congestión máxima en femorales.',
    exercises: [
      {
        exerciseId: 'lying-leg-curl',
        exerciseName: 'Lying Leg Curl',
        muscleGroup: 'Piernas',
        sets: [
          { setNumber: 1, weight: 55, reps: 9, rir: 1, isWarmup: false, completed: true, timestamp: '2026-10-13T14:35:00.000Z' },
          { setNumber: 2, weight: 69, reps: 10, rir: 0, isWarmup: false, completed: true, timestamp: '2026-10-13T14:39:00.000Z' }
        ]
      },
      {
        exerciseId: 'squat-your-choice',
        exerciseName: 'Squat (Your Choice)',
        muscleGroup: 'Piernas',
        sets: [
          { setNumber: 1, weight: 115, reps: 8, rir: 3, isWarmup: false, completed: true, timestamp: '2026-10-13T14:46:00.000Z' },
          { setNumber: 2, weight: 120, reps: 10, rir: 2, isWarmup: false, completed: true, timestamp: '2026-10-13T14:52:00.000Z' }
        ]
      },
      {
        exerciseId: 'smith-machine-lunge',
        exerciseName: 'Smith Machine Lunge',
        muscleGroup: 'Piernas',
        sets: [
          { setNumber: 1, weight: 30, reps: 7, rir: 1, isWarmup: false, completed: true, timestamp: '2026-10-13T14:57:00.000Z' },
          { setNumber: 2, weight: 30, reps: 8, rir: 0, isWarmup: false, completed: true, timestamp: '2026-10-13T15:02:00.000Z' }
        ]
      },
      {
        exerciseId: 'leg-extension',
        exerciseName: 'Leg Extension',
        muscleGroup: 'Piernas',
        sets: [
          { setNumber: 1, weight: 85, reps: 8, rir: 1, isWarmup: false, completed: true, timestamp: '2026-10-13T15:08:00.000Z' },
          { setNumber: 2, weight: 100, reps: 8, rir: 0, isWarmup: false, completed: true, timestamp: '2026-10-13T15:12:00.000Z' }
        ]
      },
      {
        exerciseId: 'machine-hip-abduction',
        exerciseName: 'Machine Hip Abduction',
        muscleGroup: 'Piernas',
        sets: [
          { setNumber: 1, weight: 150, reps: 8, rir: 0, isWarmup: false, completed: true, timestamp: '2026-10-13T15:17:00.000Z' },
          { setNumber: 2, weight: 155, reps: 9, rir: 0, isWarmup: false, completed: true, timestamp: '2026-10-13T15:21:00.000Z' }
        ]
      },
      {
        exerciseId: 'standing-calf-raise',
        exerciseName: 'Standing Calf Raise',
        muscleGroup: 'Piernas',
        sets: [
          { setNumber: 1, weight: 60, reps: 8, rir: 1, isWarmup: false, completed: true, timestamp: '2026-10-13T15:26:00.000Z' },
          { setNumber: 2, weight: 75, reps: 10, rir: 0, isWarmup: false, completed: true, timestamp: '2026-10-13T15:30:00.000Z' }
        ]
      }
    ]
  };

  let volW1D2 = 0;
  let setsW1D2 = 0;
  sessionW1D2.exercises.forEach(e => {
    e.sets.forEach(s => {
      volW1D2 += s.weight * s.reps;
      setsW1D2++;
    });
  });
  sessionW1D2.totalVolumeKg = volW1D2;
  sessionW1D2.totalSetsCompleted = setsW1D2;

  // Insertar ambas sesiones
  for (const s of [sessionW1D1, sessionW1D2]) {
    await sql`
      INSERT INTO workout_sessions (
        id, day_id, week_number, day_number, day_key, day_title, start_time, end_time, duration_seconds, exercises, total_volume_kg, total_sets_completed, notes, rating, created_at
      ) VALUES (
        ${s.id}, ${s.dayId}, ${s.weekNumber}, ${s.dayNumber}, ${s.dayKey}, ${s.dayTitle},
        ${s.startTime}, ${s.endTime}, ${s.durationSeconds},
        ${JSON.stringify(s.exercises)}::jsonb,
        ${s.totalVolumeKg}, ${s.totalSetsCompleted}, ${s.notes}, ${s.rating}, CURRENT_TIMESTAMP
      );
    `;

    // Marcar ejercicios como completados para estos dos días
    for (const ex of s.exercises) {
      await sql`
        INSERT INTO completed_exercises (id, day_id, exercise_id, completed, completed_at)
        VALUES (${`${s.dayId}_${ex.exerciseId}`}, ${s.dayId}, ${ex.exerciseId}, true, CURRENT_TIMESTAMP);
      `;
    }
  }

  // 3. Derivar PRs de estas dos sesiones reales
  console.log('🏆 Derivando récords personales (PRs) de Semana 1 Día 1 y Día 2...');
  const allCompletedSessions = [sessionW1D1, sessionW1D2];
  const prs = {};

  for (const s of allCompletedSessions) {
    const sDate = s.startTime.split('T')[0];
    for (const ex of s.exercises) {
      if (!prs[ex.exerciseId]) {
        prs[ex.exerciseId] = {
          exerciseId: ex.exerciseId,
          exerciseName: ex.exerciseName,
          muscleGroup: ex.muscleGroup || 'Full Body',
          maxWeight: 0,
          repsAtMaxWeight: 0,
          estimated1rm: 0,
          achievedDate: sDate,
          history: []
        };
      }
      for (const set of ex.sets) {
        if (set.completed && set.weight > 0 && set.reps > 0) {
          const e1rm = Math.round(set.weight * (1 + set.reps / 30) * 10) / 10;
          const cur = prs[ex.exerciseId];
          if (e1rm > cur.estimated1rm || (e1rm === cur.estimated1rm && set.weight > cur.maxWeight)) {
            cur.maxWeight = set.weight;
            cur.repsAtMaxWeight = set.reps;
            cur.estimated1rm = e1rm;
            cur.achievedDate = sDate;
          }
          cur.history.push({
            date: sDate,
            weight: set.weight,
            reps: set.reps,
            estimated1RM: e1rm
          });
        }
      }
    }
  }

  for (const pr of Object.values(prs)) {
    await sql`
      INSERT INTO personal_records (
        exercise_id, exercise_name, muscle_group, max_weight, reps_at_max_weight, estimated_1rm, achieved_date, history, updated_at
      ) VALUES (
        ${pr.exerciseId}, ${pr.exerciseName}, ${pr.muscleGroup}, ${pr.maxWeight}, ${pr.repsAtMaxWeight},
        ${pr.estimated1rm}, ${pr.achievedDate}, ${JSON.stringify(pr.history)}::jsonb, CURRENT_TIMESTAMP
      );
    `;
  }

  console.log(`🎉 Configuración de base de datos terminada con éxito:`);
  console.log(` - 2 sesiones en vivo guardadas (Semana 1 Día 1 y Día 2)`);
  console.log(` - ${Object.keys(prs).length} récords personales derivados`);
  console.log(` - Días restantes (Día 3, 4, 5 y Semanas 2-12) completamente limpios.`);
}

resetAndSetupMinMaxDB().catch(console.error);
