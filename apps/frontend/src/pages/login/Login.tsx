import { useEffect, useState } from 'react';
import { loginSchema } from '@workspace/shared';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@workspace/ui/components/field';
import { Input } from '@workspace/ui/components/input';
import { cn } from 'cn';
import { Link, useNavigate } from 'react-router';
import { userApi } from '@/services/user';
import { useUserStore } from '@/store/useUserStore';

export function Login() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const navigate = useNavigate();
  const login = useUserStore((state) => state.login);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    // 1. 使用 Zod 的 loginSchema 在前端进行预校验
    const validationResult = loginSchema.safeParse({ username, password });
    if (!validationResult.success) {
      // 获取 Zod 校验出的第一条错误信息
      setError(validationResult.error.issues[0].message);
      return;
    }

    try {
      setLoading(true);
      setError('');

      // 2. 调用 Zustand 的登录方法（传入校验通过的数据）
      await login(validationResult.data);

      // 3. 登录成功，跳转到后台首页
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || '登录失败，请检查账号或密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6">
      <div className={cn('w-full max-w-sm flex flex-col gap-6', className)} {...props}>
        <Card>
          <CardHeader>
            <CardTitle>登录系统</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                {/* 错误提示 */}
                {error && (
                  <div className="rounded-md bg-red-50 p-2 text-sm text-red-500 font-medium">
                    {error}
                  </div>
                )}

                <Field>
                  <FieldLabel htmlFor="username">账号</FieldLabel>
                  <Input id="username" name="username" type="text" required />
                </Field>

                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">密码</FieldLabel>
                  </div>
                  <Input id="password" name="password" type="password" required />
                </Field>

                <Field>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? '登录中...' : '登录'}
                  </Button>

                  <FieldDescription className="text-center mt-2">
                    还没有账号？{' '}
                    <Link to="/sign-up" className="underline text-blue-600">
                      去注册
                    </Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
