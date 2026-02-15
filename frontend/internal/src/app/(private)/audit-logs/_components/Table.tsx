'use client';

import { useState, useEffect, useCallback } from 'react';
import { DataTable, FilterSelect } from 'common/components';
import type { ApiOptions } from 'common/types';
import type { AuditLog } from 'common/schemas';
import { getAuditLogs } from 'common/services';
import { getColumns } from './Column';
import { DetailPanel } from './DetailPanel';

export interface TableProps {
  apiOptions: ApiOptions;
}

export function Table({ apiOptions }: TableProps) {
  const [data, setData] = useState<{
    content: AuditLog[];
    totalElements: number;
    totalPages: number;
  } | null>(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState('');
  const [targetType, setTargetType] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const load = useCallback(() => {
    getAuditLogs(apiOptions, {
      page,
      size,
      q: search.trim() || undefined,
      targetType: targetType || undefined,
    })
      .then(setData)
      .catch((e) => console.error('Failed to load audit logs:', e));
  }, [apiOptions.baseUrl, apiOptions.channel, apiOptions.role, page, size, search, targetType]);

  useEffect(() => {
    load();
  }, [load]);

  const columns = getColumns();

  return (
    <div className="flex gap-4">
      <div className="flex-1 min-w-0">
        <DataTable<AuditLog>
          data={data?.content ?? []}
          columns={columns}
          isLoading={!data}
          emptyMessage="감사 로그가 없습니다."
          pagination={{
            page,
            size,
            totalElements: data?.totalElements ?? 0,
            totalPages: data?.totalPages ?? 0,
            onPageChange: setPage,
            onSizeChange: (s) => {
              setSize(s);
              setPage(0);
            },
          }}
          search={{
            value: search,
            onChange: (v) => {
              setSearch(v);
              setPage(0);
            },
            placeholder: '대상유형·액션 검색',
          }}
          filterSlot={
            <FilterSelect
              label="대상 유형"
              value={targetType}
              options={[
                { value: '', label: '전체' },
                { value: 'USER', label: 'USER' },
                { value: 'TOPIC', label: 'TOPIC' },
                { value: 'CODE', label: 'CODE' },
              ]}
              placeholder="전체"
              onChange={(v) => {
                setTargetType(v);
                setPage(0);
              }}
            />
          }
          onRowClick={(row) => setSelectedLog(row)}
          selectedRowId={selectedLog?.id ?? null}
          getRowId={(row) => row.id}
        />
      </div>
      {selectedLog && (
        <div className="w-96 shrink-0">
          <DetailPanel log={selectedLog} onClose={() => setSelectedLog(null)} />
        </div>
      )}
    </div>
  );
}
