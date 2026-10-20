import { createCustomerSchema } from '@workspace/shared';
import { and, desc, eq, like, sql } from 'drizzle-orm';
import { customerContacts, customerIdentities, customers, getDb } from '../db';
import { getNextSequence, SequenceType } from '../service/sequence';
import { createRouter, SESSION_USER_KEY } from '../types';
import { fail, ok } from '../utils/response';
import { zValidator } from '../utils/validator';

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

  // 2. 创建客户
  .post('/', zValidator('json', createCustomerSchema), async (c) => {
    const db = getDb(c.env);
    const body = c.req.valid('json');
    const sessionUser = c.get(SESSION_USER_KEY);
    const customerNo = await getNextSequence(db, SequenceType.CUSTOMER_NO, sessionUser.userId);

    const commonFields = {
      customerNo: customerNo,
      createdBy: sessionUser.userId,
      updatedBy: sessionUser.userId,
    };

    try {
      const batchQueries: any[] = [
        db
          .insert(customers)
          .values({
            ...commonFields,
            customerType: body.customerType,
            customerName: body.identityName,
          })
          .returning(),

        db
          .insert(customerIdentities)
          .values({
            ...commonFields,
            ...body,
          })
          .returning(),
      ];
      if (body.contacts && body.contacts.length > 0) {
        const contactValues = body.contacts.map((contact) => ({
          ...commonFields,
          ...contact,
        }));

        batchQueries.push(db.insert(customerContacts).values(contactValues).returning());
      }

      const results = await db.batch(batchQueries as [any, ...any[]]);

      return ok(
        c,
        '创建客户成功',
        { customer: results[0], customerIdentity: results[1], contacts: results[2] },
        201,
      );
    } catch (error: any) {
      const errorMessage = error?.message || String(error);

      // 友好拦截：捕获 SQLite 的 UNIQUE 唯一约束冲突
      if (
        errorMessage.includes('SQLITE_CONSTRAINT_UNIQUE') ||
        errorMessage.includes('UNIQUE constraint failed')
      ) {
        // 根据具体是哪个字段冲突，返回更明确的中文提示
        if (errorMessage.includes('customer_identities.identity_no')) {
          return fail(c, '创建客户失败：该证件号码已被注册，请检查后重试', undefined, 400);
        }
        // 如果以后还有其他唯一索引（例如手机号等），也可以在这里扩展
        return fail(c, '创建客户失败：数据已存在，违反唯一性约束', undefined, 400);
      }

      // 其它未知异常保持原有逻辑
      return fail(c, `创建客户失败: ${errorMessage}`, undefined, 500);
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

    const customerIdentities = await db.query.customerIdentities.findFirst({
      where: eq(customers.customerNo, customerNo),
    });

    const customerContacts = await db.query.customerContacts.findFirst({
      where: eq(customers.customerNo, customerNo),
    });

    return ok(c, '获取客户详情成功', {
      customer: customer,
      customerIdentity: customerIdentities,
      contacts: customerContacts,
    });
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
  });

export default customersRouter;
