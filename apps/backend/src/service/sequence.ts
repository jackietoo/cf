import { eq, sql } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { sequences, SequenceTypeEnum, type SequenceType } from '../db';

// 定义规则类型：支持“纯数字模式”和“格式化字符串模式”
interface NumberRule {
  format: false;
}

interface StringRule {
  format: true;
  padWidth?: number;
  prefix?: string;
}

type SequenceRule = NumberRule | StringRule;

// 集中管理规则：不同的类型，可以决定是返回数字还是字符串
const SEQUENCE_RULES: Partial<Record<SequenceType, SequenceRule>> = {
  [SequenceTypeEnum.ORDER]: { format: true, padWidth: 6, prefix: 'ORD-' },
  [SequenceTypeEnum.PRODUCT]: { format: true, padWidth: 4, prefix: 'PROD-' },
} as const;

/**
 * 3. 唯一的现代化函数：使用泛型和条件类型，彻底消灭所有烦人的函数重载！
 * TS 会根据你传入的 type，自动计算返回 Promise<number> 还是 Promise<string>
 */
export async function getNextSequence<T extends SequenceType>(
  db: DrizzleD1Database,
  type: T,
): Promise<
  // 默认为 number
  T extends keyof typeof SEQUENCE_RULES
    ? (typeof SEQUENCE_RULES)[T] extends { format: true }
      ? string
      : number
    : number
> {
  const rule = SEQUENCE_RULES[type] || { format: false };

  // 1. 数据库原子自增逻辑

  // 1. 先尝试直接自增更新
  const updated = await db
    .update(sequences)
    .set({ currentValue: sql`${sequences.currentValue} + ${sequences.step}` })
    .where(eq(sequences.type, type))
    .returning({ currentValue: sequences.currentValue })
    .get();

  let rawValue: number;

  // 2. 如果记录不存在（说明是第一次使用该类型）
  if (!updated) {
    // 尝试插入初始记录（并发时如果别人先插了，onConflictDoNothing 会安全跳过）
    await db.insert(sequences).values({ type, currentValue: 0, step: 1 }).onConflictDoNothing();

    // 必须重新执行一次 update，让数据库安全地把值递增并返回最新值
    const retryUpdated = await db
      .update(sequences)
      .set({ currentValue: sql`${sequences.currentValue} + ${sequences.step}` })
      .where(eq(sequences.type, type))
      .returning({ currentValue: sequences.currentValue })
      .get();
    rawValue = retryUpdated!.currentValue;
  } else {
    rawValue = updated.currentValue;
  }

  // 2. 根据规则判断：如果需要格式化，则返回 string
  if (rule.format) {
    const strRule = rule as StringRule;
    const paddedNum = strRule.padWidth
      ? String(rawValue).padStart(strRule.padWidth, '0')
      : String(rawValue);
    const result = strRule.prefix ? `${strRule.prefix}${paddedNum}` : paddedNum;
    return result as any;
  }

  // 3. 默认返回纯整型 number
  return rawValue as any;
}
