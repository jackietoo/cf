import { describe, it, expect } from 'vitest'; // 若使用 Jest，直接去掉此行导入即可
import { hashPassword, verifyPassword } from './crypto';

describe('Password Utility', () => {
  it('应该能成功生成 Hash 并通过密码校验', async () => {
    const rawPassword = 'MySecurePassword123!';

    // 1. 生成 Hash
    const hash = await hashPassword(rawPassword);
    console.log('Generated Hash:', hash);

    // 校验 Hash 结构 (salt_hex:hash_hex)
    expect(hash).toMatch(/^[0-9a-f]{32}:[0-9a-f]{64}$/i);

    // 2. 校验正确密码
    const isValid = await verifyPassword(rawPassword, hash);
    expect(isValid).toBe(true);
  });

  it('错误密码校验时应返回 false', async () => {
    const rawPassword = 'MySecurePassword123!';
    const wrongPassword = 'WrongPassword456!';

    const hash = await hashPassword(rawPassword);
    const isValid = await verifyPassword(wrongPassword, hash);

    expect(isValid).toBe(false);
  });

  it('相同密码每次生成的 Hash 应不同（因为加盐）', async () => {
    const rawPassword = 'SamePassword123!';

    const hash1 = await hashPassword(rawPassword);
    const hash2 = await hashPassword(rawPassword);

    // 格式不同/盐值不同
    expect(hash1).not.toBe(hash2);

    // 但各自都能验证通过
    expect(await verifyPassword(rawPassword, hash1)).toBe(true);
    expect(await verifyPassword(rawPassword, hash2)).toBe(true);
  });

  it('对畸形或无效的 storedHash 应安全返回 false', async () => {
    const password = 'MySecurePassword123!';

    expect(await verifyPassword(password, '')).toBe(false);
    expect(await verifyPassword(password, 'invalidhashformat')).toBe(false);
    expect(await verifyPassword(password, '1234:5678')).toBe(false);
  });
});