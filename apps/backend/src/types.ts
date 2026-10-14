/// <reference path="../worker-configuration.d.ts" />

import { Hono } from 'hono';

// 1. 定义常量
export const SESSION_COOKIE_NAME = 'session_id';
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 天
export const SESSION_USER_KEY = 'sessionUser' as const;

// 2. 定义类型
export interface SessionUser {
  userId: string;
  username: string;
}

export type AppEnv = {
  Bindings: Env;
  Variables: {
    [SESSION_USER_KEY]: SessionUser;
  };
};

// 3. 定义 Hono 实例工厂函数
export function createRouter() {
  return new Hono<AppEnv>();
}