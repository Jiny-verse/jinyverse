'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getInquiries } from 'common/services';
import { useApiOptions } from '@/app/providers/ApiProvider';
import { DataTable, type ColumnDef } from 'common/components';
import { Badge, FilterSelect } from 'common/ui';
import type { Inquiry, PageResponse } from 'common/types';
import { useLanguage } from 'common/utils';

const EMPTY_PAGE: PageResponse<Inquiry> = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  size: 10,
  number: 0,
  first: true,
  last: true,
};

const STATUS_OPTIONS = (t: any) => [
  { value: 'pending', label: t('inquiry.status.pending') },
  { value: 'in_progress', label: t('inquiry.status.in_progress') },
  { value: 'answered', label: t('inquiry.status.answered') },
  { value: 'closed', label: t('inquiry.status.closed') },
];

const PRIORITY_OPTIONS = (t: any) => [
  { value: 'low', label: t('inquiry.priority.low', { defaultValue: '낮음' }) },
  { value: 'medium', label: t('inquiry.priority.medium', { defaultValue: '보통' }) },
  { value: 'high', label: t('inquiry.priority.high', { defaultValue: '높음' }) },
  { value: 'urgent', label: t('inquiry.priority.urgent', { defaultValue: '긴급' }) },
];

const STATUS_VARIANTS: Record<string, 'default' | 'success' | 'warning' | 'error'> = {
  pending: 'warning',
  in_progress: 'default',
  answered: 'success',
  closed: 'error',
};

const PRIORITY_VARIANTS: Record<string, 'default' | 'success' | 'warning' | 'error'> = {
  low: 'default',
  medium: 'default',
  high: 'warning',
  urgent: 'error',
};

const STATUS_LABELS = (t: any): Record<string, string> => ({
  pending: t('inquiry.status.pending'),
  in_progress: t('inquiry.status.in_progress'),
  answered: t('inquiry.status.answered'),
  closed: t('inquiry.status.closed'),
});

const PRIORITY_LABELS = (t: any): Record<string, string> => ({
  low: t('inquiry.priority.low', { defaultValue: '낮음' }),
  medium: t('inquiry.priority.medium', { defaultValue: '보통' }),
  high: t('inquiry.priority.high', { defaultValue: '높음' }),
  urgent: t('inquiry.priority.urgent', { defaultValue: '긴급' }),
});

export default function InquiriesPage() {
  const options = useApiOptions();
  const router = useRouter();
  const { t } = useLanguage();
  const [data, setData] = useState<PageResponse<Inquiry>>(EMPTY_PAGE);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [q, setQ] = useState('');
  const [statusCode, setStatusCode] = useState('');
  const [priorityCode, setPriorityCode] = useState('');
  const [loading, setLoading] = useState(false);

  const statusLabels = STATUS_LABELS(t);
  const priorityLabels = PRIORITY_LABELS(t);
  const statusOptions = STATUS_OPTIONS(t);
  const priorityOptions = PRIORITY_OPTIONS(t);

  const load = useCallback(() => {
    setLoading(true);
    getInquiries(options, {
      page,
      size,
      q: q || undefined,
      statusCode: statusCode || undefined,
      priorityCode: priorityCode || undefined,
    })
      .then(setData)
      .catch(() => setData(EMPTY_PAGE))
      .finally(() => setLoading(false));
  }, [options.baseUrl, options.channel, page, size, q, statusCode, priorityCode]);

  useEffect(() => { load(); }, [load]);

  const columns: ColumnDef<Inquiry>[] = [
    {
      key: 'ticketNo',
      header: t('inquiry.form.ticketNo', { defaultValue: '티켓번호' }),
      render: (row) => <span className="font-mono text-xs">{row.ticketNo}</span>,
    },
    {
      key: 'title',
      header: t('form.label.title'),
      render: (row) => <span className="text-sm">{row.title}</span>,
    },
    {
      key: 'categoryCode',
      header: t('form.label.category'),
      render: (row) => <span className="text-xs text-muted-foreground">{row.categoryCode}</span>,
    },
    {
      key: 'statusCode',
      header: t('form.label.status'),
      render: (row) => (
        <Badge variant={STATUS_VARIANTS[row.statusCode] ?? 'default'}>
          {statusLabels[row.statusCode] ?? row.statusCode}
        </Badge>
      ),
    },
    {
      key: 'priorityCode',
      header: t('inquiry.form.priority', { defaultValue: '우선순위' }),
      render: (row) => (
        <Badge variant={PRIORITY_VARIANTS[row.priorityCode] ?? 'default'}>
          {priorityLabels[row.priorityCode] ?? row.priorityCode}
        </Badge>
      ),
    },
    {
      key: 'assigneeName',
      header: t('inquiry.form.assignee', { defaultValue: '담당자' }),
      render: (row) => <span className="text-xs text-muted-foreground">{row.assigneeName ?? '-'}</span>,
    },
    {
      key: 'createdAt',
      header: t('form.label.createdAt'),
      render: (row) => (
        <span className="text-xs text-muted-foreground">
          {new Date(row.createdAt).toLocaleDateString('ko-KR')}
        </span>
      ),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('inquiry.title')}</h1>
      <DataTable<Inquiry>
        data={data.content}
        columns={columns}
        isLoading={loading}
        emptyMessage={t('inquiry.empty')}
        onRowClick={(row) => router.push(`/inquiries/${row.id}`)}
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
          <div className="flex gap-3">
            <FilterSelect
              label={t('form.label.status')}
              value={statusCode}
              options={statusOptions}
              onChange={(v) => { setStatusCode(v); setPage(0); }}
              placeholder={t('common.all')}
            />
            <FilterSelect
              label={t('inquiry.form.priority', { defaultValue: '우선순위' })}
              value={priorityCode}
              options={priorityOptions}
              onChange={(v) => { setPriorityCode(v); setPage(0); }}
              placeholder={t('common.all')}
            />
          </div>
        }
      />
    </div>
  );
}
