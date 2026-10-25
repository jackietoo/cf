// 客户模块公共布局
import { Outlet } from 'react-router';

export function LoansLayout() {
  return (
    <div>
      {/* 客户模块专用的公共头部或面包屑可以在这里写 */}
      <Outlet />
    </div>
  );
}
