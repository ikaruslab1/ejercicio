import { neon } from '@neondatabase/serverless';

const connectionString = 'postgresql://neondb_owner:npg_4CcXLBt9SOKj@ep-mute-night-ah7v3nbz-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(connectionString);

async function seedInitialCloudData() {
  console.log('🌱 Sincronizando datos base a Neon PostgreSQL...');

  // 1. Guardar Perfil
  await sql`
    INSERT INTO user_profile (id, name, age, weight_kg, height_cm, goal, activity_factor, updated_at)
    VALUES ('default_user', 'Ikaru (UNAM)', 27, 90, 175, 'hipertrofia_limpia', 1.55, CURRENT_TIMESTAMP)
    ON CONFLICT (id) DO NOTHING;
  `;

  // 2. Tops / PRs se derivan dinámicamente de workout_sessions si existen
  console.log('📊 Verificando PRs desde las sesiones existentes...');

  const resPRs = await sql`SELECT count(*) FROM personal_records;`;
  const resProfile = await sql`SELECT * FROM user_profile;`;

  console.log(`✅ Datos sincronizados. Tops en nube: ${resPRs[0].count}`);
  console.log('👤 Perfil en Neon:', resProfile[0]);
}

seedInitialCloudData();
