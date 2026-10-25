// 客户列表页
import { Link } from 'react-router';

export function LoanList() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">客户管理</h1>
          <p className="text-sm text-muted-foreground">在这里查询、筛选和管理所有客户信息。</p>
        </div>
        {/* 跳转到新增客户页：/dashboard/customers/new */}
        <Link
          to="new"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90"
        >
          新增客户
        </Link>
      </div>

      {/* 模拟表格区域 */}
      <div className="border rounded-md p-4 bg-card">
        <div className="flex justify-between items-center py-3 border-b">
          <span className="font-medium">客户张三 (ID: 1001)</span>
          {/* 跳转到详情/维护页：/dashboard/customers/1001 */}
          <Link to="1001" className="text-sm text-blue-600 hover:underline">
            查看详情
          </Link>
        </div>
      </div>
    </div>
  );
}
