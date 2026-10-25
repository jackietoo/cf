// # 路由鉴权守卫布局
// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router';
import { useUserStore } from '../store/useUserStore';

export function ProtectedRoute() {
  const { user } = useUserStore();

  // 如果没有用户，重定向到登录页
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 已登录则渲染子路由内容（即管理后台布局）
  return <Outlet />;
}
