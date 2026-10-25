// src/components/PublicRoute.tsx
import { Navigate, Outlet } from 'react-router';
import { useUserStore } from '@/store/useUserStore';

export function PublicRoute() {
  const user = useUserStore((state) => state.user);

  // 2. 如果已经登录，直接重定向到仪表盘
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // 3. 未登录，正常渲染公共页面（Login / SignUp）
  return <Outlet />;
}
