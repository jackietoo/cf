// src/lib/client.ts
import type { AppType } from '@workspace/backend';
import { hc } from 'hono/client';

const API_BASE_URL = '';

/**
 * 自定义 fetch 函数，统一处理凭据和全局 401 拦截
 */
const customFetch: typeof fetch = async (input, init) => {
  const response = await window.fetch(input, {
    ...init,
    credentials: 'include', // 关键：跨域/同源携带 Cookie Session
  });
  return response;
};

// 导出强类型的 Hono RPC Client 实例
export const client = hc<AppType>(API_BASE_URL, {
  fetch: customFetch,
});
