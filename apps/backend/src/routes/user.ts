import { drizzle } from 'drizzle-orm/d1';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, verifyPassword } from '../utils/crypto';
import { createRouter, SESSION_USER_KEY } from '../types';


const usersRouter = createRouter();

// 1. 获取当前登录用户信息
usersRouter.get('/me', async (c) => {
  const sessionUser = c.get(SESSION_USER_KEY) as any;
  const db = drizzle(c.env.DB);
  const user = await db.select({ id: users.id, username: users.username, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, sessionUser.userId))
    .get();

  return c.json({ success: true, user }, 200);
});


// 2. 修改密码
usersRouter.post('/me/change-password', async (c) => {
  const sessionUser = c.get(SESSION_USER_KEY) as any;
  const { oldPassword, newPassword } = await c.req.json<{ oldPassword?: string; newPassword?: string }>();
  if (!oldPassword || !newPassword) return c.json({ error: 'Old and new passwords required' }, 400);

  const db = drizzle(c.env.DB);
  const user = await db.select().from(users).where(eq(users.id, sessionUser.userId)).get();

  if (!user || !(await verifyPassword(oldPassword, user.passwordHash))) {
    return c.json({ error: 'Incorrect old password' }, 400);
  }

  const newPasswordHash = await hashPassword(newPassword);
  await db.update(users).set({ passwordHash: newPasswordHash }).where(eq(users.id, user.id));

  return c.json({ success: true, message: 'Password changed successfully' }, 200);
});

export default usersRouter;