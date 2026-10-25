// src/components/RootLayout.tsx
import { useEffect } from 'react';
import { Outlet } from 'react-router';
import { useUserStore } from '@/store/useUserStore';

export function RootLayout() {
  const fetchUser = useUserStore((state) => state.fetchUser);
  const isLoading = useUserStore((state) => state.isLoading);

  // 应用首次加载时，触发一次后端会话校验
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // 在首次校验出结果前，统一显示全局加载屏，避免路由守卫误判或页面闪烁
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <p className="text-sm text-muted-foreground animate-pulse">系统加载中...</p>
      </div>
    );
  }

  // 加载完成后，渲染对应的子路由（PublicRoute 或 ProtectedRoute）
  return <Outlet />;
}
