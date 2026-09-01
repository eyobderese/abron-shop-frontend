import { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../lib/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    authApi.restore().then((result) => {
      if (!cancelled) {
        setSession(result ? { user: result.user } : null);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  async function login(email, password) {
    const result = await authApi.login(email, password);
    setSession({ user: result.user });
    return result;
  }

  async function logout() {
    await authApi.logout();
    setSession(null);
  }

  return (
    <AuthContext.Provider value={{ session, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
