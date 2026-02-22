'use client';

import { useLanguage } from 'common/utils';

export default function TopicDetailError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-start gap-4 py-12">
      <p className="text-red-500 text-sm">{t('message.error')}</p>
      <p className="text-gray-400 text-xs">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
      >
        {t('common.retry')}
      </button>
    </div>
  );
}
