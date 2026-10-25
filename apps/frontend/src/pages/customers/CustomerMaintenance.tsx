// 客户详情与维护页 (/dashboard/customers/:id)
import { Link, useParams } from 'react-router';

export function CustomerMaintenance() {
  const { id } = useParams(); // 获取动态路由传递的 id

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">客户维护 (ID: {id})</h1>
        <Link to=".." className="text-sm text-muted-foreground hover:underline">
          &larr; 返回列表
        </Link>
      </div>

      <div className="border rounded-md p-6 bg-card space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">当前客户 ID</label>
          <input
            type="text"
            disabled
            defaultValue={id}
            className="w-full border rounded-md px-3 py-2 text-sm bg-muted"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">客户名称</label>
          <input
            type="text"
            defaultValue={`客户 ${id}`}
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium"
        >
          更新信息
        </button>
      </div>
    </div>
  );
}
