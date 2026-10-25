import { changePasswordSchema, loginSchema, registerSchema, SettingKey } from '@workspace/shared';
import { eq } from 'drizzle-orm';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { getDb, settings, users } from '../db';
import {
  createRouter,
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
  SESSION_USER_KEY,
  type SessionUser,
} from '../types';
import { hashPassword, verifyPassword } from '../utils/crypto';
import { fail, ok } from '../utils/response';
import { zValidator } from '../utils/validator';

const usersRouter = createRouter()
  // 1. 用户注册
  .post('/register', zValidator('json', registerSchema), async (c) => {
    const db = getDb(c.env);
    // 1. 检查注册开关状态
    const [registerSetting] = await db
      .select()
      .from(settings)
      .where(eq(settings.key, SettingKey.ENABLE_REGISTER));
    console.log(`registerSetting:${registerSetting}`);
    // 如果开关存在且明确为 'false'，则拒绝注册
    if (!registerSetting || registerSetting.value === 'false') {
      return fail(c, '系统已关闭自主注册功能', null, 403);
    }

    const body = c.req.valid('json');
    const existing = await db.select().from(users).where(eq(users.username, body.username)).get();
    if (existing) return fail(c, '账号已存在', undefined, 400);

    const passwordHash = await hashPassword(body.password);

    await db.insert(users).values({ ...body, passwordHash: passwordHash });
    return ok(c, 'Registered successfully');
  })

  // 2. 用户登录
  .post('/login', zValidator('json', loginSchema), async (c) => {
    const { username, password } = c.req.valid('json');
    const db = getDb(c.env);
    const user = await db.select().from(users).where(eq(users.username, username)).get();

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return fail(c, '无效的用户名或者密码', undefined, 401);
    }

    // 1. 准备要存入 KV 的用户会话数据
    const sessionData: SessionUser = {
      id: user.id,
      username: user.username,
      name: user.name,
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
    await c.env.MY_KV.delete(`session:${sessionId}`);

    // 简化处理：如果你有引入 getCookie 也可以用 getCookie(c, SESSION_COOKIE_NAME)
    deleteCookie(c, SESSION_COOKIE_NAME, { path: '/' });
    return ok(c, 'Logout successful');
  })

  // 1. 获取当前登录用户信息
  .get('/me', async (c) => {
    const sessionUser: SessionUser = c.get(SESSION_USER_KEY);
    console.log(sessionUser);
    const db = getDb(c.env);
    const user = await db
      .select({ id: users.id, username: users.username, name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, sessionUser.id))
      .get();
    if (!user) {
      return fail(c, 'User not found', undefined, 401);
    }
    return ok(c, '获取当前用户信息成功', { user });
  })

  // 2. 修改密码,已登录状态不会失效
  .post('/me/change-password', zValidator('json', changePasswordSchema), async (c) => {
    const sessionUser: SessionUser = c.get(SESSION_USER_KEY);
    const { oldPassword, newPassword } = c.req.valid('json');
    const db = getDb(c.env);
    const user = await db.select().from(users).where(eq(users.id, sessionUser.id)).get();

    if (!user || !(await verifyPassword(oldPassword, user.passwordHash))) {
      return fail(c, 'Incorrect old password', undefined, 400);
    }

    const newPasswordHash = await hashPassword(newPassword);
    await db.update(users).set({ passwordHash: newPasswordHash }).where(eq(users.id, user.id));

    return ok(c, 'Password changed successfully', undefined, 200);
  });

export default usersRouter;
