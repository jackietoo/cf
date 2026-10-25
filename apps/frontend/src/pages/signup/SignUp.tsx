import { useEffect, useState } from 'react';
import { registerSchema, SettingKey } from '@workspace/shared';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@workspace/ui/components/field';
import { Input } from '@workspace/ui/components/input';
import { cn } from 'cn';
import { Link, useNavigate } from 'react-router';
import { userApi } from '@/services';

export function SignUp() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignupForm />
      </div>
    </div>
  );
}

export function SignupForm({ className, ...props }: React.ComponentProps<'div'>) {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // 状态控制：是否允许注册、是否正在检查配置
  const [registerEnabled, setRegisterEnabled] = useState(true);
  const [checking, setChecking] = useState(true);
  // 页面加载时请求单条配置接口，检查是否允许注册
  useEffect(() => {
    const checkRegisterStatus = async () => {
      try {
        const res = await fetch(`/api/settings/${SettingKey.ENABLE_REGISTER}`);
        const json = (await res.json()) as any;

        // 如果接口调用成功，并且配置项存在
        if (json.success && json.data) {
          // 只有明确为 'true' 时才允许注册，为 'false' 时关闭
          if (json.data.value === 'true') {
            setRegisterEnabled(true);
          } else {
            setRegisterEnabled(false);
          }
        } else {
          // 如果返回 404、success 为 false 或配置项不存在，默认关闭注册
          setRegisterEnabled(false);
        }
      } catch (err) {
        console.error('获取系统配置失败', err);
        setRegisterEnabled(true);
      } finally {
        setChecking(false);
      }
    };

    checkRegisterStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // 对应 registerSchema 中的字段
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;

    // 1. 使用 Zod 的 registerSchema 在前端进行预校验
    const validationResult = registerSchema.safeParse({
      username,
      password,
      confirmPassword,
      name: name || undefined,
      email: email || undefined,
    });

    if (!validationResult.success) {
      // 获取第一条校验错误信息
      setError(validationResult.error.issues[0].message);
      return;
    }

    try {
      setLoading(true);
      setError('');

      // 2. 调用后端注册接口（传入校验通过的数据）
      await userApi.register(validationResult.data);

      // 3. 注册成功后跳转到登录页
      navigate('/login');
    } catch (err: any) {
      setError(err?.message || '注册失败，请检查填写的信息');
    } finally {
      setLoading(false);
    }
  };
  // 正在检查配置时显示加载状态
  if (checking) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
        加载中...
      </div>
    );
  }
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>创建账号</CardTitle>
        </CardHeader>
        <CardContent>
          {/* 2. 如果后台关闭了注册，直接显示提示并不渲染表单 */}
          {!registerEnabled ? (
            <div className="rounded-md bg-amber-50 p-4 text-center text-sm text-amber-600 font-medium">
              系统当前已关闭自主注册功能
              <div className="mt-4">
                <Link to="/login" className="underline text-blue-600">
                  返回登录页
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                {/* 错误提示框 */}
                {error && (
                  <div className="rounded-md bg-red-50 p-2 text-sm text-red-500 font-medium">
                    {error}
                  </div>
                )}

                {/* 账号/用户名 (对应 registerSchema 的 username) */}
                <Field>
                  <FieldLabel htmlFor="username">账号</FieldLabel>
                  <Input id="username" name="username" type="text" required />
                </Field>

                {/* 姓名 (对应 registerSchema 的 name，选填) */}
                <Field>
                  <FieldLabel htmlFor="name">姓名</FieldLabel>
                  <Input id="name" name="name" type="text" />
                </Field>

                {/* 邮箱 (对应 registerSchema 的 email，选填) */}
                {/* <Field>
                <FieldLabel htmlFor="email">邮箱 (可选)</FieldLabel>
                <Input id="email" name="email" type="email" />
              </Field> */}

                {/* 密码 (对应 registerSchema 的 password) */}
                <Field>
                  <FieldLabel htmlFor="password">密码</FieldLabel>
                  <Input id="password" name="password" type="password" required />
                </Field>

                <Field>
                  <FieldLabel htmlFor="confirmPassword">确认密码</FieldLabel>
                  <Input id="confirmPassword" name="confirmPassword" type="password" required />
                </Field>

                <FieldGroup>
                  <Field>
                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? '注册中...' : '创建账号'}
                    </Button>

                    <FieldDescription className="px-6 text-center mt-2">
                      已有账号？{' '}
                      <Link to="/login" className="underline text-blue-600">
                        直接登录
                      </Link>
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </FieldGroup>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
