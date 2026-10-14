import { drizzle } from 'drizzle-orm/d1';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, verifyPassword } from '../utils/crypto';
import { createRouter, SESSION_USER_KEY } from '../types';
import { ok, fail } from '../utils/response';


const usersRouter = createRouter()

// 1. 获取当前登录用户信息
.get('/me', async (c) => {
  const sessionUser = c.get(SESSION_USER_KEY) as any;
  const db = drizzle(c.env.DB);
  const user = await db.select({ id: users.id, username: users.username, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, sessionUser.userId))
    .get();
  return ok(c, '获取当前用户信息成功', { user });
})


// 2. 修改密码
.post('/me/change-password', async (c) => {
  const sessionUser = c.get(SESSION_USER_KEY) as any;
  const { oldPassword, newPassword } = await c.req.json<{ oldPassword?: string; newPassword?: string }>();
  if (!oldPassword || !newPassword) return fail(c, 'Old and new passwords required', undefined, 400);

  const db = drizzle(c.env.DB);
  const user = await db.select().from(users).where(eq(users.id, sessionUser.userId)).get();

  if (!user || !(await verifyPassword(oldPassword, user.passwordHash))) {
    return fail(c, 'Incorrect old password', undefined, 400);
  }

  const newPasswordHash = await hashPassword(newPassword);
  await db.update(users).set({ passwordHash: newPasswordHash }).where(eq(users.id, user.id));

  return ok(c, 'Password changed successfully', undefined, 200);
});

export default usersRouter;