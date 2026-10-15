import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/*.ts',
  out: './migrations',
  dialect: 'sqlite', // Cloudflare D1 属于 SQLite 架构
});
