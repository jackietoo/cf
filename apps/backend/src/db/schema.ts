// import { inspect } from 'node:util'; // 1. 导入 Node.js 的 inspect
import BigNumber from 'bignumber.js';
import dayjs, { type Dayjs } from 'dayjs'; // 1. 补全 Dayjs 类型导入
import { customType, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// 自定义 ISO 格式无时区本地时间类型
export const isoLocalDateTime = customType<{ data: Dayjs; driverData: string }>({
  dataType() {
    return 'text';
  },
  // 写入 SQLite：统一格式化为 ISO 无偏本地时间字符串 'YYYY-MM-DDTHH:mm:ss'
  toDriver(value: Dayjs): string {
    return value.format('YYYY-MM-DDTHH:mm:ss');
  },
  // 从 SQLite 读取：自动解析为 Day.js 对象
  fromDriver(value: string): Dayjs {
    const d = dayjs(value);
    const formattedStr = d.format('YYYY-MM-DDTHH:mm:ss');

    // 2. 挂载 toJSON：用于 JSON.stringify() 和 API 接口返回 JSON 时自动格式化
    d.toJSON = () => formattedStr;

    // 3. 挂载 inspect.custom：专门用于 console.log() 控制台打印时直接输出格式化文本
    // (d as any)[inspect.custom] = () => formattedStr;

    return d;
  },
});

// 声明类型：data 可以为 BigNumber 或 null
export const bignumberText = customType<{ data: BigNumber | null; driverData: string | null }>({
  dataType() {
    return 'text';
  },
  // 写入 SQLite：如果入参为空/null，写入 null，否则转字符串
  toDriver(value: BigNumber | null | undefined): string | null {
    if (value === null || value === undefined) {
      return null;
    }
    return value.toString();
  },
  // 从 SQLite 读取：如果数据库存的是 null 或空串，直接返回 null
  fromDriver(value: string | null | undefined): BigNumber | null {
    if (value === null || value === undefined || value.trim() === '') {
      return null;
    }

    const bn = new BigNumber(value);

    // 1. JSON 序列化优化（用于 JSON.stringify 和 API 接口返回）
    bn.toJSON = () => bn.toString();

    // 2. Node.js console.log 优化（避免控制台展开输出 BigNumber 的内部复杂属性）
    // (bn as any)[inspect.custom] = () => bn.toString();

    return bn;
  },
});

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

  // 创建时间：新增时设置一次
  createdAt: isoLocalDateTime('created_at')
    .notNull()
    .$defaultFn(() => dayjs()),

  // 更新时间：新增时设置，后续每次执行 update() 时自动调用 $onUpdateFn 刷新
  updatedAt: isoLocalDateTime('updated_at')
    .notNull()
    .$defaultFn(() => dayjs())
    .$onUpdateFn(() => dayjs()),
});

// 2. 文章表 (带关联外键)
export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  content: text('content'),
  authorId: integer('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});
