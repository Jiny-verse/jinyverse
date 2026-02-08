'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { login as loginApi, logout as logoutApi, me as meApi, refresh as refreshApi } from '../services/auth';
import type { LoginRequest } from '../schemas/auth';

type AuthUser = { userId: string; username: string; role: string };

type AuthState = {
  baseUrl: string;
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  login: (body: LoginRequest) => Promise<void>;
  logout: () => void;
  clearAuth: () => void;
  on401: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({
  children,
  baseUrl,
  on401RedirectPath = '/login',
}: {
  children: React.ReactNode;
  baseUrl: string;
  on401RedirectPath?: string;
}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearAuth = useCallback(() => {
    setUser(null);
  }, []);

  const on401 = useCallback(() => {
    clearAuth();
    if (typeof window !== 'undefined' && on401RedirectPath) {
      window.location.href = on401RedirectPath;
    }
  }, [clearAuth, on401RedirectPath]);

  useEffect(() => {
    let cancelled = false;
    const restore = async () => {
      try {
        const data = await meApi(baseUrl);
        if (cancelled) return;
        if (data) {
          setUser({ userId: data.userId, username: data.username, role: data.role });
        }
      } catch {
        if (cancelled) return;
        try {
          const res = await refreshApi(baseUrl);
          if (cancelled) return;
          setUser({ userId: res.userId, username: res.username, role: res.role });
        } catch {
          clearAuth();
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    restore();
    return () => {
      cancelled = true;
    };
  }, [baseUrl, clearAuth]);

  const login = useCallback(
    async (body: LoginRequest) => {
      const res = await loginApi(baseUrl, body);
      setUser({ userId: res.userId, username: res.username, role: res.role });
    },
    [baseUrl]
  );

  const logout = useCallback(async () => {
    try {
      await logoutApi(baseUrl);
    } finally {
      clearAuth();
      if (typeof window !== 'undefined' && on401RedirectPath) {
        window.location.href = on401RedirectPath;
      }
    }
  }, [baseUrl, clearAuth, on401RedirectPath]);

  const value = useMemo<AuthState>(
    () => ({
      baseUrl,
      user,
      accessToken: null,
      refreshToken: null,
      isLoading,
      login,
      logout,
      clearAuth,
      on401,
    }),
    [baseUrl, user, isLoading, login, logout, clearAuth, on401]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
