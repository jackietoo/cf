import { SettingKey } from '@workspace/shared';
import dayjs from 'dayjs';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { isoLocalDateTime } from './columns';

// 1. 设置表
export const settings = sqliteTable('settings', {
  key: text('key').primaryKey().$type<SettingKey>(),
  value: text('value').notNull(),
  description: text('description'), // 后台展示的中文说明，例如 "是否开启新用户注册"
  type: text('type').notNull().default('string'), // 控制前端渲染类型: 'boolean' | 'string'

  createdAt: isoLocalDateTime('created_at')
    .notNull()
    .$defaultFn(() => dayjs()),
  updatedAt: isoLocalDateTime('updated_at')
    .notNull()
    .$defaultFn(() => dayjs())
    .$onUpdateFn(() => dayjs()),
  createdBy: integer('created_by'),
  updatedBy: integer('updated_by'),
});
