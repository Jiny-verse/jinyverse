'use client';

import React, { createContext, useContext, useMemo } from 'react';
import type { ApiOptions } from 'common/types';

const defaultBaseUrl = typeof window !== 'undefined' ? '' : 'http://localhost:8080';

const ApiOptionsContext = createContext<ApiOptions | null>(null);

export function ApiProvider({
  children,
  baseUrl = defaultBaseUrl,
  channel = 'EXTERNAL',
  role = null,
}: {
  children: React.ReactNode;
  baseUrl?: string;
  channel?: ApiOptions['channel'];
  role?: ApiOptions['role'];
}) {
  const value = useMemo<ApiOptions>(
    () => ({ baseUrl, channel, role }),
    [baseUrl, channel, role]
  );
  return (
    <ApiOptionsContext.Provider value={value}>
      {children}
    </ApiOptionsContext.Provider>
  );
}

export function useApiOptions(): ApiOptions {
  const ctx = useContext(ApiOptionsContext);
  if (!ctx) {
    throw new Error('useApiOptions must be used within ApiProvider');
  }
  return ctx;
}
