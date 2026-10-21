// src/services/api.ts
import { loginSchema } from '@workspace/shared';
import type { LoginInput } from '@workspace/shared';
import { client } from '../lib/client';

// 用户信息接口定义
export interface UserInfo {
  id: number;
  username: string;
  name?: string | null;
  email?: string | null;
}

// 通用后端响应类型包装
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export const authApi = {
  /**
   * 用户注册
   */
  async register(params: { username: string; password: string }) {
    const res = await client.api.users.register.$post({
      json: params,
    });
    return (await res.json()) as ApiResponse;
  },

  /**
   * 用户登录
   */
  async login(params: LoginInput) {
    // 前端提前校验入参（双重保险）
    const validated = loginSchema.parse(params);

    const res = await client.api.users.login.$post({
      json: validated,
    });
    return (await res.json()) as ApiResponse;
  },

  /**
   * 用户登出
   */
  async logout() {
    const res = await client.api.users.logout.$post();
    return (await res.json()) as ApiResponse;
  },
};

export const userApi = {
  /**
   * 获取当前登录用户信息 (/api/users/me)
   */
  async getMe() {
    const res = await client.api.users.me.$get();
    if (!res.ok) {
      throw new Error(`Failed to fetch user, status: ${res.status}`);
    }
    return (await res.json()) as ApiResponse<{ user: UserInfo }>;
  },

  /**
   * 修改密码 (/api/users/me/change-password)
   */
  async changePassword(params: { oldPassword: string; newPassword: string }) {
    const res = await client.api.users.me['change-password'].$post({
      json: params,
    });
    return (await res.json()) as ApiResponse;
  },
};
