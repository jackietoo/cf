import { applyD1Migrations } from 'cloudflare:test'; // <--- 必须导入这个
import { env } from 'cloudflare:workers';
import { drizzle } from 'drizzle-orm/d1';
import { beforeEach, describe, it } from 'vitest';
import { SequenceTypeEnum } from '../db';
import { getNextSequence } from './sequence';

describe('Sequence Generator Tests', () => {
  beforeEach(async () => {
    // 传入数据库实例和配置好的迁移对象
    // @ts-ignore
    await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);
  });

  it('should generate correct values and types for all enums', async () => {
    const db = drizzle(env.DB);

    // 1. 测试 USER
    let userResult = await getNextSequence(db, SequenceTypeEnum.USER);
    console.log('USER Result:', userResult, '| Type:', typeof userResult);
    userResult = await getNextSequence(db, SequenceTypeEnum.USER);
    console.log('USER Result:', userResult, '| Type:', typeof userResult);

    // 2. 测试 ORDER
    let orderResult = await getNextSequence(db, SequenceTypeEnum.ORDER);
    console.log('ORDER Result:', orderResult, '| Type:', typeof orderResult);

    // 3. 测试 PRODUCT
    let productResult = await getNextSequence(db, SequenceTypeEnum.PRODUCT);
    console.log('PRODUCT Result:', productResult, '| Type:', typeof productResult);
  });
});
