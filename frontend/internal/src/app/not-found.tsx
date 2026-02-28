'use client';

import Link from 'next/link';
import { useLanguage } from 'common/utils';

export default function NotFound() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center gap-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">{t('error.notFound')}</p>
      <Link href="/">{t('ui.button.back')}</Link>
    </div>
  );
}
