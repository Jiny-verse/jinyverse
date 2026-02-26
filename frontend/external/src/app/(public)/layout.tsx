'use client';

import Link from 'next/link';
import { HorizontalNavigation } from 'common/components';
import { useAuth, useNavigationItems } from 'common';
import { useLanguage } from 'common/utils';
import { ApiProvider, useApiOptions } from '@/app/providers/ApiProvider';
import { NotificationWidget } from '@/components/NotificationWidget';
import { UserWidget } from '@/components/UserWidget';

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

function ExternalPublicContent({ children }: { children: React.ReactNode }) {
  const options = useApiOptions();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { items, isLoading } = useNavigationItems(options, 'external');

  const rightControls = (
    <div className="flex items-center">
      {user ? (
        <>
          <NotificationWidget apiOptions={options} />
          <UserWidget apiOptions={options} />
        </>
      ) : (
        <Link
          href="/login"
          className="h-10 flex items-center px-5 text-sm font-medium text-foreground bg-background border border-border shadow-sm rounded-full hover:bg-muted/50 transition-colors no-underline"
        >
          {t('nav.login')}
        </Link>
      )}
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
      <main className="relative z-0 px-[4%] pt-20 pb-6">{children}</main>
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
