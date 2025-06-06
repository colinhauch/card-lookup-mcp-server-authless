import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: './src/client',
  build: {
    outDir: '../public',
    emptyOutDir: true,
  },
});
