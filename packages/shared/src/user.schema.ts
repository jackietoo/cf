import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(1, '用户名至少3个字符').max(32),
  password: z.string().min(1, '密码至少6位').max(64),
  name: z.string().optional(),
  email: z.email('邮箱格式错误').optional(),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  username: z.string().min(1, '账号不能为空'),
  password: z.string().min(1, '密码不能为空'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, '请输入原密码'),
    newPassword: z.string(),
    // .min(8, '新密码至少8位')
    // .max(128, '新密码长度不能超过128位')
    // .regex(/[A-Z]/, '新密码需要包含大写字母')
    // .regex(/[a-z]/, '新密码需要包含小写字母')
    // .regex(/[0-9]/, '新密码需要包含数字'),
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: '新密码不能与原密码相同',
    path: ['newPassword'], // 将错误信息绑定到新密码字段
  });
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
