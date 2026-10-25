import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { z } from 'zod';

dayjs.extend(customParseFormat);

export const CustomerType = {
  INDIVIDUAL: 'INDIVIDUAL', // 个人
  CORPORATE: 'CORPORATE', // 对公
} as const;
export type CustomerType = (typeof CustomerType)[keyof typeof CustomerType];

export const Gender = {
  MALE: 'MALE', // 男性
  FEMALE: 'FEMALE', // 女性
  OTHER: 'OTHER', // 其他
} as const;
export type Gender = (typeof Gender)[keyof typeof Gender];

// 证件类型枚举
export const IdentityType = {
  ID_CARD: 'ID_CARD', // 身份证
  PASSPORT: 'PASSPORT', // 护照
  BUSINESS_LICENSE: 'BUSINESS_LICENSE', // 营业执照/统一社会信用代码
  OTHER: 'OTHER', // 其他
} as const;
export type IdentityType = (typeof IdentityType)[keyof typeof IdentityType];

export const ContactType = {
  PHONE: 'PHONE', // 电话
  EMAIL: 'EMAIL', // 邮箱
  WECHAT: 'WECHAT', // 微信
  QQ: 'QQ', // QQ
  FAX: 'FAX', // 传真
  ADDRESS: 'ADDRESS', // 地址
  OTHER: 'OTHER', // 其他
} as const;
export type ContactType = (typeof ContactType)[keyof typeof ContactType];

// 1. 单条联系人校验 Schema
export const customerContactSchema = z.object({
  contactType: z.enum(ContactType),
  contactValue: z.string().min(1, '联系方式不能为空'),
  isDefault: z.boolean().optional().default(false),
  remark: z.string().optional(),
});

// 抽离公共的字段定义对象
const dateField = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val) return true;
      return dayjs(val, 'YYYY-MM-DD', true).isValid();
    },
    {
      message: '日期格式必须为 YYYY-MM-DD，且必须为有效的日历日期（例如：2026-10-17）',
    },
  )
  .transform((val) => (val ? dayjs(val) : undefined))
  .pipe(z.custom<Dayjs>().optional());

const customerShape = {
  identityType: z.enum(IdentityType),
  identityName: z.string().min(1, '客户名称不能为空'),
  identityNo: z.string().min(1, '证件号码不能为空'),
  gender: z.enum(Gender).optional(),
  ethnicity: z.string().optional(),
  birthDate: dateField,
  address: z.string().optional(),
  issueAuthority: z.string().optional(),
  issueDate: dateField,
  startDate: dateField,
  endDate: dateField,
  contacts: z.array(customerContactSchema).optional().default([]),
};

// 1. 创建客户 Schema
export const createCustomerSchema = z.object(customerShape).transform((data) => ({
  ...data,
  customerType:
    data.identityType === IdentityType.ID_CARD ? CustomerType.INDIVIDUAL : CustomerType.CORPORATE,
}));

export type CreateCustomerInput = z.input<typeof createCustomerSchema>;

// 2. 更新客户 Schema（基于 customerShape 先 partial，再做可选的 transform）
export const updateCustomerSchema = z
  .object(customerShape)
  .partial()
  .transform((data) => ({
    ...data,
    customerType: data.identityType
      ? data.identityType === IdentityType.ID_CARD
        ? CustomerType.INDIVIDUAL
        : CustomerType.CORPORATE
      : undefined,
  }));

export type UpdateCustomerInput = z.input<typeof updateCustomerSchema>;

// 资产类型枚举扩展
export const AssetType = {
  VEHICLE: 'VEHICLE', // 车辆（支持以租代购/车抵贷）
  GOLD: 'GOLD', // 黄金/贵金属（质押业务）
  PROPERTY: 'PROPERTY', // 房产
  EQUIPMENT: 'EQUIPMENT', // 机械设备
} as const;
export type AssetType = (typeof AssetType)[keyof typeof AssetType];

// 资产过户/交易类型枚举
export const AssetTransferType = {
  RENT_TO_OWN_TRANSFER: 'RENT_TO_OWN_TRANSFER', // 以租代购结清过户（平台->客户）
  PURCHASE_TRANSFER: 'PURCHASE_TRANSFER', // 购买过户（原车主->客户）
  MORTGAGE_RELEASE: 'MORTGAGE_RELEASE', // 解押过户
  OTHER: 'OTHER', //
} as const;
export type AssetTransferType = (typeof AssetTransferType)[keyof typeof AssetTransferType];

// 能源类型
export const EnergyType = {
  GASOLINE: 'GASOLINE', // 汽油
  DIESEL: 'DIESEL', // 柴油
  ELECTRIC: 'ELECTRIC', // 纯电动
  HYBRID: 'HYBRID', // 油电混合/插电混动
  OTHER: 'OTHER', // 其他
} as const;
export type EnergyType = (typeof EnergyType)[keyof typeof EnergyType];

// 使用性质
export const VehicleUseType = {
  NON_OPERATIONAL: 'NON_OPERATIONAL', // 非营运
  OPERATIONAL: 'OPERATIONAL', // 营运（如网约车、出租车）
  LEASE: 'LEASE', // 租赁
} as const;
export type VehicleUseType = (typeof VehicleUseType)[keyof typeof VehicleUseType];
