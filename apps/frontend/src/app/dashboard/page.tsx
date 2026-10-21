import { Button } from '@workspace/ui/components/button';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@workspace/ui/components/sidebar';
import { useNavigate } from 'react-router-dom';
import { AppSidebar } from '@/components/app-sidebar'; // shadcn sidebar-02 组件
import { useUserStore } from '../../store/useUserStore';

export function DashboardPage() {
  const { logout } = useUserStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <span className="font-semibold text-sm">控制台</span>
          </div>
          <input type="file" accept="image/*" capture="environment" />
          <Button variant="outline" size="sm" onClick={handleLogout}>
            退出登录
          </Button>
        </header>

        <main className="flex-1 p-6">
          <h2 className="text-xl font-bold">欢迎回来！</h2>
          <p className="text-muted-foreground mt-2">
            当前已成功通过 React Router 与 Auth Context 接入系统。
          </p>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
