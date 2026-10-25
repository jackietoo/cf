import { drizzle } from 'drizzle-orm/d1';
import * as schema from './index';

export * from './sequences';
export * from './customers';
export * from './users';
export * from './settings';

export function getDb(env: Env) {
  return drizzle(env.DB, {
    schema: {
      ...schema,
    },
    logger: true,
  });
}
