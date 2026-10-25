// src/services/customer.ts
import { createCustomerSchema, updateCustomerSchema } from '@workspace/shared';
import type { z } from 'zod';
import { client } from '../lib/client';

// 使用 z.input 获取输入类型（日期为 string），供前端表单提交使用
export type CreateCustomerInput = z.input<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.input<typeof updateCustomerSchema>;

export const customerApi = {
  /**
   * 1. 分页查询客户列表
   */
  async getList(params?: {
    page?: number;
    pageSize?: number;
    customerName?: string;
    customerNo?: string;
  }) {
    const res = await client.api.customers.$get({
      query: params as Record<string, string>,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? '获取客户列表失败');
    return json;
  },

  /**
   * 2. 创建客户
   */
  async create(params: CreateCustomerInput) {
    // 后端有 zValidator 自动校验并转换，前端直接传递原始 params（字符串日期）即可
    const res = await client.api.customers.$post({ json: params });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? '创建客户失败');
    return json;
  },

  /**
   * 3. 获取单个客户详情
   */
  async getDetail(customerNo: string) {
    const res = await client.api.customers[':customerNo'].$get({
      param: { customerNo },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? '获取客户详情失败');
    return json;
  },

  /**
   * 4. 更新客户信息
   */
  async update(customerNo: string, params: UpdateCustomerInput) {
    const res = await client.api.customers[':customerNo'].$put({
      param: { customerNo },
      json: params,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? '更新客户失败');
    return json;
  },
};
