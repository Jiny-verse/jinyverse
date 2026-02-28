'use client';

import { useCallback, useEffect, useState } from 'react';
import { getNotifications } from 'common/services';
import { useApiOptions } from '@/app/providers/ApiProvider';
import { DataTable, type ColumnDef } from 'common/components';
import { Badge, FilterSelect, Alert } from 'common/ui';
import type { Notification, PageResponse } from 'common/types';
import { useLanguage, parseApiError } from 'common/utils';

const EMPTY_PAGE: PageResponse<Notification> = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  size: 10,
  number: 0,
  first: true,
  last: true,
};

const READ_OPTIONS = (t: any) => [
  { value: 'false', label: t('notification.unread', { defaultValue: '미읽음' }) },
  { value: 'true', label: t('notification.read', { defaultValue: '읽음' }) },
];

export default function NotificationsPage() {
  const options = useApiOptions();
  const { t } = useLanguage();
  const [data, setData] = useState<PageResponse<Notification>>(EMPTY_PAGE);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [isRead, setIsRead] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const readOptions = READ_OPTIONS(t);

  const load = useCallback(() => {
    setLoading(true);
    setLoadError(null);
    const params: Parameters<typeof getNotifications>[1] = { page, size };
    if (isRead !== '') params.isRead = isRead === 'true';
    getNotifications(options, params)
      .then(setData)
      .catch((e) => {
        const { messageKey, fallback } = parseApiError(e);
        setLoadError(t(messageKey) || fallback);
      })
      .finally(() => setLoading(false));
  }, [options.baseUrl, options.channel, page, size, isRead]);

  useEffect(() => { load(); }, [load]);

  const columns: ColumnDef<Notification>[] = [
    {
      key: 'type',
      header: t('form.label.type'),
      render: (row) => <Badge variant="default">{row.type}</Badge>,
    },
    {
      key: 'message',
      header: t('notification.message', { defaultValue: '메시지' }),
      render: (row) => <span className="text-sm">{row.message}</span>,
    },
    {
      key: 'isRead',
      header: t('notification.isRead', { defaultValue: '읽음' }),
      render: (row) => (
        <Badge variant={row.isRead ? 'success' : 'warning'}>
          {row.isRead ? t('notification.read', { defaultValue: '읽음' }) : t('notification.unread', { defaultValue: '미읽음' })}
        </Badge>
      ),
    },
    {
      key: 'emailSent',
      header: t('notification.email', { defaultValue: '이메일' }),
      render: (row) => (
        row.sendEmail
          ? <Badge variant={row.emailSent ? 'success' : 'error'}>{row.emailSent ? t('notification.sent', { defaultValue: '발송완료' }) : t('notification.notSent', { defaultValue: '미발송' })}</Badge>
          : <span className="text-muted-foreground text-xs">-</span>
      ),
    },
    {
      key: 'createdAt',
      header: t('form.label.createdAt'),
      render: (row) => (
        <span className="text-muted-foreground text-xs">
          {new Date(row.createdAt).toLocaleString('ko-KR')}
        </span>
      ),
    },
  ];

  if (loadError) {
    return (
      <Alert variant="error">
        <p>{loadError}</p>
        <button onClick={load}>{t('common.retry')}</button>
      </Alert>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('notification.title')}</h1>
      </div>
      {loading && <p className="text-sm text-muted-foreground mb-2">{t('common.loading')}</p>}
      <DataTable<Notification>
        data={data.content}
        columns={columns}
        isLoading={loading}
        emptyMessage={t('notification.empty')}
        pagination={{
          page,
          size,
          totalElements: data.totalElements,
          totalPages: data.totalPages,
          onPageChange: setPage,
          onSizeChange: (s) => { setSize(s); setPage(0); },
        }}
        filterSlot={
          <FilterSelect
            label={t('notification.isRead', { defaultValue: '읽음 상태' })}
            value={isRead}
            options={readOptions}
            onChange={(v) => { setIsRead(v); setPage(0); }}
            placeholder={t('common.all')}
          />
        }
      />
    </div>
  );
}
