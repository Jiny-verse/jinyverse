'use client';

import { useRouter } from 'next/navigation';
import type { ApiOptions } from 'common/types';
import { markNotificationRead } from 'common/services';
import type { Notification } from 'common/types';
import { useLanguage } from 'common/utils';

interface NotificationItemProps {
  notification: Notification;
  apiOptions: ApiOptions;
  onRead: (id: string) => void;
}

export function NotificationItem({ notification, apiOptions, onRead }: NotificationItemProps) {
  const router = useRouter();
  const { language } = useLanguage();

  const handleClick = async () => {
    if (!notification.isRead) {
      await markNotificationRead(apiOptions, notification.id).catch(() => {});
      onRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link.replace('/inquiries/me/', '/inquiries/'));
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border last:border-0 ${
        notification.isRead ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start gap-2">
        {!notification.isRead && (
          <span className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />
        )}
        <div className={!notification.isRead ? '' : 'pl-4'}>
          <p className="text-sm text-foreground line-clamp-2">{notification.message}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(notification.createdAt).toLocaleString(language === 'ko' ? 'ko-KR' : language === 'ja' ? 'ja-JP' : 'en-US')}
          </p>
        </div>
      </div>
    </button>
  );
}
