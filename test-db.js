import { neon } from '@neondatabase/serverless';

const connectionString = 'postgresql://neondb_owner:npg_4CcXLBt9SOKj@ep-mute-night-ah7v3nbz-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

const sql = neon(connectionString);

async function testConnectionAndSetup() {
  console.log('🔌 Conectando a Neon PostgreSQL...');
  try {
    const versionRes = await sql`SELECT version(), current_database(), current_user;`;
    console.log('✅ Conexión exitosa a Neon:');
    console.log(versionRes[0]);

    console.log('\n📦 Creando esquema de base de datos para Smart Fit Tracker...');

    // 1. Tabla de Perfil de Usuario
    await sql`
      CREATE TABLE IF NOT EXISTS user_profile (
        id VARCHAR(50) PRIMARY KEY DEFAULT 'default_user',
        name TEXT NOT NULL,
        age INTEGER NOT NULL,
        weight_kg NUMERIC NOT NULL,
        height_cm NUMERIC NOT NULL,
        goal TEXT NOT NULL,
        activity_factor NUMERIC NOT NULL DEFAULT 1.55,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 2. Tabla de Récords Personales (PRs / Tops)
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

    // 3. Tabla de Sesiones de Entrenamiento Históricas
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

    // 4. Tabla de Ejercicios Completados
    await sql`
      CREATE TABLE IF NOT EXISTS completed_exercises (
        id VARCHAR(80) PRIMARY KEY,
        day_id VARCHAR(50) NOT NULL,
        exercise_id VARCHAR(50) NOT NULL,
        completed BOOLEAN NOT NULL DEFAULT true,
        completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    console.log('✅ Tablas creadas / verificadas exitosamente en Neon.');

    // Count existing rows
    const prCount = await sql`SELECT count(*) FROM personal_records;`;
    const sessionCount = await sql`SELECT count(*) FROM workout_sessions;`;
    console.log(`📊 Estado actual: ${prCount[0].count} Tops registrados, ${sessionCount[0].count} Sesiones.`);

  } catch (error) {
    console.error('❌ Error al conectar a Neon:', error);
    process.exit(1);
  }
}

testConnectionAndSetup();
