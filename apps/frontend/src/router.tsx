import { Button } from '@workspace/ui/components/button';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { DashboardPage } from './app/dashboard/page'; // 引入你的 page.tsx 组件
import { LoginForm } from './components/login-form';
import { SignupForm } from './components/signup-form';
import { useUserStore } from './store/useUserStore';

// 路由守卫：检查用户是否已登录
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isInitialized } = useUserStore();

  if (!isInitialized) {
    return <div className="flex h-screen items-center justify-center">Loading session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      {/* 注意：不要在这里加限制全局居中的样式，否则侧边栏布局会被挤压 */}
      <Routes>
        {/* 公开路由（登录和注册可以保留居中容器样式） */}
        <Route
          path="/login"
          element={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
              <div className="w-full max-w-md">
                <LoginForm />
              </div>
            </div>
          }
        />
        <Route
          path="/signup"
          element={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
              <div className="w-full max-w-md">
                <SignupForm />
              </div>
            </div>
          }
        />

        {/* 受保护的主页路由 - 登录后直接显示你的 page.tsx 仪表盘 */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* 兜底重定向 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
