import { useCallback, useEffect, useState } from 'react';
import { api, getToken, saveToken } from '../services/api';
import { AuthContext } from './auth';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  const logout = useCallback(() => {
    saveToken(null);
    setUser(null);
    setError('');
  }, []);

  useEffect(() => {
    const expired = () => {
      logout();
      setError('Sua sessão expirou. Entre novamente para continuar.');
    };
    window.addEventListener('session-expired', expired);
    return () => window.removeEventListener('session-expired', expired);
  }, [logout]);

  useEffect(() => {
    const controller = new AbortController();

    async function restoreSession() {
      try {
        if (getToken()) {
          const data = await api('/auth/me', { signal: controller.signal });
          setUser(data.user);
        }
      } catch (requestError) {
        if (requestError.name === 'AbortError') return;
        if (requestError.status !== 401) setError(requestError.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    restoreSession();
    return () => controller.abort();
  }, [attempt]);

  async function authenticate(mode, credentials) {
    const data = await api(`/auth/${mode}`, { method: 'POST', body: credentials });
    saveToken(data.token);
    setUser(data.user);
    setError('');
  }

  function retry() {
    setError('');
    setLoading(true);
    setAttempt((value) => value + 1);
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, authenticate, logout, retry }}>
      {children}
    </AuthContext.Provider>
  );
}
