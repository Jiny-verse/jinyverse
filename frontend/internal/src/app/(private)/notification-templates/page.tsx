'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { getNotificationTemplates, deleteNotificationTemplate } from 'common/services';
import { useApiOptions } from '@/app/providers/ApiProvider';
import { DataTable, type ColumnDef } from 'common/components';
import { Badge, FilterSelect, ConfirmDialog, Alert } from 'common/ui';
import type { NotificationTemplate, PageResponse } from 'common/types';
import { useLanguage, parseApiError } from 'common/utils';

const EMPTY_PAGE: PageResponse<NotificationTemplate> = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  size: 10,
  number: 0,
  first: true,
  last: true,
};

const CHANNEL_OPTIONS = [
  { value: 'system', label: 'System Only' },
  { value: 'email', label: 'Email Only' },
  { value: 'both', label: 'System + Email' },
];

const CHANNEL_VARIANTS: Record<string, 'default' | 'success' | 'warning' | 'error'> = {
  system: 'default',
  email: 'warning',
  both: 'success',
};

export default function NotificationTemplatesPage() {
  const options = useApiOptions();
  const { t } = useLanguage();
  const [data, setData] = useState<PageResponse<NotificationTemplate>>(EMPTY_PAGE);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [q, setQ] = useState('');
  const [channel, setChannel] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setLoadError(null);
    getNotificationTemplates(options, { page, size, q: q || undefined, channel: channel || undefined })
      .then(setData)
      .catch((e) => {
        const { messageKey, fallback } = parseApiError(e);
        setLoadError(t(messageKey) || fallback);
      })
      .finally(() => setLoading(false));
  }, [options.baseUrl, options.channel, page, size, q, channel]);

  useEffect(() => { load(); }, [load]);

  const handleDeleteConfirm = async () => {
    if (!pendingDeleteId) return;
    await deleteNotificationTemplate(options, pendingDeleteId);
    setPendingDeleteId(null);
    load();
  };

  const columns: ColumnDef<NotificationTemplate>[] = [
    {
      key: 'name',
      header: t('notification.template.name', { defaultValue: '템플릿명' }),
      render: (row) => (
        <Link href={`/notification-templates/${row.id}`} className="font-medium text-primary hover:underline">
          {row.name}
        </Link>
      ),
    },
    {
      key: 'channel',
      header: t('form.label.channel', { defaultValue: '채널' }),
      render: (row) => (
        <Badge variant={CHANNEL_VARIANTS[row.channel] ?? 'default'}>{row.channel}</Badge>
      ),
    },
    {
      key: 'description',
      header: '설명',
      render: (row) => <span className="text-muted-foreground text-sm">{row.description ?? '-'}</span>,
    },
    {
      key: 'createdAt',
      header: '생성일',
      render: (row) => (
        <span className="text-muted-foreground text-xs">
          {new Date(row.createdAt).toLocaleDateString('ko-KR')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <button
          type="button"
          onClick={() => setPendingDeleteId(row.id)}
          className="text-xs text-destructive hover:underline"
        >
          {t('ui.button.delete')}
        </button>
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
        <h1 className="text-2xl font-bold">{t('notification.template.title', { defaultValue: '알림 템플릿' })}</h1>
        <Link
          href="/notification-templates/new"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
        >
          + {t('notification.template.new', { defaultValue: '새 템플릿' })}
        </Link>
      </div>
      {loading && <p className="text-sm text-muted-foreground mb-2">{t('common.loading')}</p>}
      <ConfirmDialog
        isOpen={pendingDeleteId !== null}
        message={t('message.confirmDelete')}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPendingDeleteId(null)}
      />
      <DataTable<NotificationTemplate>
        data={data.content}
        columns={columns}
        isLoading={loading}
        emptyMessage={t('common.noData')}
        pagination={{
          page,
          size,
          totalElements: data.totalElements,
          totalPages: data.totalPages,
          onPageChange: setPage,
          onSizeChange: (s) => { setSize(s); setPage(0); },
        }}
        search={{
          value: q,
          onChange: (v) => { setQ(v); setPage(0); },
          placeholder: t('form.placeholder.search'),
        }}
        filterSlot={
          <FilterSelect
            label={t('form.label.channel', { defaultValue: '채널' })}
            value={channel}
            options={CHANNEL_OPTIONS}
            onChange={(v) => { setChannel(v); setPage(0); }}
            placeholder={t('common.all')}
          />
        }
      />
    </div>
  );
}
