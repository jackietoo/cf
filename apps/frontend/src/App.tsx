import { useEffect } from 'react';
import { AppRouter } from './router';
import { useUserStore } from './store/useUserStore';

export function App() {
  const fetchUser = useUserStore((state) => state.fetchUser);

  // 应用首次加载时，校验 Cookie Session
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return <AppRouter />;
}

export default App;
