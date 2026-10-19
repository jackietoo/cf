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

export const createCustomerSchema = z
  .object({
    // customerType: z.enum(CustomerType),
    identityType: z.enum(IdentityType),
    identityName: z.string().min(1, '客户名称不能为空'),
    identityNo: z.string().min(1, '证件号码不能为空'),
    gender: z.enum(Gender).optional(),
    ethnicity: z.string().optional(),
    birthDate: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val) return true;
          // 开启 strict 模式（第三个参数 true），兼顾格式与逻辑校验
          return dayjs(val, 'YYYY-MM-DD', true).isValid();
        },
        {
          message: '日期格式必须为 YYYY-MM-DD，且必须为有效的日历日期（例如：2026-10-17）',
        },
      )
      .transform((val) => (val ? dayjs(val) : undefined))
      .pipe(z.custom<Dayjs>().optional()),
    issueAuthority: z.string().optional(),
    issueDate: z
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
      .pipe(z.custom<Dayjs>().optional()),
    startDate: z
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
      .pipe(z.custom<Dayjs>().optional()),
    endDate: z
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
      .pipe(z.custom<Dayjs>().optional()),
    contacts: z.array(customerContactSchema).optional().default([]),
  })
  .transform((data) => ({
    ...data,
    // 核心业务逻辑：如果是身份证，则为个人；否则为对公
    customerType:
      data.identityType === IdentityType.ID_CARD ? CustomerType.INDIVIDUAL : CustomerType.CORPORATE,
  }));
// .refine(
//   (data) => {
//     // 如果证件类型是营业执照，则客户类型必须为对公
//     if (data.identityType === IdentityType.BUSINESS_LICENSE) {
//       return data.customerType === CustomerType.CORPORATE;
//     }
//     return true;
//   },
//   {
//     message: '证件类型为营业执照时，客户类型必须为对公',
//     path: ['customerType'], // 错误信息绑定的字段，你可以根据需要改为 ['identityType'] 或不填（挂载在根对象）
//   },
// );
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
