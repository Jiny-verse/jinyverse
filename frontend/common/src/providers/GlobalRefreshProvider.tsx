'use client';
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface GlobalRefreshContextValue {
  menuRefreshKey: number;
  triggerMenuRefresh: () => void;
}

const GlobalRefreshContext = createContext<GlobalRefreshContextValue | null>(null);

export function GlobalRefreshProvider({ children }: { children: ReactNode }) {
  const [menuRefreshKey, setMenuRefreshKey] = useState(0);
  const triggerMenuRefresh = useCallback(() => setMenuRefreshKey((k) => k + 1), []);
  return (
    <GlobalRefreshContext.Provider value={{ menuRefreshKey, triggerMenuRefresh }}>
      {children}
    </GlobalRefreshContext.Provider>
  );
}

// null-safe fallback: Provider 없는 앱(external)에서도 에러 없이 동작
export function useGlobalRefresh(): GlobalRefreshContextValue {
  return useContext(GlobalRefreshContext) ?? { menuRefreshKey: 0, triggerMenuRefresh: () => {} };
}
