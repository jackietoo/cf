import { useEffect, useRef, useState } from 'react';
import { loginSchema } from '@workspace/shared';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '@/components/login-form';
import { useAuth } from '@/context/AuthContext';
import { client } from '@/lib/client';

export function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const formContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = formContainerRef.current;
    if (!container) return;

    // 将参数类型改为标准 Event，完美适配 EventListener
    const handleNativeSubmit = async (e: Event) => {
      e.preventDefault();
      setLoading(true);
      setErrorMsg('');

      // 获取 LoginForm 内部的输入框值
      const emailInput = container.querySelector('#username') as HTMLInputElement;
      const passwordInput = container.querySelector('#password') as HTMLInputElement;

      const username = emailInput?.value || '';
      const password = passwordInput?.value || '';

      // 使用 shared 中的 loginSchema 进行前端校验
      const validation = loginSchema.safeParse({ username, password });
      if (!validation.success) {
        setErrorMsg(validation.error.issues[0].message);
        setLoading(false);
        return;
      }

      try {
        const res = await client.api.auth.login.$post({ json: { username, password } });
        const result = await res.json();

        if (res.ok && result.success) {
          login(username);
          navigate('/dashboard', { replace: true });
        } else {
          setErrorMsg(result.message || '登录失败');
        }
      } catch {
        setErrorMsg('网络请求异常');
      } finally {
        setLoading(false);
      }
    };

    container.addEventListener('submit', handleNativeSubmit);
    return () => {
      container.removeEventListener('submit', handleNativeSubmit);
    };
  }, [login, navigate]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl" ref={formContainerRef}>
        <LoginForm />

        {/* 错误提示展示区 */}
        {errorMsg && (
          <div className="mt-4 rounded bg-red-50 p-2 text-center text-sm text-red-600">
            {errorMsg}
          </div>
        )}
      </div>
    </div>
  );
}
