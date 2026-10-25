import { SettingKey, updateSettingSchema } from '@workspace/shared';
import { eq } from 'drizzle-orm';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { getDb, settings } from '../db';
import { createRouter, SESSION_USER_KEY, type SessionUser } from '../types';
import { fail, ok } from '../utils/response';
import { zValidator } from '../utils/validator';

const settingsRouter = createRouter()
  // 1. 获取所有配置（供后台管理页面展示）
  .get('', async (c) => {
    const db = getDb(c.env);
    const allSettings = await db.select().from(settings).all();
    return ok(c, '获取所有配置成功', allSettings);
  })

  // 新增：根据 key 获取单条配置
  .get('/:key', async (c) => {
    const db = getDb(c.env);
    const key = c.req.param('key') as SettingKey;

    // 使用数组解构直接拿到第一条结果
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));

    if (!setting) {
      return fail(c, '配置项不存在', null, 404);
    }

    return ok(c, '获取配置成功', setting);
  })

  // 2. 更新配置
  .put('', zValidator('json', updateSettingSchema), async (c) => {
    const db = getDb(c.env);
    const body = c.req.valid('json');
    const sessionUser: SessionUser = c.get(SESSION_USER_KEY);

    const updated = await db
      .update(settings)
      .set({ value: body.value, createdBy: sessionUser.id, updatedBy: sessionUser.id })
      .where(eq(settings.key, body.key))
      .returning(); // 返回被修改的行;
    // 检查是否有该记录被成功更新
    if (updated.length === 0) {
      return fail(c, '该配置项不存在', null, 404);
    }

    return ok(c, '更新成功');
  });

export default settingsRouter;
