import BigNumber from 'bignumber.js';
import dayjs, { type Dayjs } from 'dayjs';
import { customType } from 'drizzle-orm/sqlite-core';

export const isoLocalDate = customType<{ data: Dayjs; driverData: string }>({
  dataType() {
    return 'text';
  },
  // 写入 SQLite：统一格式化为 ISO 无偏本地时间字符串 'YYYY-MM-DDTHH:mm:ss'
  toDriver(value: Dayjs): string {
    return value.format('YYYY-MM-DD');
  },
  // 从 SQLite 读取：自动解析为 Day.js 对象
  fromDriver(value: string): Dayjs {
    const d = dayjs(value);
    const formattedStr = d.format('YYYY-MM-DD');

    // 2. 挂载 toJSON：用于 JSON.stringify() 和 API 接口返回 JSON 时自动格式化
    d.toJSON = () => formattedStr;

    // 3. 挂载 inspect.custom：专门用于 console.log() 控制台打印时直接输出格式化文本
    // (d as any)[inspect.custom] = () => formattedStr;

    return d;
  },
});

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
