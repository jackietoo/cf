import { useState } from 'react';
import type { LoginInput } from '@workspace/shared';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '@/components/login-form';
import { useAuth } from '@/context/AuthContext';
import { client } from '@/lib/client';

export function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useAuth(); // 如果 AuthContext 里需要记录用户名，可以按需传入
  const navigate = useNavigate();

  const handleSubmit = async (values: LoginInput) => {
    setLoading(true);
    setErrorMsg('');
    try {
      // 发送登录请求（后端会通过 Set-Cookie 设置 sessionId）
      const res = await client.api.auth.login.$post({ json: values });
      const result = await res.json();

      if (res.ok && result.success) {
        // 因为后端采用了 Cookie (HttpOnly)，前端不需要处理 token
        // 这里可以直接调用 Context 的登录态更新（例如记录已登录状态或用户名）
        login(values.username);
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

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm onSubmit={handleSubmit} isLoading={loading} errorMessage={errorMsg} />
      </div>
    </div>
  );
}
