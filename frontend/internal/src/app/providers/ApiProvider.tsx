'use client';

import React, { createContext, useContext, useMemo } from 'react';
import type { ApiOptions } from 'common/types';

const defaultBaseUrl = typeof window !== 'undefined' ? '' : 'http://localhost:8080';

const ApiOptionsContext = createContext<ApiOptions | null>(null);

export function ApiProvider({
  children,
  baseUrl = defaultBaseUrl,
  channel = 'INTERNAL',
  role,
  accessToken,
  on401,
}: {
  children: React.ReactNode;
  baseUrl?: string;
  channel?: ApiOptions['channel'];
  role?: ApiOptions['role'];
  accessToken?: string | null;
  on401?: () => void;
}) {
  const value = useMemo<ApiOptions>(
    () => ({ baseUrl, channel, role: role ?? undefined, accessToken: accessToken ?? undefined, on401 }),
    [baseUrl, channel, role, accessToken, on401]
  );
  return <ApiOptionsContext.Provider value={value}>{children}</ApiOptionsContext.Provider>;
}

export function useApiOptions(): ApiOptions {
  const ctx = useContext(ApiOptionsContext);
  if (!ctx) {
    throw new Error('useApiOptions must be used within ApiProvider');
  }
  return ctx;
}
