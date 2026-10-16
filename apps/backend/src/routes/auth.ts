import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { users } from '../db';
import { createRouter, SESSION_COOKIE_NAME, SESSION_TTL_SECONDS } from '../types';
import { hashPassword, verifyPassword } from '../utils/crypto';
import { fail, ok } from '../utils/response';

const authRouter = createRouter()
  // 1. 用户注册
  .post('/register', async (c) => {
    const { username, password } = await c.req.json<{ username?: string; password?: string }>();
    if (!username || !password) return fail(c, 'Username and password required', undefined, 400);

    const db = drizzle(c.env.DB);
    const existing = await db.select().from(users).where(eq(users.username, username)).get();
    if (existing) return fail(c, 'User already exists', undefined, 400);

    const passwordHash = await hashPassword(password);

    await db.insert(users).values({ username: username, passwordHash: passwordHash });
    return ok(c, 'Registered successfully');
  })

  // 2. 用户登录
  .post('/login', async (c) => {
    const { username, password } = await c.req.json<{ username?: string; password?: string }>();
    if (!username || !password) return fail(c, 'Username and password required', undefined, 400);

    const db = drizzle(c.env.DB);
    const user = await db.select().from(users).where(eq(users.username, username)).get();

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return fail(c, 'Invalid username or password', undefined, 401);
    }

    // 1. 准备要存入 KV 的用户会话数据
    const sessionData = {
      userId: user.id,
      username: user.username,
    };

    // 2. 生成随机 Session ID
    const sessionId = crypto.randomUUID();

    // 3. 将会话存入 KV，并设置过期时间 (TTL)
    await c.env.MY_KV.put(`session:${sessionId}`, JSON.stringify(sessionData), {
      expirationTtl: SESSION_TTL_SECONDS,
    });

    // 4. 将 Session ID 设置到客户端 Cookie 中 (HttpOnly 安全)
    setCookie(c, SESSION_COOKIE_NAME, sessionId, {
      path: '/',
      httpOnly: true,
      secure: c.req.url.startsWith('https://'),
      sameSite: 'Lax',
      maxAge: SESSION_TTL_SECONDS,
    });

    return ok(c, 'Login successful');
  })

  // 3. 用户登出（清除 KV 和 Cookie）
  .post('/logout', async (c) => {
    const sessionId = getCookie(c, SESSION_COOKIE_NAME);
    if (!sessionId) {
      return fail(c, 'Unauthorized: No session provided', null, 401);
    }
    await c.env.MY_KV.delete(`session:${sessionId}`);

    // 简化处理：如果你有引入 getCookie 也可以用 getCookie(c, SESSION_COOKIE_NAME)
    deleteCookie(c, SESSION_COOKIE_NAME, { path: '/' });
    return ok(c, 'Logout successful');
  });

export default authRouter;
