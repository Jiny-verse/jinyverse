'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ApiOptions } from 'common/types';
import { getNotifications, getUnreadCount } from 'common/services';
import type { Notification } from 'common/types';
import { useLanguage } from 'common/utils';
import { NotificationList } from './NotificationList';

interface NotificationWidgetProps {
  apiOptions: ApiOptions;
}

export function NotificationWidget({ apiOptions }: NotificationWidgetProps) {
  const { t } = useLanguage();
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [listLoaded, setListLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchUnreadCount = useCallback(() => {
    getUnreadCount(apiOptions)
      .then((res) => setUnreadCount(res.count))
      .catch((err) => { console.warn('[NotificationWidget] 미읽음 수 로드 실패:', err); });
  }, [apiOptions.baseUrl, apiOptions.channel]);

  // 초기 + 30초 폴링
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30_000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // visibilitychange 시 즉시 갱신
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === 'visible') fetchUnreadCount();
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [fetchUnreadCount]);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleToggle = async () => {
    if (!open && !listLoaded) {
      getNotifications(apiOptions, { isRead: false, size: 10 })
        .then((res) => {
          setNotifications(res.content);
          setListLoaded(true);
        })
        .catch((err) => { console.warn('[NotificationWidget] 알림 목록 로드 실패:', err); });
    }
    setOpen((v) => !v);
  };

  const handleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleAllRead = () => {
    setNotifications([]);
    setUnreadCount(0);
    setListLoaded(false); // 다음에 열 때 DB에서 새로 로드
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        aria-label={t('notification.title')}
        className="relative w-10 h-10 flex items-center justify-center rounded-full bg-background border border-border shadow-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
      >
        {/* Bell icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50">
          <NotificationList
            notifications={notifications}
            apiOptions={apiOptions}
            onRead={handleRead}
            onAllRead={handleAllRead}
          />
        </div>
      )}
    </div>
  );
}
