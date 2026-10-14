import { describe, it, expect } from 'vitest';
import { env } from 'cloudflare:workers'; // 👈 更改导入来源

describe('Cloudflare KV Plugin Tests', () => {
  it('should successfully write and read a key-value pair', async () => {
    const key = 'user:1001';
    const value = '张三';

    // 1. 写入 KV
    await env.MY_KV.put(key, value);

    // 2. 从 KV 读取
    const cachedValue = await env.MY_KV.get(key);
    console.log(`Cached value for key "${key}":`, cachedValue);

    // 3. 验证结果
    expect(cachedValue).toBe(value);
  });

  it('should return null when the key does not exist', async () => {
    const nonExistent = await env.MY_KV.get('non-existent-key');
    expect(nonExistent).toBeNull();
  });
});