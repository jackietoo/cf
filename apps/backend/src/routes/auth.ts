import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { drizzle } from 'drizzle-orm/d1';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, verifyPassword } from '../utils/crypto';
import { createRouter, SESSION_COOKIE_NAME, SESSION_TTL_SECONDS } from '../types';

const authRouter = createRouter();


// 1. 用户注册
authRouter.post('/register', async (c) => {
    const { username, password } = await c.req.json<{ username?: string; password?: string }>();
    if (!username || !password) return c.json({ error: 'Username and password required' }, 400);

    const db = drizzle(c.env.DB);
    const existing = await db.select().from(users).where(eq(users.username, username)).get();
    if (existing) return c.json({ error: 'User already exists' }, 400);

    const passwordHash = await hashPassword(password);

    await db.insert(users).values({ username: username, passwordHash: passwordHash });
    return c.json({ success: true, message: 'Registered successfully' }, 201);
});

// 2. 用户登录
authRouter.post('/login', async (c) => {
    const { username, password } = await c.req.json<{ username?: string; password?: string }>();
    if (!username || !password) return c.json({ error: 'Username and password required' }, 400);

    const db = drizzle(c.env.DB);
    const user = await db.select().from(users).where(eq(users.username, username)).get();

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
        return c.json({ error: 'Invalid username or password' }, 401);
    }

    // 1. 准备要存入 KV 的用户会话数据
    const sessionData = {
        userId: user.id,
        username: user.username,
    };

    // 2. 生成随机 Session ID
    const sessionId = crypto.randomUUID();

    // 3. 将会话存入 KV，并设置过期时间 (TTL)
    await c.env.MY_KV.put(
        `session:${sessionId}`,
        JSON.stringify(sessionData),
        { expirationTtl: SESSION_TTL_SECONDS }
    );

    // 4. 将 Session ID 设置到客户端 Cookie 中 (HttpOnly 安全)
    setCookie(c, SESSION_COOKIE_NAME, sessionId, {
        path: '/',
        httpOnly: true,
        secure: false,   // 生产环境建议开启
        sameSite: 'Lax',
        maxAge: SESSION_TTL_SECONDS,
    });

    return c.json({ success: true, message: 'Login successful' }, 200);
});

// 3. 用户登出（清除 KV 和 Cookie）
authRouter.post('/logout', async (c) => {

    const sessionId = getCookie(c, SESSION_COOKIE_NAME);
    if (!sessionId) {
        return c.json({ error: 'Unauthorized: No session provided' }, 401);
    }
    await c.env.MY_KV.delete(`session:${sessionId}`);

    // 简化处理：如果你有引入 getCookie 也可以用 getCookie(c, SESSION_COOKIE_NAME)
    deleteCookie(c, SESSION_COOKIE_NAME, { path: '/' });

    return c.json({ success: true, message: 'Logged out successfully' }, 200);
});

export default authRouter;