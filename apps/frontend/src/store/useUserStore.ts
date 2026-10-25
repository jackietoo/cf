// src/store/useUserStore.ts
import type { LoginInput } from '@workspace/shared';
import { create } from 'zustand';
import { userApi, type UserInfo } from '../services';

interface UserState {
  user: UserInfo | null;
  isLoading: boolean;

  // Actions
  setUser: (user: UserInfo | null) => void;
  fetchUser: () => Promise<void>;
  login: (params: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  /** 清理用户状态（常用于 401 全局拦截触发或登出降级处理） */
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isLoading: true,

  setUser: (user) => set({ user }),

  /**
   * 初始化/刷新页面时调用：校验 Cookie Session 并同步当前用户信息
   */
  fetchUser: async () => {
    try {
      set({ isLoading: true });
      const res = await userApi.getMe();

      if (res.success && res.data?.user) {
        set({ user: res.data.user });
      } else {
        set({ user: null });
      }
    } catch (error) {
      get().clearUser();
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * 用户登录方法
   */
  login: async (params) => {
    await userApi.login(params);
    await get().fetchUser();
  },

  /**
   * 统一登出方法：销毁服务端 Session 并清空本地状态
   */
  logout: async () => {
    try {
      await userApi.logout();
    } finally {
      get().clearUser();
    }
  },

  /**
   * 清理用户状态（内部核心重置方法）
   */
  clearUser: () =>
    set({
      user: null,
      isLoading: false,
    }),
}));
