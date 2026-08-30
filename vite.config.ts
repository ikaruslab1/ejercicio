import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const NEON_DB_URL = 
  process.env.VITE_NEON_DATABASE_URL || 
  process.env.DATABASE_URL || 
  process.env.POSTGRES_URL || 
  'postgresql://neondb_owner:npg_4CcXLBt9SOKj@ep-mute-night-ah7v3nbz-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  define: {
    '__NEON_DATABASE_URL__': JSON.stringify(NEON_DB_URL)
  }
});


