'use client';

import { HorizontalNavigation } from 'common/components';
import { useAuth, useNavigationItems } from 'common';
import { ApiProvider, useApiOptions } from '@/app/providers/ApiProvider';
import { NotificationWidget } from '@/app/_components/NotificationWidget';
import { UserWidget } from '@/app/_components/UserWidget';
import { Footer } from '@/app/_components/Footer';

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

function ExternalPrivateContent({ children }: { children: React.ReactNode }) {
  const options = useApiOptions();
  const { items, isLoading } = useNavigationItems(options, 'external');

  const rightControls = (
    <div className="flex items-center gap-4">
      {options.role && <NotificationWidget apiOptions={options} />}
      <UserWidget apiOptions={options} />
    </div>
  );

  return (
    <>
      <HorizontalNavigation
        items={items}
        isLoading={isLoading}
        rightControls={rightControls}
        showLanguageSelector={false}
      />
      <main className="relative z-0 px-[4%] pb-6">{children}</main>
      <Footer items={items} />
    </>
  );
}

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  return (
    <ApiProvider baseUrl={baseUrl} channel="EXTERNAL" role={user?.role ?? null}>
      <ExternalPrivateContent>{children}</ExternalPrivateContent>
    </ApiProvider>
  );
}
