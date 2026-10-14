// src/utils/password.ts

/**
 * 生成 16 字节加密随机盐值
 */
function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBuffer(hex: string): Uint8Array {
  const match = hex.match(/.{1,2}/g);
  return new Uint8Array(match ? match.map((byte) => parseInt(byte, 16)) : []);
}

/**
 * 生成带盐的密码 Hash
 * 格式: "salt_hex:hash_hex"
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = generateSalt();
  const encoder = new TextEncoder();

  // 1. 导入明文密码
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password) as BufferSource,
    'PBKDF2',
    false,
    ['deriveBits']
  );

  // 2. PBKDF2 导出比特（OWASP 推荐 210,000+ 次迭代）
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 1000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256 // 256 bits = 32 bytes
  );

  const saltHex = bufferToHex(salt.buffer as ArrayBuffer);
  const hashHex = bufferToHex(derivedBits);

  return `${saltHex}:${hashHex}`;
}

/**
 * 校验用户输入的密码与数据库存储的 Hash 是否匹配
 */
export async function verifyPassword(password: string, storedHash: string| null | undefined): Promise<boolean> {
  if (!storedHash || !storedHash.includes(':')) {
    return false;
  }

  const [saltHex, originalHashHex] = storedHash.split(':');
  const salt = hexToBuffer(saltHex);
  const encoder = new TextEncoder();

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password) as BufferSource,
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 1000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  const newHashHex = bufferToHex(derivedBits);

  // 防时序攻击（Timing Attack）对比
  return timingSafeEqual(newHashHex, originalHashHex);
}

/**
 * 安全的恒定时间字符串比较
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}