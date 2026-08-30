import { neon } from '@neondatabase/serverless';

const connectionString = 'postgresql://neondb_owner:npg_4CcXLBt9SOKj@ep-mute-night-ah7v3nbz-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(connectionString);

async function addBodyWeightTable() {
  console.log('📦 Creando tabla body_weight_logs en Neon...');
  await sql`
    CREATE TABLE IF NOT EXISTS body_weight_logs (
      id VARCHAR(80) PRIMARY KEY,
      date DATE NOT NULL,
      weight_kg NUMERIC NOT NULL,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // Seed today's weight log if empty
  const count = await sql`SELECT count(*) FROM body_weight_logs;`;
  if (Number(count[0].count) === 0) {
    const today = new Date().toISOString().split('T')[0];
    await sql`
      INSERT INTO body_weight_logs (id, date, weight_kg, notes, created_at)
      VALUES (${`bw_${Date.now()}`}, ${today}, 90, 'Peso inicial de calibración', CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO NOTHING;
    `;
  }

  console.log('✅ Tabla body_weight_logs lista en Neon.');
}

addBodyWeightTable();
