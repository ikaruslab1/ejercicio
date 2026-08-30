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

  // Seed baseline PRs for all primary exercises if missing
  const defaultPRs = [
    { id: '1-1', name: 'Chest Press', muscle: 'Pectorales', weight: 75, reps: 8, e1rm: 95, date: '2026-08-22' },
    { id: '1-2', name: 'Pectoral Fly', muscle: 'Pectorales', weight: 60, reps: 10, e1rm: 80, date: '2026-08-22' },
    { id: '1-3', name: 'Cable Crossover', muscle: 'Pectorales', weight: 22.5, reps: 12, e1rm: 31.5, date: '2026-08-22' },
    { id: '2-1', name: 'Lat Pulldown', muscle: 'Espalda', weight: 68, reps: 10, e1rm: 90.7, date: '2026-08-23' },
    { id: '2-2', name: 'Seated Row', muscle: 'Espalda', weight: 65, reps: 10, e1rm: 86.7, date: '2026-08-23' },
    { id: '2-3', name: 'Remo Unilateral', muscle: 'Espalda', weight: 32, reps: 8, e1rm: 40.5, date: '2026-08-23' },
    { id: '3-1', name: 'Shoulder Press', muscle: 'Hombros', weight: 45, reps: 10, e1rm: 60, date: '2026-08-24' },
    { id: '3-2', name: 'Cruce Poleas Bajas', muscle: 'Hombros', weight: 12.5, reps: 15, e1rm: 18.8, date: '2026-08-24' },
    { id: '3-3', name: 'Elevaciones Laterales', muscle: 'Hombros', weight: 14, reps: 12, e1rm: 19.6, date: '2026-08-24' },
    { id: '4-1', name: 'Linear Hack Squat', muscle: 'Piernas', weight: 120, reps: 8, e1rm: 152, date: '2026-08-25' },
    { id: '4-2', name: 'Seated Leg Curl', muscle: 'Piernas', weight: 60, reps: 10, e1rm: 80, date: '2026-08-25' },
    { id: '4-3', name: 'Leg Press 45°', muscle: 'Piernas', weight: 200, reps: 8, e1rm: 253.3, date: '2026-08-25' },
    { id: '4-4', name: 'Hip Thrust', muscle: 'Piernas', weight: 110, reps: 10, e1rm: 146.7, date: '2026-08-25' },
    { id: '5-1', name: 'Copa con Mancuerna', muscle: 'Brazos', weight: 28, reps: 12, e1rm: 39.2, date: '2026-08-26' },
    { id: '5-2', name: 'Bíceps Inclinado', muscle: 'Brazos', weight: 16, reps: 10, e1rm: 21.3, date: '2026-08-26' },
    { id: '5-3', name: 'Tríceps Press en Polea', muscle: 'Brazos', weight: 35, reps: 12, e1rm: 49, date: '2026-08-26' },
    { id: '5-4', name: 'Bíceps Curl Máquina', muscle: 'Brazos', weight: 40, reps: 10, e1rm: 53.3, date: '2026-08-26' }
  ];

  for (const pr of defaultPRs) {
    const history = [
      { date: pr.date, weight: pr.weight, reps: pr.reps, estimated1RM: pr.e1rm }
    ];
    await sql`
      INSERT INTO personal_records (
        exercise_id, exercise_name, muscle_group, max_weight, reps_at_max_weight, estimated_1rm, achieved_date, history, updated_at
      )
      VALUES (
        ${pr.id}, ${pr.name}, ${pr.muscle}, ${pr.weight}, ${pr.reps}, ${pr.e1rm}, ${pr.date}, ${JSON.stringify(history)}::jsonb, CURRENT_TIMESTAMP
      )
      ON CONFLICT (exercise_id) DO NOTHING;
    `;
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
