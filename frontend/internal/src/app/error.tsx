'use client';

import { useLanguage } from 'common/utils';

export default function ErrorPage({ reset }: { reset: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center gap-4">
      <h1 className="text-2xl font-bold">{t('message.error')}</h1>
      <p className="text-muted-foreground">{t('error.serverError')}</p>
      <button onClick={reset}>{t('common.retry')}</button>
    </div>
  );
}
