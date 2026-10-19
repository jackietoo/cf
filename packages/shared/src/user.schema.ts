import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(3, '用户名至少3个字符').max(32),
  password: z.string().min(6, '密码至少6位').max(64),
  name: z.string().optional(),
  email: z.string().email('邮箱格式错误').optional(),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  username: z.string().min(1, '账号不能为空'),
  password: z.string().min(1, '密码不能为空'),
});
export type LoginInput = z.infer<typeof loginSchema>;
