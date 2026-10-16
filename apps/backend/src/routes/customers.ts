import { and, desc, eq, like, sql } from 'drizzle-orm';
import { getDb } from '../db';
import { customers } from '../db/customers';
import { createRouter } from '../types';
import { fail, ok } from '../utils/response';

const customersRouter = createRouter()
  // 1. 分页查询客户列表
  .get('/', async (c) => {
    const db = getDb(c.env);
    const page = Number(c.req.query('page') || '1');
    const pageSize = Number(c.req.query('pageSize') || '10');
    const customerName = c.req.query('customerName');
    const customerNo = c.req.query('customerNo');

    const offset = (page - 1) * pageSize;
    const conditions = [];

    if (customerName) conditions.push(like(customers.customerName, `%${customerName}%`));
    if (customerNo) conditions.push(like(customers.customerNo, `%${customerNo}%`));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const list = await db.query.customers.findMany({
      where: whereClause,
      limit: pageSize,
      offset: offset,
      orderBy: [desc(customers.createdAt)],
    });

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(customers)
      .where(whereClause);

    return ok(c, '获取客户列表成功', { list, pagination: { page, pageSize, total: count } });
  })

  // 2. 创建客户（仅写入客户主表）
  .post('/', async (c) => {
    const db = getDb(c.env);
    const body = await c.req.json();
    const { customerNo, customerName, customerType } = body;

    if (!customerNo || !customerName) {
      return fail(c, '客户号与客户名称不能为空', undefined, 400);
    }

    try {
      const [newCustomer] = await db
        .insert(customers)
        .values({
          customerNo,
          customerName,
          customerType,
        })
        .returning();

      return ok(c, '创建客户成功', newCustomer, 201);
    } catch (error: any) {
      return fail(c, `创建客户失败: ${error.message}`, undefined, 500);
    }
  })

  // 3. 获取单个客户详情
  .get('/:customerNo', async (c) => {
    const customerNo = c.req.param('customerNo');
    const db = getDb(c.env);
    const customer = await db.query.customers.findFirst({
      where: eq(customers.customerNo, customerNo),
    });

    if (!customer) {
      return fail(c, '客户不存在', undefined, 404);
    }

    return ok(c, '获取客户详情成功', customer);
  })

  // 4. 更新客户信息
  .put('/:customerNo', async (c) => {
    const customerNo = c.req.param('customerNo');
    const db = getDb(c.env);
    const { customerName, customerType } = await c.req.json();

    const [updated] = await db
      .update(customers)
      .set({ customerName, customerType })
      .where(eq(customers.customerNo, customerNo))
      .returning();

    if (!updated) {
      return fail(c, '客户不存在', undefined, 404);
    }

    return ok(c, '更新客户成功', updated);
  })

  // 5. 删除客户（仅删除主表记录）
  .delete('/:customerNo', async (c) => {
    const db = getDb(c.env);
    const customerNo = c.req.param('customerNo');

    const [deleted] = await db
      .delete(customers)
      .where(eq(customers.customerNo, customerNo))
      .returning();

    if (!deleted) {
      return fail(c, '客户不存在', undefined, 404);
    }

    return ok(c, '删除客户成功');
  });

export default customersRouter;
