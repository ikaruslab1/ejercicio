import { neon } from '@neondatabase/serverless';

const connectionString = 'postgresql://neondb_owner:npg_4CcXLBt9SOKj@ep-mute-night-ah7v3nbz-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(connectionString);

async function inspectAndSetupAll() {
  console.log('🔌 Conectando a Neon PostgreSQL...');
  
  // 1. Crear todas las tablas con DDL robusto
  console.log('📦 Verificando / Creando tablas en Neon...');

  // Tabla: user_profile
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

  // Tabla: personal_records (Tops & PRs)
  await sql`
    CREATE TABLE IF NOT EXISTS personal_records (
      exercise_id VARCHAR(50) PRIMARY KEY,
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

  // Tabla: workout_sessions (Historial de Entrenamientos)
  await sql`
    CREATE TABLE IF NOT EXISTS workout_sessions (
      id VARCHAR(80) PRIMARY KEY,
      day_id VARCHAR(50) NOT NULL,
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

  // Tabla: completed_exercises (Checks de rutina)
  await sql`
    CREATE TABLE IF NOT EXISTS completed_exercises (
      id VARCHAR(80) PRIMARY KEY,
      day_id VARCHAR(50) NOT NULL,
      exercise_id VARCHAR(50) NOT NULL,
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

  console.log('✅ Tablas verificadas en Neon.');

  // 2. Comprobar registros existentes
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `;

  console.log('\n📊 Estado de tablas en Neon:');
  for (const t of tables) {
    const tableName = t.table_name;
    if (tableName === 'user_profile') {
      const rows = await sql`SELECT count(*) FROM user_profile;`;
      console.log(` - user_profile: ${rows[0].count} registros`);
    } else if (tableName === 'personal_records') {
      const rows = await sql`SELECT count(*) FROM personal_records;`;
      console.log(` - personal_records: ${rows[0].count} registros`);
    } else if (tableName === 'workout_sessions') {
      const rows = await sql`SELECT count(*) FROM workout_sessions;`;
      console.log(` - workout_sessions: ${rows[0].count} registros`);
    } else if (tableName === 'body_weight_logs') {
      const rows = await sql`SELECT count(*) FROM body_weight_logs;`;
      console.log(` - body_weight_logs: ${rows[0].count} registros`);
    } else if (tableName === 'completed_exercises') {
      const rows = await sql`SELECT count(*) FROM completed_exercises;`;
      console.log(` - completed_exercises: ${rows[0].count} registros`);
    }
  }

  // 3. Asegurar Perfil Base y Tops
  await sql`
    INSERT INTO user_profile (id, name, age, weight_kg, height_cm, goal, activity_factor, updated_at)
    VALUES ('default_user', 'Ikaru (UNAM)', 27, 90.0, 175.0, 'hipertrofia_limpia', 1.55, CURRENT_TIMESTAMP)
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      age = EXCLUDED.age,
      weight_kg = EXCLUDED.weight_kg,
      height_cm = EXCLUDED.height_cm,
      goal = EXCLUDED.goal,
      activity_factor = EXCLUDED.activity_factor;
  `;

  // 3. Tops / PRs se derivan dinámicamente de las sesiones reales en workout_sessions
  console.log('📊 Verificando / sincronizando PRs desde sesiones reales...');
  const existingSessions = await sql`SELECT id, day_id, start_time, exercises FROM workout_sessions ORDER BY start_time ASC;`;
  if (existingSessions && existingSessions.length > 0) {
    const exTops = {};
    for (const session of existingSessions) {
      const exs = typeof session.exercises === 'string' ? JSON.parse(session.exercises) : session.exercises;
      const sDate = typeof session.start_time === 'string' ? session.start_time.split('T')[0] : new Date(session.start_time).toISOString().split('T')[0];
      for (const ex of (exs || [])) {
        if (!exTops[ex.exerciseId]) {
          exTops[ex.exerciseId] = { exerciseId: ex.exerciseId, exerciseName: ex.exerciseName, maxWeight: 0, repsAtMaxWeight: 0, estimated1rm: 0, achievedDate: sDate, history: [] };
        }
        for (const set of (ex.sets || [])) {
          const w = Number(set.weight) || 0;
          const r = Number(set.reps) || 0;
          if (w > 0 && r > 0 && set.completed !== false) {
            const e1rm = Math.round(w * (1 + r / 30) * 10) / 10;
            const cur = exTops[ex.exerciseId];
            if (w > cur.maxWeight || (w === cur.maxWeight && r > cur.repsAtMaxWeight)) {
              cur.maxWeight = w;
              cur.repsAtMaxWeight = r;
              cur.estimated1rm = e1rm;
              cur.achievedDate = sDate;
              cur.history.push({ date: sDate, weight: w, reps: r, estimated1RM: e1rm });
            }
          }
        }
      }
    }
    for (const [exId, top] of Object.entries(exTops)) {
      await sql`
        INSERT INTO personal_records (
          exercise_id, exercise_name, muscle_group, max_weight, reps_at_max_weight, estimated_1rm, achieved_date, history, updated_at
        )
        VALUES (
          ${exId}, ${top.exerciseName}, 'General', ${top.maxWeight}, ${top.repsAtMaxWeight}, ${top.estimated1rm}, ${top.achievedDate}, ${JSON.stringify(top.history)}::jsonb, CURRENT_TIMESTAMP
        )
        ON CONFLICT (exercise_id) DO UPDATE SET
          max_weight = EXCLUDED.max_weight,
          reps_at_max_weight = EXCLUDED.reps_at_max_weight,
          estimated_1rm = EXCLUDED.estimated_1rm,
          achieved_date = EXCLUDED.achieved_date,
          history = EXCLUDED.history,
          updated_at = CURRENT_TIMESTAMP;
      `;
    }
  }

  // Seed sample past workout session if empty
  const sessionCount = await sql`SELECT count(*) FROM workout_sessions;`;
  if (Number(sessionCount[0].count) === 0) {
    const sampleSession = {
      id: `session_${Date.now() - 86400000}`,
      dayId: 'd1',
      dayTitle: 'Día 1: Pectorales + abdomen',
      startTime: new Date(Date.now() - 86400000).toISOString(),
      endTime: new Date(Date.now() - 86400000 + 3600000).toISOString(),
      durationSeconds: 3600,
      totalVolumeKg: 4250,
      totalSetsCompleted: 12,
      notes: 'Gran congestión en máquina 20 y poleas',
      rating: 5,
      exercises: [
        {
          exerciseId: '1-1',
          exerciseName: 'Chest Press',
          machine: 'Máquina 20',
          sets: [
            { setNumber: 1, weight: 70, reps: 10, rir: 2, completed: true, timestamp: new Date().toISOString() },
            { setNumber: 2, weight: 75, reps: 8, rir: 2, completed: true, timestamp: new Date().toISOString() },
            { setNumber: 3, weight: 75, reps: 8, rir: 1, completed: true, timestamp: new Date().toISOString() }
          ]
        },
        {
          exerciseId: '1-2',
          exerciseName: 'Pectoral Fly',
          machine: 'Máquina 21',
          sets: [
            { setNumber: 1, weight: 55, reps: 10, rir: 2, completed: true, timestamp: new Date().toISOString() },
            { setNumber: 2, weight: 60, reps: 10, rir: 1, completed: true, timestamp: new Date().toISOString() },
            { setNumber: 3, weight: 60, reps: 8, rir: 1, completed: true, timestamp: new Date().toISOString() }
          ]
        }
      ]
    };

    await sql`
      INSERT INTO workout_sessions (
        id, day_id, day_title, start_time, end_time, duration_seconds, exercises, total_volume_kg, total_sets_completed, notes, rating, created_at
      )
      VALUES (
        ${sampleSession.id},
        ${sampleSession.dayId},
        ${sampleSession.dayTitle},
        ${sampleSession.startTime},
        ${sampleSession.endTime},
        ${sampleSession.durationSeconds},
        ${JSON.stringify(sampleSession.exercises)}::jsonb,
        ${sampleSession.totalVolumeKg},
        ${sampleSession.totalSetsCompleted},
        ${sampleSession.notes},
        ${sampleSession.rating},
        CURRENT_TIMESTAMP
      );
    `;
  }

  console.log('\n🎉 ¡Base de datos Neon PostgreSQL 100% configurada y poblada!');
}

inspectAndSetupAll();
