'use client';

import { useState, useEffect } from 'react';
import { getMenus } from '../services/menu';
import { menusToNavigationItemsTree } from '../data/navigation';
import { useGlobalRefresh } from '../providers';
import type { ApiOptions } from '../types/api';
import type { NavigationItem } from '../types/navigation';

export function useNavigationItems(
  apiOptions: ApiOptions | null,
  channel: 'external' | 'internal'
): { items: NavigationItem[]; isLoading: boolean } {
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { menuRefreshKey } = useGlobalRefresh();

  useEffect(() => {
    if (!apiOptions) {
      setItems([]);
      setIsLoading(false);
      return;
    }
    getMenus(apiOptions, { size: 100 })
      .then((res) => setItems(menusToNavigationItemsTree(res.content, channel)))
      .catch(() => setItems([]))
      .finally(() => setIsLoading(false));
  }, [apiOptions?.baseUrl, apiOptions?.channel, channel, menuRefreshKey]);

  return { items, isLoading };
}
