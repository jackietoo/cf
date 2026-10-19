import { ContactType, CustomerType, Gender, IdentityType } from '@repo/shared';
import dayjs from 'dayjs';
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { isoLocalDate, isoLocalDateTime } from './columns';

// 客户总表
export const customers = sqliteTable(
  'customers',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    customerNo: text('customer_no').notNull(), // 客户号，唯一标识
    customerType: text('customer_type').notNull().$type<CustomerType>(),
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

// 客户证件表
export const customerIdentities = sqliteTable(
  'customer_identities',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    customerNo: text('customer_no').notNull(),

    identityType: text('identity_type').notNull().$type<IdentityType>(),
    identityName: text('identity_name').notNull(), // 证件名称
    identityNo: text('identity_no').notNull(), // 证件号码
    gender: text('gender').$type<Gender>(), // 性别
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
    uniqueIndex('customer_identities_identity_no_idx').on(table.identityNo, table.identityType),
    index('customer_identities_identity_name_idx').on(table.identityName),
  ],
);
export type CustomerIdentity = typeof customerIdentities.$inferSelect;
export type NewCustomerIdentity = typeof customerIdentities.$inferInsert;

// 客户联系方式表
export const customerContacts = sqliteTable(
  'customer_contacts',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    customerNo: text('customer_no').notNull(),

    isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false),
    contactType: text('contact_type').notNull().$type<ContactType>(),
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
