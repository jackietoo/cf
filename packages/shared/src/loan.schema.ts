import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { z } from 'zod';

dayjs.extend(customParseFormat);

// 还款周期单位
export const RepayFreq = {
  DAY: 'DAY',
  WEEK: 'WEEK',
  MONTH: 'MONTH',
  QUARTER: 'QUARTER',
  YEAR: 'YEAR',
} as const;
export type RepayFreq = (typeof RepayFreq)[keyof typeof RepayFreq];

// 还款方式
export const RepaymentMethod = {
  EQUAL_PAYMENT: 'EQUAL_PAYMENT', // 等额本息
  EQUAL_PRINCIPAL: 'EQUAL_PRINCIPAL', // 等额本金
  INTEREST_FIRST: 'INTEREST_FIRST', // 先息后本（按期付息，到期还本）
  LUMP_SUM: 'LUMP_SUM', // 一次性还本付息
} as const;
export type RepaymentMethod = (typeof RepaymentMethod)[keyof typeof RepaymentMethod];

// 贷款状态
export const LoanStatus = {
  PENDING: 'PENDING', // 待审核
  APPROVED: 'APPROVED', // 待放款
  ACTIVE: 'ACTIVE', // 履约中
  OVERDUE: 'OVERDUE', // 逾期
  CLEARED: 'CLEARED', // 已结清
  CLOSED: 'CLOSED', // 已关单/已拒绝
} as const;
export type LoanStatus = (typeof LoanStatus)[keyof typeof LoanStatus];

// 还款计划明细状态
export const PlanStatus = {
  PENDING: 'PENDING', // 未还/待还
  PARTIAL: 'PARTIAL', // 部分还款
  PAID: 'PAID', // 已结清
  OVERDUE: 'OVERDUE', // 已逾期
} as const;
export type PlanStatus = (typeof PlanStatus)[keyof typeof PlanStatus];

// 抵押物类型
export const CollateralType = {
  PROPERTY: 'PROPERTY', // 房产
  VEHICLE: 'VEHICLE', // 车辆
  EQUIPMENT: 'EQUIPMENT', // 设备
  STOCK: 'STOCK', // 股权/股票
  OTHER: 'OTHER', // 其他
} as const;
export type CollateralType = (typeof CollateralType)[keyof typeof CollateralType];

// 费用承担方/属性类型
export const ExpenseCategory = {
  INCOME: 'INCOME', // 收入类费用（向借款人收取）
  COST: 'COST', // 成本类费用（平台/出资方支付的渠道/评估成本）
} as const;
export type ExpenseCategory = (typeof ExpenseCategory)[keyof typeof ExpenseCategory];

// 资产在业务中的角色/关系类型
export const BusinessAssetRole = {
  COLLATERAL: 'COLLATERAL', // 抵押物（客户已有，拿来抵押）
  PLEDGE: 'PLEDGE', // 质押物（如黄金、存单，由平台实体保管）
  LEASE_SUBJECT: 'LEASE_SUBJECT', // 租赁标的物（以租代购车辆，初始属平台）
} as const;
export type BusinessAssetRole = (typeof BusinessAssetRole)[keyof typeof BusinessAssetRole];
