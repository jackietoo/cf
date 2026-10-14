import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

// data为空也返回null，避免前端报错

// 成功：默认 200
export const ok = <T>(c: Context, message: string, data?: T, status: ContentfulStatusCode = 200) => {
    return c.json({ success: true, message, data: data ?? null }, status);
};

// 失败：默认 400，同时支持带泛型 data
export const fail = <T>(c: Context, message: string, data?: T, status: ContentfulStatusCode = 400) => {
    return c.json({ success: false, message, data: data ?? null }, status);
};
