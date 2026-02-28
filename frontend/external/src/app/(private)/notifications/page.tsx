'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getNotifications, markNotificationRead } from 'common/services';
import { useApiOptions } from '@/app/providers/ApiProvider';
import { useLanguage } from 'common/utils';
import type { Notification, PageResponse } from 'common/types';

const EMPTY_PAGE: PageResponse<Notification> = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  size: 10,
  number: 0,
  first: true,
  last: true,
};

export default function NotificationsPage() {
  const options = useApiOptions();
  const router = useRouter();
  const { t, language } = useLanguage();
  const [data, setData] = useState<PageResponse<Notification>>(EMPTY_PAGE);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    getNotifications(options, { page, size: 10 })
      .then(setData)
      .catch(() => setData(EMPTY_PAGE))
      .finally(() => setLoading(false));
  }, [options.baseUrl, options.channel, page]);

  useEffect(() => { load(); }, [load]);

  const dateLocale = language === 'ko' ? 'ko-KR' : language === 'ja' ? 'ja-JP' : 'en-US';

  const handleClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markNotificationRead(options, notification.id).catch((err) => { console.warn('[Notifications] 읽음 처리 실패:', err); });
      setData((prev) => ({
        ...prev,
        content: prev.content.map((n) =>
          n.id === notification.id ? { ...n, isRead: true } : n
        ),
      }));
    }
    if (notification.link) {
      router.push(notification.link.replace('/inquiries/me/', '/inquiries/'));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-foreground">{t('notification.title')}</h1>

      {loading && <p className="text-sm text-muted-foreground mb-4">{t('common.loading')}</p>}

      <div className="space-y-2">
        {data.content.length === 0 && !loading && (
          <p className="text-muted-foreground text-center py-8">{t('notification.pageEmpty')}</p>
        )}
        {data.content.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => handleClick(n)}
            className={`w-full text-left rounded-lg border p-4 hover:bg-muted/30 transition-colors ${
              n.isRead
                ? 'border-border bg-background opacity-70'
                : 'border-primary/30 bg-primary/5'
            }`}
          >
            <div className="flex items-start gap-3">
              {!n.isRead && <span className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />}
              <div className={!n.isRead ? '' : 'pl-5'}>
                <p className="text-sm text-foreground">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(n.createdAt).toLocaleString(dateLocale)}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {data.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1 border border-border rounded text-sm text-foreground disabled:opacity-40"
          >
            {t('common.previous')}
          </button>
          <span className="px-3 py-1 text-sm text-muted-foreground">
            {page + 1} / {data.totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))}
            disabled={page >= data.totalPages - 1}
            className="px-3 py-1 border border-border rounded text-sm text-foreground disabled:opacity-40"
          >
            {t('common.next')}
          </button>
        </div>
      )}
    </div>
  );
}
