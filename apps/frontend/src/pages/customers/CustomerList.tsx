import { useEffect, useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Link } from 'react-router';
import { customerApi } from '@/services';

export function CustomerList() {
  const [searchName, setSearchName] = useState('');
  const [searchNo, setSearchNo] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // 计算总页数
  const totalPages = Math.ceil(total / pageSize) || 1;

  // 请求后端获取数据
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await customerApi.getList({
        page,
        pageSize,
        customerName: searchName || undefined,
        customerNo: searchNo || undefined,
      });

      // 适配后端返回结构：{ success, data: { list, pagination: { page, pageSize, total } } }
      if (res.success && res.data) {
        setCustomers(res.data.list);
        setTotal(res.data.pagination.total);
      }
    } catch (error) {
      console.error('获取客户列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 监听页码变化触发请求
  useEffect(() => {
    fetchCustomers();
  }, [page]);

  // 点击查询按钮
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (page === 1) {
      fetchCustomers();
    } else {
      setPage(1); // 修改页码为 1 会自动触发 useEffect 重新拉取数据
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">查询客户</h1>
          <p className="text-sm text-muted-foreground">在这里查询、筛选和管理所有客户信息。</p>
        </div>
        <Link
          to="new"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90"
        >
          新增客户
        </Link>
      </div>

      {/* 搜索过滤栏（完美对应后端的 customerName 和 customerNo） */}
      <form
        onSubmit={handleSearch}
        className="flex gap-4 items-center bg-card p-4 rounded-md border flex-wrap"
      >
        <div className="flex-1 min-w-[200px] max-w-sm">
          <Input
            placeholder="请输入客户名称..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
        </div>
        <div className="flex-1 min-w-[200px] max-w-sm">
          <Input
            placeholder="请输入客户编号..."
            value={searchNo}
            onChange={(e) => setSearchNo(e.target.value)}
          />
        </div>
        <Button type="submit" variant="default">
          查询
        </Button>
      </form>

      {/* 分页表格区域 */}
      <div className="border rounded-md bg-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b text-muted-foreground">
            <tr>
              <th className="p-4 font-medium">客户编号</th>
              <th className="p-4 font-medium">客户名称</th>
              <th className="p-4 font-medium">创建时间</th>
              <th className="p-4 font-medium text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                  加载中...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                  未找到相关客户
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-muted/50">
                  <td className="p-4 font-medium">{customer.customerNo}</td>
                  <td className="p-4 font-medium">{customer.customerName}</td>
                  <td className="p-4 text-muted-foreground">
                    {customer.createdAt ? new Date(customer.createdAt).toLocaleString() : '-'}
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      to={String(customer.id)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      查看详情
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* 分页栏 */}
        <div className="flex items-center justify-between p-4 border-t bg-muted/20 text-sm">
          <span className="text-muted-foreground">共 {total} 条记录</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => p - 1)}
            >
              上一页
            </Button>
            <span className="text-muted-foreground px-2">
              第 {page} / {totalPages} 页
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              下一页
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
