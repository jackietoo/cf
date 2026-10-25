import {
  BusinessAssetRole,
  CollateralType,
  ExpenseCategory,
  LoanStatus,
  PlanStatus,
  RepayFreq,
  RepaymentMethod,
} from '@workspace/shared';
import dayjs from 'dayjs';
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { bignumberText, isoLocalDate, isoLocalDateTime } from './columns';

// 贷款主表
export const loans = sqliteTable(
  'loans',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    customerNo: text('customer_no').notNull(),
    loanNo: text('loan_no').notNull(),

    totalAssetPrice: bignumberText('total_asset_price').notNull(), // 资产/车辆总价
    downPayment: bignumberText('down_payment').notNull(), // 首付款金额（客户自付）
    loanAmount: bignumberText('loan_amount').notNull(), // 贷款本金
    disbursedAmount: bignumberText('disbursed_amount').notNull(), // 实际出资金额 与出资金额一致

    annualRate: bignumberText('annual_rate').notNull(), // 年化利率
    repaymentMethod: text('repayment_method').notNull().$type<RepaymentMethod>(), // 还款方式
    repayFreq: text('repay_freq').notNull().$type<RepayFreq>(), // 还款周期单位
    loanTerm: integer('loan_term').notNull(), // 贷款总期数
    status: text('status').notNull().$type<LoanStatus>().default(LoanStatus.PENDING), // 贷款状态

    remark: text('remark'),
    loanStartDate: isoLocalDate('loan_start_date'), // 放款日
    loanEndDate: isoLocalDate('loan_end_date'), // 到期日

    createdAt: isoLocalDateTime('created_at')
      .notNull()
      .$defaultFn(() => dayjs()),
    updatedAt: isoLocalDateTime('updated_at')
      .notNull()
      .$defaultFn(() => dayjs())
      .$onUpdateFn(() => dayjs()),
    createdBy: integer('created_by'),
    updatedBy: integer('updated_by'),
  },
  (table) => [
    index('loan_customer_no_idx').on(table.customerNo),
    uniqueIndex('loan_no_idx').on(table.loanNo),
  ],
);
export type Loan = typeof loans.$inferSelect;
export type NewLoan = typeof loans.$inferInsert;

// 贷款资金来源表 (loan_fund_source)
export const loanFundSources = sqliteTable(
  'loan_fund_sources',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    loanNo: text('loan_no').notNull(),
    funderNo: text('funder_no').notNull(), // 出资方客户号
    funderName: text('funder_name').notNull(), // 出资方姓名
    fundedAmount: bignumberText('funded_amount').notNull(), //出资金额
    shareRate: bignumberText('share_ratio').notNull(), // 出资占比
    remark: text('remark'),

    createdAt: isoLocalDateTime('created_at')
      .notNull()
      .$defaultFn(() => dayjs()),
    updatedAt: isoLocalDateTime('updated_at')
      .notNull()
      .$defaultFn(() => dayjs())
      .$onUpdateFn(() => dayjs()),
    createdBy: integer('created_by'),
    updatedBy: integer('updated_by'),
  },
  (table) => [
    index('loan_fund_sources_idx1').on(table.loanNo),
    index('loan_fund_sources_idx1').on(table.funderNo),
  ],
);
export type LoanFundSource = typeof loanFundSources.$inferSelect;
export type NewLoanFundSource = typeof loanFundSources.$inferInsert;

// ==========================================
// 贷款分润/结算计划表 (loan_profit_sharings)
// ==========================================
export const loanProfitSharings = sqliteTable(
  'loan_profit_sharings',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    loanNo: text('loan_no').notNull(), // 关联贷款编号
    termNo: integer('term_no').notNull(), // 对应还款计划的第几期

    // 受益方信息
    beneficiaryNo: text('beneficiary_no').notNull(), // 受益方编号（出资方号 或 平台机构号）
    beneficiaryName: text('beneficiary_name').notNull(), // 受益方名称

    // 分润比例与金额明细
    shareRatio: bignumberText('share_ratio').notNull(), // 本次分润占比（通常继承自 funder 的 shareRate）

    principalShare: bignumberText('principal_share').notNull(), // 分润本金（应还本金按比例分配）
    interestShare: bignumberText('interest_share').notNull(), // 分润利息/收益（核心利润分配）
    feeShare: bignumberText('fee_share').notNull(), // 分润费用/服务费
    totalShare: bignumberText('total_share').notNull(), // 本次应分润总额

    // 结算状态与时间
    settledAt: isoLocalDateTime('settled_at'), // 实际完成分润/打款给资方的时间
    remark: text('remark'),

    createdAt: isoLocalDateTime('created_at')
      .notNull()
      .$defaultFn(() => dayjs()),
    updatedAt: isoLocalDateTime('updated_at')
      .notNull()
      .$defaultFn(() => dayjs())
      .$onUpdateFn(() => dayjs()),
    createdBy: integer('created_by'),
    updatedBy: integer('updated_by'),
  },
  (table) => [
    index('loan_profit_sharings_loan_no_idx').on(table.loanNo),
    index('loan_profit_sharings_beneficiary_idx').on(table.beneficiaryNo),
    // 同一笔贷款的某一期，同一个受益方只有一条分润记录
    uniqueIndex('loan_profit_sharings_term_beneficiary_uidx').on(
      table.loanNo,
      table.termNo,
      table.beneficiaryNo,
    ),
  ],
);
export type LoanProfitSharing = typeof loanProfitSharings.$inferSelect;
export type NewLoanProfitSharing = typeof loanProfitSharings.$inferInsert;

// ==========================================
// 3. 抵押物表 (loan_collaterals)
// ==========================================
export const loanCollaterals = sqliteTable(
  'loan_collaterals',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    loanNo: text('loan_no').notNull(), // 关联贷款编号
    collateralType: text('collateral_type').notNull().$type<CollateralType>(), // 抵押物类型
    collateralName: text('collateral_name').notNull(), // 抵押物名称（如: 某某花园房产/宝马X5）
    evaluationValue: bignumberText('evaluation_value').notNull(), // 评估价值
    mortgageValue: bignumberText('mortgage_value'), // 拟抵押金额/最高担保额

    ownerName: text('owner_name'), // 产权所有人
    identificationNo: text('identification_no'), // 权证号/车牌号/车架号/不动产权证号
    detailsJson: text('details_json'), // 扩展属性（JSON格式存储房产面积、车龄等特定字段）
    remark: text('remark'),

    createdAt: isoLocalDateTime('created_at')
      .notNull()
      .$defaultFn(() => dayjs()),
    updatedAt: isoLocalDateTime('updated_at')
      .notNull()
      .$defaultFn(() => dayjs())
      .$onUpdateFn(() => dayjs()),
    createdBy: integer('created_by'),
    updatedBy: integer('updated_by'),
  },
  (table) => [index('loan_collaterals_loan_no_idx').on(table.loanNo)],
);

export type LoanCollateral = typeof loanCollaterals.$inferSelect;
export type NewLoanCollateral = typeof loanCollaterals.$inferInsert;

// ==========================================
// 4. 贷款费用表 (loan_expenses)
// ==========================================
export const loanExpenses = sqliteTable(
  'loan_expenses',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    loanNo: text('loan_no').notNull(), // 关联贷款编号
    expenseName: text('expense_name').notNull(), // 费用名称（评估费、担保费、公证费、渠道成本等）
    expenseCategory: text('expense_category').notNull().$type<ExpenseCategory>(), // 属性: INCOME-收取费用, COST-支出成本
    amount: bignumberText('amount').notNull(), // 费用金额

    payer: text('payer'), // 支付方（如：BORROWER-借款人, PLATFORM-平台）
    payee: text('payee'), // 收款方（如：第三方评估公司、公证处）
    isDeductedFromPrincipal: integer('is_deducted_from_principal', { mode: 'boolean' })
      .notNull()
      .default(false), // 是否从放款本金中前置扣除
    remark: text('remark'),

    createdAt: isoLocalDateTime('created_at')
      .notNull()
      .$defaultFn(() => dayjs()),
    updatedAt: isoLocalDateTime('updated_at')
      .notNull()
      .$defaultFn(() => dayjs())
      .$onUpdateFn(() => dayjs()),
    createdBy: integer('created_by'),
    updatedBy: integer('updated_by'),
  },
  (table) => [index('loan_expenses_loan_no_idx').on(table.loanNo)],
);

export type LoanExpense = typeof loanExpenses.$inferSelect;
export type NewLoanExpense = typeof loanExpenses.$inferInsert;

// ==========================================
// 5. 还款计划表 (loan_repayment_plans)
// ==========================================
export const loanRepaymentPlans = sqliteTable(
  'loan_repayment_plans',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    loanNo: text('loan_no').notNull(), // 关联贷款编号
    termNo: integer('term_no').notNull(), // 第几期（1, 2, 3...）

    dueDate: isoLocalDate('due_date').notNull(), // 应还日期（到期日）

    // 应还金额明细
    principalDue: bignumberText('principal_due').notNull(), // 应还本金
    interestDue: bignumberText('interest_due').notNull(), // 应还利息
    feeDue: bignumberText('fee_due'), // 应还费用/服务费
    totalDue: bignumberText('total_due').notNull(), // 本期应还总额 (principal + interest + fee)

    // 实还金额明细（支持部分还款）
    principalPaid: bignumberText('principal_paid'), // 已还本金
    interestPaid: bignumberText('interest_paid'), // 已还利息
    feePaid: bignumberText('fee_paid'), // 已还费用
    totalPaid: bignumberText('total_paid'), // 本期已还总额

    status: text('status').notNull().$type<PlanStatus>().default(PlanStatus.PENDING), // 本期状态
    paidAt: isoLocalDateTime('paid_at'), // 本期结清时间/最后一次还款时间

    remark: text('remark'),

    createdAt: isoLocalDateTime('created_at')
      .notNull()
      .$defaultFn(() => dayjs()),
    updatedAt: isoLocalDateTime('updated_at')
      .notNull()
      .$defaultFn(() => dayjs())
      .$onUpdateFn(() => dayjs()),
    createdBy: integer('created_by'),
    updatedBy: integer('updated_by'),
  },
  (table) => [
    index('loan_repayment_plans_loan_no_idx').on(table.loanNo),
    index('loan_repayment_plans_due_date_idx').on(table.dueDate),
    // 同一笔贷款的期数必须唯一
    uniqueIndex('loan_repayment_plans_loan_term_uidx').on(table.loanNo, table.termNo),
  ],
);

export type LoanRepaymentPlan = typeof loanRepaymentPlans.$inferSelect;
export type NewLoanRepaymentPlan = typeof loanRepaymentPlans.$inferInsert;

// 3. 业务与资产关联表 (loan_asset_relations)
// 统一管理：不管是抵押贷款还是以租代购，业务与资产的绑定关系
export const loanAssetRelations = sqliteTable(
  'loan_asset_relations',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    loanNo: text('loan_no').notNull(), // 关联贷款/租赁订单编号
    assetNo: text('asset_no').notNull(), // 关联资产编号

    businessRole: text('business_role').notNull().$type<BusinessAssetRole>(), // 业务角色: COLLATERAL(抵押), LEASE_SUBJECT(以租代购标的)
    securedAmount: bignumberText('secured_amount'), // 担保额度/租赁车价（在该笔订单中的货值/融资金额）

    remark: text('remark'),
    createdAt: isoLocalDateTime('created_at')
      .notNull()
      .$defaultFn(() => dayjs()),
    updatedAt: isoLocalDateTime('updated_at')
      .notNull()
      .$defaultFn(() => dayjs())
      .$onUpdateFn(() => dayjs()),
  },
  (table) => [
    index('loan_asset_relations_loan_no_idx').on(table.loanNo),
    index('loan_asset_relations_asset_no_idx').on(table.assetNo),
    uniqueIndex('loan_asset_relations_uidx').on(table.loanNo, table.assetNo),
  ],
);

export type LoanAssetRelation = typeof loanAssetRelations.$inferSelect;
export type NewLoanAssetRelation = typeof loanAssetRelations.$inferInsert;
