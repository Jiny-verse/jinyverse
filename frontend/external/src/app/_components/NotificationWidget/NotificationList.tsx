'use client';

import Link from 'next/link';
import type { ApiOptions } from 'common/types';
import { markAllNotificationsRead } from 'common/services';
import type { Notification } from 'common/types';
import { useLanguage } from 'common/utils';
import { NotificationItem } from './NotificationItem';

interface NotificationListProps {
  notifications: Notification[];
  apiOptions: ApiOptions;
  onRead: (id: string) => void;
  onAllRead: () => void;
}

export function NotificationList({
  notifications,
  apiOptions,
  onRead,
  onAllRead,
}: NotificationListProps) {
  const { t } = useLanguage();

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead(apiOptions).catch((err) => { console.warn('[NotificationList] 전체 읽음 처리 실패:', err); });
    onAllRead();
  };

  return (
    <div className="w-80 rounded-lg border border-border bg-background shadow-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">{t('notification.title')}</h3>
        <button
          type="button"
          onClick={handleMarkAllRead}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {t('notification.markAllRead')}
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">{t('notification.empty')}</p>
        ) : (
          notifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              apiOptions={apiOptions}
              onRead={onRead}
            />
          ))
        )}
      </div>

      <div className="border-t border-border px-4 py-2">
        <Link href="/notifications" className="text-xs text-primary hover:underline">
          {t('notification.viewAll')}
        </Link>
      </div>
    </div>
  );
}
