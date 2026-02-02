import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['__tests__/**/*.test.{ts,tsx}', '**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'dist'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '__tests__/',
        '*.config.{ts,js}',
        '.next/',
        'dist/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': '/Users/choijunho/delete/realteeth',
      '@shared': '/Users/choijunho/delete/realteeth/shared',
      '@entities': '/Users/choijunho/delete/realteeth/entities',
      '@features': '/Users/choijunho/delete/realteeth/features',
      '@widgets': '/Users/choijunho/delete/realteeth/widgets',
    },
  },
});
