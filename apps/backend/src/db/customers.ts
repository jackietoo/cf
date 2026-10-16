import dayjs from 'dayjs';
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { isoLocalDate, isoLocalDateTime } from './columns';

export const CustomerTypeEnum = {
  INDIVIDUAL: 1, // 个人
  CORPORATE: 2, // 对公
} as const;
export type CustomerTypeType = (typeof CustomerTypeEnum)[keyof typeof CustomerTypeEnum];

export const customers = sqliteTable(
  'customers',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    customerNo: text('customer_no').notNull(), // 客户号，唯一标识
    customerType: integer('customer_type').$type<CustomerTypeType>(),
    customerName: text('customer_name').notNull(),

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
    uniqueIndex('customer_no_idx').on(table.customerNo),
    index('customer_name_idx').on(table.customerName),
  ],
);
export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;

export const GenderEnum = {
  MALE: 'MALE', // 男性
  FEMALE: 'FEMALE', // 女性
  OTHER: 'OTHER', // 其他
} as const;
export type GenderType = (typeof GenderEnum)[keyof typeof GenderEnum];

// 客户证件表
export const customerIdentities = sqliteTable(
  'customer_identities',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    customerNo: text('customer_no').notNull(),

    // 证件类型：如 ID_CARD(身份证), PASSPORT(护照), BUSINESS_LICENSE(营业执照/统一社会信用代码)
    identityType: text('identity_type').notNull(),
    identityName: text('identity_name').notNull(), // 证件名称
    identityNo: text('identity_no').notNull(), // 证件号码
    gender: text('gender').$type<GenderType>(), // 性别
    ethnicity: text('ethnicity'), // 民族（例如：汉族）
    birthDate: isoLocalDate('birth_date'), // 出生日期

    issueAuthority: text('issue_authority'), // 签发机关
    issueDate: isoLocalDate('issue_date'), // 签发日期
    startDate: isoLocalDate('start_date'), // 签发起始日期
    endDate: isoLocalDate('end_date'), // 有效期截止日期

    frontPhotoUrl: text('front_photo_url'),
    backPhotoUrl: text('back_photo_url'),

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
    index('customer_identities_customer_no_idx').on(table.customerNo),
    index('customer_identities_identity_no_idx').on(table.identityNo),
    index('customer_identities_identity_name_idx').on(table.identityName),
  ],
);
export type CustomerIdentity = typeof customerIdentities.$inferSelect;
export type NewCustomerIdentity = typeof customerIdentities.$inferInsert;

export const ContactTypeEnum = {
  PHONE: 'PHONE', // 电话
  EMAIL: 'EMAIL', // 邮箱
  WECHAT: 'WECHAT', // 微信
  QQ: 'QQ', // QQ
  FAX: 'FAX', // 传真
  ADDRESS: 'ADDRESS', // 地址
  OTHER: 'OTHER', // 其他
} as const;
export type ContactTypeType = (typeof ContactTypeEnum)[keyof typeof ContactTypeEnum];

// 客户联系方式表
export const customerContacts = sqliteTable(
  'customer_contacts',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    customerNo: text('customer_no').notNull(),

    isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false),
    contactValue: text('contact_value').notNull(),

    remark: text('remark'), // 备注

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
    index('customer_contacts_customer_no_idx').on(table.customerNo),
    index('customer_contacts_contact_value_idx').on(table.contactValue),
  ],
);
export type CustomerContact = typeof customerContacts.$inferSelect;
export type NewCustomerContact = typeof customerContacts.$inferInsert;
