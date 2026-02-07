'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable, FilterSelect } from 'common/components';
import type { Board } from 'common/types';
import type { ApiOptions } from 'common/types';
import { getBoards } from 'common/services';
import { getColumns } from './Column';
import { useBoardContext } from '../_hooks/useBoardContext';

export interface TableProps {
  apiOptions: ApiOptions;
  boardIdPrefix?: string;
}

/**
 * 테이블 (상태 관리 + 데이터 fetching + 필터 내장)
 * 행 클릭 시 해당 게시판의 게시글 목록 페이지로 이동
 */
export function Table({ apiOptions, boardIdPrefix = '/boards' }: TableProps) {
  const router = useRouter();
  const domain = useBoardContext();
  const [data, setData] = useState<{
    content: Board[];
    totalElements: number;
    totalPages: number;
  } | null>(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState('');
  const [isPublic, setIsPublic] = useState<boolean | undefined>(undefined);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const load = useCallback(() => {
    getBoards(apiOptions, { page, size, q: search.trim() || undefined, isPublic })
      .then(setData)
      .catch((e) => console.error('Failed to load boards:', e));
  }, [apiOptions.baseUrl, apiOptions.channel, apiOptions.role, page, size, search, isPublic]);

  useEffect(() => {
    load();
  }, [load, domain.reloadTrigger]);

  const handleBatchDelete = async () => {
    await domain.crud.batchDelete(selectedIds);
    setSelectedIds([]);
  };

  const goToTopics = useCallback(
    (row: Board) => router.push(`${boardIdPrefix}/${row.id}/topics`),
    [router, boardIdPrefix]
  );

  const columns = getColumns(boardIdPrefix, {
    onDetailView: goToTopics,
    onEdit: domain.dialogs.update.onOpen,
    onDelete: domain.crud.delete,
    previewMode: false,
  });

  return (
    <DataTable<Board>
      data={data?.content ?? []}
      columns={columns}
      isLoading={!data}
      emptyMessage="등록된 게시판이 없습니다."
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
        placeholder: '이름·설명·타입 검색',
      }}
      filterSlot={
        <FilterSelect
          label="공개 여부"
          value={isPublic === undefined ? '' : isPublic ? 'true' : 'false'}
          options={[
            { value: 'true', label: '공개' },
            { value: 'false', label: '비공개' },
          ]}
          placeholder="전체"
          onChange={(v) => {
            setIsPublic(v === '' ? undefined : v === 'true');
            setPage(0);
          }}
        />
      }
      selection={{ selectedIds, onSelectionChange: setSelectedIds }}
      onBatchDelete={selectedIds.length ? handleBatchDelete : undefined}
      onAdd={domain.dialogs.create.onOpen}
      addButtonLabel="게시판 추가"
      onRowClick={goToTopics}
    />
  );
}
