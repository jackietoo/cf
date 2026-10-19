import { zValidator as baseZValidator } from '@hono/zod-validator';
import type { z } from 'zod'; // 改为导入 z 命名空间
import { fail } from './response';

/**
 * 通用的 Zod 校验中间件，自带友好的错误格式化
 */
export function zValidator<T extends z.ZodType>( // 将 ZodSchema 替换为 z.ZodType
  target: 'json' | 'query' | 'param' | 'form',
  schema: T,
) {
  return baseZValidator(target, schema, (result, c) => {
    if (!result.success) {
      // 提取所有校验错误并拼接成易读的字符串
      const errorMsg = result.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join('; ');

      return fail(c, `参数校验失败: ${errorMsg}`, undefined, 400);
    }
  });
}
