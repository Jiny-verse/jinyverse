'use client';

import { HorizontalNavigation } from 'common/components';
import { ApiProvider } from '@/app/providers/ApiProvider';

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ApiProvider baseUrl={baseUrl} channel="EXTERNAL" role={null}>
      <HorizontalNavigation channel="external" />
      <main className="relative z-0 px-[4%] py-6">{children}</main>
    </ApiProvider>
  );
}
