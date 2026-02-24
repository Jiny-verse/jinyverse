'use client';

import { HorizontalNavigation } from 'common/components';
import { useAuth, useNavigationItems } from 'common';
import { ApiProvider, useApiOptions } from '@/app/providers/ApiProvider';
import { ThemeToggle } from '@/components/ThemeToggle';

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

function ExternalPublicContent({ children }: { children: React.ReactNode }) {
  const options = useApiOptions();
  const { items, isLoading } = useNavigationItems(options, 'external');
  return (
    <>
      <HorizontalNavigation items={items} isLoading={isLoading} rightControls={<ThemeToggle />} />
      <main className="relative z-0 px-[4%] py-6">{children}</main>
    </>
  );
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return (
    <ApiProvider baseUrl={baseUrl} channel="EXTERNAL" role={user?.role ?? null}>
      <ExternalPublicContent>{children}</ExternalPublicContent>
    </ApiProvider>
  );
}
