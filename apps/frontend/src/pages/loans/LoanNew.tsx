// 新增客户页
import { Link } from 'react-router';

export function LoanNew() {
  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">新增客户</h1>
        <Link to=".." className="text-sm text-muted-foreground hover:underline">
          &larr; 返回列表
        </Link>
      </div>

      <form className="space-y-4 border rounded-md p-6 bg-card">
        <div>
          <label className="block text-sm font-medium mb-1">客户姓名</label>
          <input
            type="text"
            className="w-full border rounded-md px-3 py-2 text-sm"
            placeholder="请输入客户姓名"
          />
        </div>
        <button
          type="submit"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium"
        >
          保存
        </button>
      </form>
    </div>
  );
}
