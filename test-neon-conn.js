import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

const conn = process.env.VITE_NEON_DATABASE_URL || process.env.DATABASE_URL;
console.log('Connecting to Neon...');
const sql = neon(conn);

async function test() {
  try {
    const res = await sql`SELECT current_database(), current_user, version();`;
    console.log('Neon connected successfully:', res[0]);

    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    console.log('Existing public tables:');
    for (const t of tables) {
      const count = await sql([`SELECT count(*) FROM "${t.table_name}";`]);
      console.log(` - ${t.table_name}: ${count[0].count} rows`);
    }
  } catch (err) {
    console.error('Error connecting to Neon:', err);
  }
}

test();
