import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: '../backend/public',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    host: 'true', // 允许局域网访问
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8787', // 你的hono后端地址
        changeOrigin: true,
      },
    },
  },
});
