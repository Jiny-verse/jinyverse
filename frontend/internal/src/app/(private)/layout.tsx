'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SideNavigation } from 'common/components';
import { ApiProvider } from '@/app/providers/ApiProvider';
import { useAuth } from 'common';

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        <p className="text-neutral-400">로딩 중...</p>
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
      <div className="flex min-h-screen">
        <SideNavigation channel="internal" />
        <div className="ml-64 flex-1 flex flex-col">
          <header className="flex items-center justify-end gap-4 border-b border-[#333] px-[4%] py-3">
            <span className="text-sm text-neutral-400">{user.username}</span>
            <button
              type="button"
              onClick={() => {
                logout();
                router.replace('/login');
              }}
              className="text-sm text-neutral-400 hover:text-white"
            >
              로그아웃
            </button>
          </header>
          <main className="flex-1 px-[4%] py-6">{children}</main>
        </div>
      </div>
    </ApiProvider>
  );
}
