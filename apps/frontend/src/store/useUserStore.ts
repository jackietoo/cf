// src/store/useUserStore.ts
import type { LoginInput } from '@workspace/shared';
import { create } from 'zustand';
import { authApi, userApi, type UserInfo } from '../services/api';

interface UserState {
  user: UserInfo | null;
  isLoading: boolean;
  isInitialized: boolean; // 标记是否完成首次身份初始化检查

  // Actions
  setUser: (user: UserInfo | null) => void;
  login: (params: LoginInput) => Promise<boolean>;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isLoading: false,
  isInitialized: false,

  setUser: (user) => set({ user }),

  /**
   * 用户登录方法
   */
  login: async (params) => {
    try {
      set({ isLoading: true });
      const res = await authApi.login(params);
      if (res.success) {
        // 登录成功后拉取最新用户信息
        await get().fetchUser();
        return true;
      }
      return false;
    } catch (error) {
      console.error('登录失败:', error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * 初始化/刷新页面时调用：校验 Cookie Session 并同步当前用户信息
   */
  fetchUser: async () => {
    try {
      set({ isLoading: true });
      const res = await userApi.getMe();

      if (res.success && res.data?.user) {
        set({ user: res.data.user, isInitialized: true });
      } else {
        set({ user: null, isInitialized: true });
      }
    } catch (error) {
      set({ user: null, isInitialized: true });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * 统一登出方法：销毁服务端 Session 并清空本地状态
   */
  logout: async () => {
    try {
      set({ isLoading: true });
      await authApi.logout();
    } catch (error) {
      console.error('登出请求异常:', error);
    } finally {
      set({ user: null, isLoading: false });
      window.location.href = '/login';
    }
  },
}));
