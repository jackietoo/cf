import {
  AssetTransferType,
  AssetType,
  ContactType,
  CustomerType,
  EnergyType,
  Gender,
  IdentityType,
  VehicleUseType,
} from '@workspace/shared';
import dayjs from 'dayjs';
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { bignumberText, isoLocalDate, isoLocalDateTime } from './columns';

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

// 客户资产表
export const customerAssets = sqliteTable(
  'customer_assets',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    customerNo: text('customer_no').notNull(), // 关联客户号（承租人/借款人）
    assetNo: text('asset_no').notNull(), // 资产唯一编号

    assetType: text('asset_type').notNull().$type<AssetType>(), // 资产类型: VEHICLE, GOLD, PROPERTY等
    assetName: text('asset_name').notNull(), // 资产名称（如: 黄金手镯50g / 理想L7汽车）
    valuationValue: bignumberText('valuation_value').notNull(), // 资产评估价/采购价

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
    uniqueIndex('customer_assets_no_uidx').on(table.assetNo),
    index('customer_assets_customer_no_idx').on(table.customerNo),
  ],
);

export type CustomerAsset = typeof customerAssets.$inferSelect;
export type NewCustomerAsset = typeof customerAssets.$inferInsert;

// 资产过户/交易登记表 (asset_transfer_records)
export const assetTransferRecords = sqliteTable(
  'asset_transfer_records',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    transferNo: text('transfer_no').notNull(), // 过户/交易流水编号
    assetNo: text('asset_no').notNull(), // 关联资产编号（customer_assets.assetNo）
    loanNo: text('loan_no'), // 关联业务/订单编号（可选，如以租代购订单号）

    transferType: text('transfer_type').notNull().$type<AssetTransferType>(), // 过户/交易类型

    // 交易双方（通过客户表编号关联，保证系统内客户体系闭环）
    fromCustomerNo: text('from_customer_no'), // 转出方客户号（或平台统一机构号）
    toCustomerNo: text('to_customer_no'), // 转入方客户号（最终所有人/客户）

    // ---- 核心新增：过户后的新车牌号 ----
    licensePlate: text('license_plate'), // 本次过户后新上/变更的车牌号

    // 经济与财务要素
    transactionAmount: bignumberText('transaction_amount'), // 交易金额/过户价
    transferFee: bignumberText('transfer_fee'), // 过户手续费（车管所费、代办服务费等）

    transferDate: isoLocalDate('transfer_date'), // 实际过户完成日期（绿本变更日）
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
    uniqueIndex('asset_transfer_records_no_uidx').on(table.transferNo),
    index('asset_transfer_records_asset_no_idx').on(table.assetNo),
    index('asset_transfer_records_loan_no_idx').on(table.loanNo),
  ],
);

export type AssetTransferRecord = typeof assetTransferRecords.$inferSelect;
export type NewAssetTransferRecord = typeof assetTransferRecords.$inferInsert;

// 车辆物理档案表
export const vehicles = sqliteTable(
  'vehicles',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    assetNo: text('asset_no').notNull(), // 关联资产主表编号 (customer_assets.assetNo)

    // ---- 核心唯一标识与基本特征 ----
    vin: text('vin').notNull(), // 车架号 / VIN码 (全局唯一防伪标识)
    engineNo: text('engine_no'), // 发动机号 / 电动机序列号
    licensePlate: text('license_plate'), // 当前车牌号 (过户后可同步更新此处为最新车牌)

    brand: text('brand'), // 品牌 (如: 丰田, 宝马, 理想)
    series: text('series'), // 车系 (如: 凯美瑞, 3系, L7)
    modelName: text('model_name'), // 详细车型配置名称 (如: 2023款 2.0G 豪华版)
    color: text('color'), // 车身颜色

    // ---- 技术参数与使用状态 ----
    energyType: text('energy_type').$type<EnergyType>().default(EnergyType.GASOLINE), // 动力/能源类型
    displacement: text('displacement'), // 排量 / 电池容量 (如: 2.0T / 75kWh)
    useType: text('use_type').$type<VehicleUseType>().default(VehicleUseType.NON_OPERATIONAL), // 使用性质
    mileage: bignumberText('mileage'), // 当前表显行驶里程 (公里)

    // ---- 关键时间节点与证书档案 ----
    manufactureDate: isoLocalDate('manufacture_date'), // 出厂日期
    registerDate: isoLocalDate('register_date'), // 初次登记日期 (计算车龄依据)
    issueDate: isoLocalDate('issue_date'), // 行驶证发证日期
    inspectionExpirationDate: isoLocalDate('inspection_exp_date'), // 年检到期日

    registrationCertificateNo: text('reg_cert_no'), // 机动车登记证书编号 (俗称绿本编号)

    // ---- 保险信息 ----
    compulsoryInsuranceExpDate: isoLocalDate('compulsory_ins_exp_date'), // 交强险到期日
    commercialInsuranceExpDate: isoLocalDate('commercial_ins_exp_date'), // 商业险到期日

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
    uniqueIndex('vehicles_asset_no_idx').on(table.assetNo),
    uniqueIndex('vehicles_vin_idx').on(table.vin), // VIN 码全局唯一索引
    index('vehicles_license_plate_idx').on(table.licensePlate),
  ],
);

export type Vehicle = typeof vehicles.$inferSelect;
export type NewVehicle = typeof vehicles.$inferInsert;
