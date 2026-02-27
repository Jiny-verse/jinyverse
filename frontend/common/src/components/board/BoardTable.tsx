'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '../Table/DataTable';
import { FilterSelect } from '../../ui';
import type { Board } from '../../schemas/board';
import type { ApiOptions } from '../../types/api';
import { getBoards } from '../../services/board';
import { getBoardColumns } from './BoardColumn';
import useLanguage from '../../utils/i18n/hooks/useLanguage';

export interface BoardTableProps {
  apiOptions: ApiOptions;
  linkPrefix?: string;
  onAdd?: () => void;
  onEdit?: (row: Board) => void;
  onDelete?: (id: string) => void;
  onBatchDelete?: (ids: string[]) => Promise<void>;
  reloadTrigger?: unknown;
}

export function BoardTable({
  apiOptions,
  linkPrefix = '/boards',
  onAdd,
  onEdit,
  onDelete,
  onBatchDelete,
  reloadTrigger,
}: BoardTableProps) {
  const router = useRouter();
  const { t } = useLanguage();
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
  }, [load, reloadTrigger]);

  const handleBatchDelete = async () => {
    if (onBatchDelete) {
      await onBatchDelete(selectedIds);
      setSelectedIds([]);
    }
  };

  const goToTopics = useCallback(
    (row: Board) => router.push(`${linkPrefix}/${row.id}/topics`),
    [router, linkPrefix]
  );

  const columns = getBoardColumns(
    linkPrefix,
    {
      onDetailView: onEdit || onDelete ? goToTopics : undefined,
      onEdit,
      onDelete,
      previewMode: false,
    },
    t
  );

  return (
    <DataTable<Board>
      data={data?.content ?? []}
      columns={columns}
      isLoading={!data}
      emptyMessage={t('common.noData')}
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
        placeholder: t('form.placeholder.search'),
      }}
      filterSlot={
        <FilterSelect
          label={t('form.label.isPublic')}
          value={isPublic === undefined ? '' : isPublic ? 'true' : 'false'}
          options={[
            { value: 'true', label: t('form.label.isPublic') },
            { value: 'false', label: t('form.label.isPrivate') },
          ]}
          placeholder={t('common.all')}
          onChange={(v) => {
            setIsPublic(v === '' ? undefined : v === 'true');
            setPage(0);
          }}
        />
      }
      selection={onBatchDelete ? { selectedIds, onSelectionChange: setSelectedIds } : undefined}
      onBatchDelete={onBatchDelete && selectedIds.length ? handleBatchDelete : undefined}
      onAdd={onAdd}
      addButtonLabel={onAdd ? `${t('ui.button.add')} ${t('admin.board.title')}` : undefined}
      onRowClick={goToTopics}
    />
  );
}
