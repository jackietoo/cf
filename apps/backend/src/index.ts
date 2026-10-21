import { getCookie } from 'hono/cookie';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import customersRouter from './routes/customers';
import filesRouter from './routes/files';
import usersRouter from './routes/users';
import { createRouter, SESSION_COOKIE_NAME, SESSION_USER_KEY } from './types';
import type { SessionUser } from './types';
import { fail, ok } from './utils/response';

const app = createRouter();

// 挂载全局日志中间件
app.use('*', logger());

// 全局中间件
app.use(
  '/api/*',
  cors({
    origin: (origin) => origin, // 动态匹配并允许当前请求的 origin（完美适配本地开发和生产环境）
    credentials: true, // 允许携带 Cookie
  }),
);

app.use('/api/*', async (c, next) => {
  const path = c.req.path;

  // 1. 放行公开路由（登录、注册、健康检查等）
  if (path === '/api/users/login' || path === '/api/users/register') {
    return await next();
  }

  // 2. 其他所有 /api/* 请求进行 Session 校验
  const sessionId = getCookie(c, SESSION_COOKIE_NAME);
  console.log(`sessionId:${sessionId}`);
  if (!sessionId) {
    return fail(c, 'Unauthorized: No session provided', undefined, 401);
  }

  try {
    const sessionDataStr = await c.env.MY_KV.get(`session:${sessionId}`);
    if (!sessionDataStr) {
      return fail(c, 'Unauthorized: Session expired or invalid', undefined, 401);
    }

    const sessionData: SessionUser = JSON.parse(sessionDataStr);
    c.set(SESSION_USER_KEY, sessionData); // 注入上下文
    await next();
  } catch (e) {
    return fail(c, 'Internal server error during authentication', undefined, 500);
  }
});

// 统一挂载子路由
const routes = app
  .route('/api/users', usersRouter)
  .route('/api/customers', customersRouter)
  .route('/api/files', filesRouter);

app.get('/health', (c) => {
  return ok(c, 'OK', { timestamp: Date.now() });
});

// 优化 3：添加全局错误处理和 404 捕获（生产环境必备）
app.onError((err, c) => {
  console.error(`[Error] ${err.message}`, err.stack);
  return fail(c, err.message || 'Internal Server Error', undefined, 500);
});

app.notFound((c) => {
  return c.json({ success: false, error: 'Not Found' }, 404);
});

// 导出主应用类型，供前端 Hono RPC 使用
export type AppType = typeof routes;

export default app;
