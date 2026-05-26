import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Fallback DATABASE_URL for unit tests to prevent crashes during import phase
process.env.DATABASE_URL =
  process.env.DATABASE_URL || 'postgres://dummy:dummy@localhost:5432/dummy';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
  },
});
