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
  size: 20,
  number: 0,
  first: true,
  last: true,
};

const STATUS_OPTIONS = [
  { value: 'pending', label: '접수 대기' },
  { value: 'in_progress', label: '처리 중' },
  { value: 'answered', label: '답변 완료' },
  { value: 'closed', label: '종료' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: '낮음' },
  { value: 'medium', label: '보통' },
  { value: 'high', label: '높음' },
  { value: 'urgent', label: '긴급' },
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

const STATUS_LABELS: Record<string, string> = {
  pending: '접수 대기',
  in_progress: '처리 중',
  answered: '답변 완료',
  closed: '종료',
};

const PRIORITY_LABELS: Record<string, string> = {
  low: '낮음',
  medium: '보통',
  high: '높음',
  urgent: '긴급',
};

export default function InquiriesPage() {
  const options = useApiOptions();
  const router = useRouter();
  const { t } = useLanguage();
  const [data, setData] = useState<PageResponse<Inquiry>>(EMPTY_PAGE);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [q, setQ] = useState('');
  const [statusCode, setStatusCode] = useState('');
  const [priorityCode, setPriorityCode] = useState('');
  const [loading, setLoading] = useState(false);

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
      header: '티켓번호',
      render: (row) => <span className="font-mono text-xs">{row.ticketNo}</span>,
    },
    {
      key: 'title',
      header: '제목',
      render: (row) => <span className="text-sm">{row.title}</span>,
    },
    {
      key: 'categoryCode',
      header: '카테고리',
      render: (row) => <span className="text-xs text-muted-foreground">{row.categoryCode}</span>,
    },
    {
      key: 'statusCode',
      header: '상태',
      render: (row) => (
        <Badge variant={STATUS_VARIANTS[row.statusCode] ?? 'default'}>
          {STATUS_LABELS[row.statusCode] ?? row.statusCode}
        </Badge>
      ),
    },
    {
      key: 'priorityCode',
      header: '우선순위',
      render: (row) => (
        <Badge variant={PRIORITY_VARIANTS[row.priorityCode] ?? 'default'}>
          {PRIORITY_LABELS[row.priorityCode] ?? row.priorityCode}
        </Badge>
      ),
    },
    {
      key: 'assigneeName',
      header: '담당자',
      render: (row) => <span className="text-xs text-muted-foreground">{row.assigneeName ?? '-'}</span>,
    },
    {
      key: 'createdAt',
      header: '생성일',
      render: (row) => (
        <span className="text-xs text-muted-foreground">
          {new Date(row.createdAt).toLocaleDateString('ko-KR')}
        </span>
      ),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">문의 티켓</h1>
      <DataTable<Inquiry>
        data={data.content}
        columns={columns}
        isLoading={loading}
        emptyMessage="문의가 없습니다."
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
          placeholder: '제목 검색...',
        }}
        filterSlot={
          <div className="flex gap-3">
            <FilterSelect
              label="상태"
              value={statusCode}
              options={STATUS_OPTIONS}
              onChange={(v) => { setStatusCode(v); setPage(0); }}
              placeholder="전체"
            />
            <FilterSelect
              label="우선순위"
              value={priorityCode}
              options={PRIORITY_OPTIONS}
              onChange={(v) => { setPriorityCode(v); setPage(0); }}
              placeholder="전체"
            />
          </div>
        }
      />
    </div>
  );
}
