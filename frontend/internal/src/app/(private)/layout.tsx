'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SideNavigation } from 'common/components';
import { useNavigationItems } from 'common';
import { ApiProvider, useApiOptions } from '@/app/providers/ApiProvider';
import { useAuth } from 'common';
import { useLanguage } from 'common/utils';

function PrivateLayoutContent({
  children,
  logout,
}: {
  children: React.ReactNode;
  logout: () => void;
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const { user } = useAuth();
  const options = useApiOptions();
  const { items, isLoading } = useNavigationItems(options, 'internal');

  return (
    <div className="flex min-h-screen">
      <SideNavigation items={items} isLoading={isLoading} />
      <div className="ml-64 flex-1 flex flex-col">
        <header className="flex items-center justify-end gap-4 border-b border-[#333] px-[4%] py-3">
          <span className="text-sm text-neutral-400">{user?.username}</span>
          <button
            type="button"
            onClick={() => {
              logout();
              router.replace('/login');
            }}
            className="text-sm text-neutral-400 hover:text-white"
          >
            {t('ui.button.logout')}
          </button>
        </header>
        <main className="flex-1 px-[4%] py-6">{children}</main>
      </div>
    </div>
  );
}

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const { user, isLoading, baseUrl, on401, logout } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-neutral-400">{t('common.loading')}</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <ApiProvider
      baseUrl={baseUrl}
      channel="INTERNAL"
      role={user.role?.toLowerCase() === 'admin' ? 'admin' : 'user'}
      on401={on401}
    >
      <PrivateLayoutContent logout={logout}>{children}</PrivateLayoutContent>
    </ApiProvider>
  );
}
