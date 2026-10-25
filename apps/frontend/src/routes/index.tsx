// src/router/index.tsx
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { CustomerList } from '@/pages/customers/CustomerList';
import { CustomerMaintenance } from '@/pages/customers/CustomerMaintenance';
import { CustomerNew } from '@/pages/customers/CustomerNew';
import { CustomersLayout } from '@/pages/customers/CustomersLayout';
import { DashboardHome } from '@/pages/dashboard/DashboardHome';
import { DashboardLayout } from '@/pages/dashboard/DashboardLayout';
import { LoanList, LoanNew, LoansLayout } from '@/pages/loans';
import { Login } from '@/pages/login/Login';
import { NotFound } from '@/pages/not-found/NotFound';
import { SignUp } from '@/pages/signup/SignUp';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { PublicRoute } from '@/routes/PublicRoute';
import { RootLayout } from '@/routes/RootLayout';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 全局根路由：负责初始化加载 User Store 状态 */}
        <Route element={<RootLayout />}>
          {/* 公开路由 */}
          <Route element={<PublicRoute />}>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/sign-up" element={<SignUp />} />
          </Route>

          {/* 需要登录保护的管理后台路由 */}
          <Route element={<ProtectedRoute />}>
            <Route path="dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardHome />} />

              <Route path="customers" element={<CustomersLayout />}>
                <Route index element={<CustomerList />} />
                <Route path="new" element={<CustomerNew />} />
                <Route path=":id" element={<CustomerMaintenance />} />
              </Route>

              <Route path="loans" element={<LoansLayout />}>
                <Route index element={<LoanList />} />
                <Route path="new" element={<LoanNew />} />
              </Route>
            </Route>
          </Route>

          {/* 404 兜底 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
