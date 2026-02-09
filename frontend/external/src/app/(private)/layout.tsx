'use client';

import { HorizontalNavigation } from 'common/components';
import { useNavigationItems } from 'common';
import { ApiProvider, useApiOptions } from '@/app/providers/ApiProvider';

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

function ExternalPrivateContent({ children }: { children: React.ReactNode }) {
  const options = useApiOptions();
  const { items, isLoading } = useNavigationItems(options, 'external');
  return (
    <>
      <HorizontalNavigation items={items} isLoading={isLoading} />
      <main className="relative z-0 px-[4%] py-6">{children}</main>
    </>
  );
}

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ApiProvider baseUrl={baseUrl} channel="EXTERNAL" role={null}>
      <ExternalPrivateContent>{children}</ExternalPrivateContent>
    </ApiProvider>
  );
}
