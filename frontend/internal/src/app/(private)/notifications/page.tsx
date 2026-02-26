'use client';

import { useCallback, useEffect, useState } from 'react';
import { getNotifications } from 'common/services';
import { useApiOptions } from '@/app/providers/ApiProvider';
import { DataTable, type ColumnDef } from 'common/components';
import { Badge, FilterSelect } from 'common/ui';
import type { Notification, PageResponse } from 'common/types';
import { useLanguage } from 'common/utils';

const EMPTY_PAGE: PageResponse<Notification> = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  size: 20,
  number: 0,
  first: true,
  last: true,
};

const READ_OPTIONS = [
  { value: 'false', label: '미읽음' },
  { value: 'true', label: '읽음' },
];

export default function NotificationsPage() {
  const options = useApiOptions();
  const { t } = useLanguage();
  const [data, setData] = useState<PageResponse<Notification>>(EMPTY_PAGE);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [isRead, setIsRead] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const params: Parameters<typeof getNotifications>[1] = { page, size };
    if (isRead !== '') params.isRead = isRead === 'true';
    getNotifications(options, params)
      .then(setData)
      .catch(() => setData(EMPTY_PAGE))
      .finally(() => setLoading(false));
  }, [options.baseUrl, options.channel, page, size, isRead]);

  useEffect(() => { load(); }, [load]);

  const columns: ColumnDef<Notification>[] = [
    {
      key: 'type',
      header: '타입',
      render: (row) => <Badge variant="default">{row.type}</Badge>,
    },
    {
      key: 'message',
      header: '메시지',
      render: (row) => <span className="text-sm">{row.message}</span>,
    },
    {
      key: 'isRead',
      header: '읽음',
      render: (row) => (
        <Badge variant={row.isRead ? 'success' : 'warning'}>
          {row.isRead ? '읽음' : '미읽음'}
        </Badge>
      ),
    },
    {
      key: 'emailSent',
      header: '이메일',
      render: (row) => (
        row.sendEmail
          ? <Badge variant={row.emailSent ? 'success' : 'error'}>{row.emailSent ? '발송완료' : '미발송'}</Badge>
          : <span className="text-muted-foreground text-xs">-</span>
      ),
    },
    {
      key: 'createdAt',
      header: '생성일',
      render: (row) => (
        <span className="text-muted-foreground text-xs">
          {new Date(row.createdAt).toLocaleString('ko-KR')}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">알림 목록</h1>
      </div>
      {loading && <p className="text-sm text-muted-foreground mb-2">{t('common.loading')}</p>}
      <DataTable<Notification>
        data={data.content}
        columns={columns}
        isLoading={loading}
        emptyMessage="알림이 없습니다."
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
            label="읽음 상태"
            value={isRead}
            options={READ_OPTIONS}
            onChange={(v) => { setIsRead(v); setPage(0); }}
            placeholder="전체"
          />
        }
      />
    </div>
  );
}
