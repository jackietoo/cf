// src/services/user.ts
// 封装用户、登录、注册等鉴权相关请求
import { changePasswordSchema, loginSchema, registerSchema } from '@workspace/shared';
import type { ChangePasswordInput, LoginInput, RegisterInput } from '@workspace/shared';
import { client } from '../lib/client';

// 用户信息接口定义
export interface UserInfo {
  id: number;
  username: string;
  name?: string | null;
  email?: string | null;
}

export const userApi = {
  /**
   * 用户注册
   */
  async register(params: RegisterInput) {
    const validated = registerSchema.parse(params);
    const res = await client.api.users.register.$post({ json: validated });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? '注册失败');
    return json;
  },

  /**
   * 用户登录
   */
  async login(params: LoginInput) {
    const validated = loginSchema.parse(params);
    const res = await client.api.users.login.$post({ json: validated });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? '登录失败');
    return json;
  },

  /**
   * 用户登出
   */
  async logout() {
    const res = await client.api.users.logout.$post();
    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? '登出失败');
    return json;
  },

  /**
   * 获取当前登录用户信息 (/api/users/me)
   */
  async getMe() {
    const res = await client.api.users.me.$get();
    if (!res.ok) {
      throw new Error(`获取当前登录用户信息, status: ${res.status}`);
    }
    return await res.json();
  },

  /**
   * 修改密码 (/api/users/me/change-password)
   */
  async changePassword(params: ChangePasswordInput) {
    const validated = changePasswordSchema.parse(params);
    const res = await client.api.users.me['change-password'].$post({ json: validated });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? '修改密码失败');
    return json;
  },
};
