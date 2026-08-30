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

  // 2. Guardar Tops Iniciales
  const initialPRs = [
    {
      id: '1-1',
      name: 'Chest Press',
      muscle: 'Pectorales',
      maxWeight: 75,
      reps: 8,
      e1rm: 95,
      date: '2026-08-22',
      history: [
        { date: '2026-08-15', weight: 70, reps: 10, estimated1RM: 93.3 },
        { date: '2026-08-22', weight: 75, reps: 8, estimated1RM: 95 }
      ]
    },
    {
      id: '2-1',
      name: 'Lat Pulldown',
      muscle: 'Espalda',
      maxWeight: 68,
      reps: 10,
      e1rm: 90.7,
      date: '2026-08-23',
      history: [
        { date: '2026-08-16', weight: 63.5, reps: 12, estimated1RM: 88.9 },
        { date: '2026-08-23', weight: 68, reps: 10, estimated1RM: 90.7 }
      ]
    },
    {
      id: '4-1',
      name: 'Linear Hack Squat',
      muscle: 'Piernas',
      maxWeight: 120,
      reps: 8,
      e1rm: 152,
      date: '2026-08-25',
      history: [
        { date: '2026-08-18', weight: 110, reps: 10, estimated1RM: 146.7 },
        { date: '2026-08-25', weight: 120, reps: 8, estimated1RM: 152 }
      ]
    },
    {
      id: '3-1',
      name: 'Shoulder Press',
      muscle: 'Hombros',
      maxWeight: 45,
      reps: 10,
      e1rm: 60,
      date: '2026-08-24',
      history: [
        { date: '2026-08-24', weight: 45, reps: 10, estimated1RM: 60 }
      ]
    },
    {
      id: '5-1',
      name: 'Copa con Mancuerna',
      muscle: 'Brazos',
      maxWeight: 28,
      reps: 12,
      e1rm: 39.2,
      date: '2026-08-26',
      history: [
        { date: '2026-08-26', weight: 28, reps: 12, estimated1RM: 39.2 }
      ]
    }
  ];

  for (const pr of initialPRs) {
    await sql`
      INSERT INTO personal_records (
        exercise_id, exercise_name, muscle_group, max_weight, reps_at_max_weight, estimated_1rm, achieved_date, history, updated_at
      )
      VALUES (
        ${pr.id}, ${pr.name}, ${pr.muscle}, ${pr.maxWeight}, ${pr.reps}, ${pr.e1rm}, ${pr.date}, ${JSON.stringify(pr.history)}::jsonb, CURRENT_TIMESTAMP
      )
      ON CONFLICT (exercise_id) DO NOTHING;
    `;
  }

  const resPRs = await sql`SELECT count(*) FROM personal_records;`;
  const resProfile = await sql`SELECT * FROM user_profile;`;

  console.log(`✅ Datos sincronizados. Tops en nube: ${resPRs[0].count}`);
  console.log('👤 Perfil en Neon:', resProfile[0]);
}

seedInitialCloudData();
