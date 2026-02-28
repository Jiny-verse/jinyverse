'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useDomainContext, useGlobalRefresh } from 'common';
import { createMenu, updateMenu, deleteMenu } from 'common/services';
import type { Menu, MenuCreateInput, MenuUpdateInput } from 'common/types';
import type { ApiOptions } from 'common/types';

type MenuContextValue = ReturnType<
  typeof useDomainContext<Menu, MenuCreateInput, MenuUpdateInput>
>;

const MenuContext = createContext<MenuContextValue | null>(null);

export function MenuProvider({
  apiOptions,
  children,
}: {
  apiOptions: ApiOptions;
  children: ReactNode;
}) {
  const { triggerMenuRefresh } = useGlobalRefresh();
  const value = useDomainContext<Menu, MenuCreateInput, MenuUpdateInput>({
    apiOptions,
    services: {
      create: createMenu,
      update: updateMenu,
      delete: deleteMenu,
    },
    idKey: 'code',
    onReload: triggerMenuRefresh,
  });

  return React.createElement(MenuContext.Provider, { value }, children);
}

export function useMenuContext() {
  const context = useContext(MenuContext);
  if (!context) throw new Error('useMenuContext must be used within MenuProvider');
  return context;
}
