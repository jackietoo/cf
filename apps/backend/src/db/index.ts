import { drizzle } from 'drizzle-orm/d1';

export * from './sequences';
export * from './customers';
export * from './users';

export function getDb(env: Env) {
  return drizzle(env.DB, {
    logger: true,
  });
}
