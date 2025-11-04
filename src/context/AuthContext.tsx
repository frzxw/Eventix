import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/lib/services/api-client';
import { clearTokens, getAccessToken, getRefreshToken, isAuthenticated as isAuthed, setTokens } from '@/lib/auth';

type User = { id: string; email: string; firstName: string; lastName: string } | null;

type AuthContextValue = {
  user: User;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (p: { email: string; password: string; firstName: string; lastName: string }) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [ready, setReady] = useState(false);

  // On mount, we can mark ready; actual user fetching can be added later
  useEffect(() => { setReady(true); }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await apiClient.auth.login(email, password);
    if (error) return { error };
    if (data?.accessToken && data?.refreshToken) {
      setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    }
    if (data?.user) setUser(data.user);
    return {};
  }, []);

  const signup = useCallback(async (p: { email: string; password: string; firstName: string; lastName: string }) => {
    const { data, error } = await apiClient.auth.signup(p);
    if (error) return { error };
    if (data?.accessToken && data?.refreshToken) {
      setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    }
    if (data?.user) setUser(data.user);
    return {};
  }, []);

  const logout = useCallback(async () => {
    // Optionally call backend logout; for now clear tokens
    clearTokens();
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    const rt = getRefreshToken();
    if (!rt) return false;
    const { data, error } = await apiClient.auth.refresh(rt);
    if (error || !data?.accessToken || !data?.refreshToken) return false;
    setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    return true;
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: isAuthed(),
    login,
    signup,
    logout,
    refresh,
  }), [user, login, signup, logout, refresh]);

  if (!ready) return null;
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
