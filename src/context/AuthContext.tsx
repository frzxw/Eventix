import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/lib/services/api-client';
import {
  AuthStoredUser,
  clearStoredUser,
  clearTokens,
  extractUserFromToken,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  getTokenStoragePreference,
  hasTokens,
  setStoredUser,
  setTokens,
} from '@/lib/auth';

type User = AuthStoredUser | null;

type AuthContextValue = {
  user: User;
  isAuthenticated: boolean;
  login: (email: string, password: string, options?: { remember?: boolean }) => Promise<{ error?: string }>;
  signup: (p: { email: string; password: string; firstName: string; lastName: string; phoneNumber?: string; remember?: boolean }) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => Boolean(getAccessToken()));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const initialise = () => {
      const storedUser = getStoredUser();
      if (storedUser) {
        setUser(storedUser);
        setIsAuthenticated(true);
        return;
      }

      const token = getAccessToken();
      if (token) {
        const tokenUser = extractUserFromToken(token);
        if (tokenUser) {
          setUser(tokenUser);
          setStoredUser(tokenUser);
          setIsAuthenticated(true);
        }
      }
    };

    initialise();
    setReady(true);
  }, []);

  const login = useCallback(async (email: string, password: string, options?: { remember?: boolean }) => {
    const { data, error } = await apiClient.auth.login(email, password);
    if (error) return { error };
    if (data?.accessToken && data?.refreshToken) {
      setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken }, options);
    }
    if (data?.user) {
      setUser(data.user);
      setStoredUser(data.user, options);
    } else if (data?.accessToken) {
      const tokenUser = extractUserFromToken(data.accessToken);
      if (tokenUser) {
        setUser(tokenUser);
        setStoredUser(tokenUser, options);
      }
    }
    setIsAuthenticated(true);
    return {};
  }, []);

  const signup = useCallback(async (p: { email: string; password: string; firstName: string; lastName: string; phoneNumber?: string; remember?: boolean }) => {
    const { remember, ...payload } = p;
    const { data, error } = await apiClient.auth.signup(payload);
    if (error) return { error };
    if (data?.accessToken && data?.refreshToken) {
      setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken }, { remember });
    }
    if (data?.user) {
      setUser(data.user);
      setStoredUser(data.user, { remember });
    } else if (data?.accessToken) {
      const tokenUser = extractUserFromToken(data.accessToken);
      if (tokenUser) {
        setUser(tokenUser);
        setStoredUser(tokenUser, { remember });
      }
    }
    setIsAuthenticated(true);
    return {};
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.auth.logout();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Logout API failed, clearing local state', error);
      }
    }
    clearTokens();
    clearStoredUser();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const refresh = useCallback(async () => {
    const rt = getRefreshToken();
    if (!rt) return false;
    const { data, error } = await apiClient.auth.refresh(rt);
    if (error || !data?.accessToken || !data?.refreshToken) return false;
    const preference = getTokenStoragePreference();
    setTokens(
      { accessToken: data.accessToken, refreshToken: data.refreshToken },
      preference ? { storagePreference: preference } : undefined,
    );
    if (!user) {
      const tokenUser = extractUserFromToken(data.accessToken);
      if (tokenUser) {
        setUser(tokenUser);
        setStoredUser(tokenUser, preference ? { storagePreference: preference } : undefined);
      }
    }
    setIsAuthenticated(true);
    return true;
  }, [user]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: isAuthenticated || hasTokens(),
    login,
    signup,
    logout,
    refresh,
  }), [user, isAuthenticated, login, signup, logout, refresh]);

  if (!ready) return null;
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
