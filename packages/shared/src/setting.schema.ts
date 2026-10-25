import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { z } from 'zod';

dayjs.extend(customParseFormat);

export const SettingKey = {
  ENABLE_REGISTER: 'enable_register',
  MAINTENANCE_MODE: 'maintenance_mode',
} as const;
export type SettingKey = (typeof SettingKey)[keyof typeof SettingKey];

export const updateSettingSchema = z.object({
  key: z.custom<SettingKey>((val) => typeof val === 'string', {
    message: '非法的配置键',
  }),
  value: z.string(),
});

export type UpdateSettingInput = z.infer<typeof updateSettingSchema>;
