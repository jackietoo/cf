import dayjs from 'dayjs';
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { isoLocalDateTime } from './columns';

// 枚举为字符串，需要在 ../service/sequence.ts 中配置返回的规则
export const SequenceType = {
  CUSTOMER_NO: 'CUSTOMER_NO', // 客户号 5位，前补C0
  LOAN_NO: 'LOAN_NO', // 贷款号 5位，前补L0
  ASSET_NO: 'ASSET_NO', // 资产编号
  ORDER: 'ORDER',
  PRODUCT: 'PRODUCT',
  TEST: 'TEST',
} as const;

export type SequenceType = (typeof SequenceType)[keyof typeof SequenceType];

export const sequences = sqliteTable(
  'sequences',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    type: text('type').$type<SequenceType>(),
    currentValue: integer('current_value').notNull().default(1),
    step: integer('step').notNull().default(1),

    createdAt: isoLocalDateTime('created_at')
      .notNull()
      .$defaultFn(() => dayjs()),
    updatedAt: isoLocalDateTime('updated_at')
      .notNull()
      .$defaultFn(() => dayjs())
      .$onUpdateFn(() => dayjs()),
    createdBy: integer('created_by'),
    updatedBy: integer('updated_by'),
  },
  (table) => [uniqueIndex('sequences_type_idx').on(table.type)],
);
export type Sequence = typeof sequences.$inferSelect;
export type NewSequence = typeof sequences.$inferInsert;
