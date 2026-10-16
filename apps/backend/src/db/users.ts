import dayjs from 'dayjs';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { isoLocalDateTime } from './columns';

// 1. 定义常量数组并使用 as const 断言
export const UserRoles = ['admin', 'user', 'guest'] as const;

// 2. 自动提取 TypeScript 联合类型 ('admin' | 'user' | 'guest')
export type UserRole = (typeof UserRoles)[number];

// 3. 使用示例
// let myRole: UserRole = 'admin'; // 完美提示与校验！

// 1. 字典映射对象
export const UserRoleMap = {
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest',
} as const;

// 2. 类型 (加 Type 后缀，绝对不会和变量混淆)
export type UserRoleType = (typeof UserRoleMap)[keyof typeof UserRoleMap];

// 3. 数组 (加 List 后缀)
export const UserRoleList = Object.values(UserRoleMap) as [UserRoleType, ...UserRoleType[]];

export const UserStatusEnum = {
  INACTIVE: 0, // 未激活
  ACTIVE: 1, // 正常/已激活
  FROZEN: 2, // 冻结/禁用
  DELETED: 3, // 注销
} as const;
// 2. 用户状态类型
export type UserStatusType = (typeof UserStatusEnum)[keyof typeof UserStatusEnum];
// 3. 数组 (加 List 后缀)
export const UserStatusList = Object.values(UserStatusEnum) as [
  UserStatusType,
  ...UserStatusType[],
];

// 1. 用户表
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(), // 用于登录或唯一标识的账号
  name: text('name'), // 用于界面展示的昵称/姓名
  phone: text('phone'),
  email: text('email'),
  passwordHash: text('password_hash'),

  // 2. 存储为 integer，限定值为 UserStatus 枚举
  status: integer('status').$type<UserStatusType>().notNull().default(UserStatusEnum.INACTIVE),

  role: text('role', { enum: UserRoles }),
  userRole: text('user_role', { enum: UserRoleList }).$type<UserRoleType>(),

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
