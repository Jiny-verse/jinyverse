'use client';

import { ReactNode } from 'react';
import { DataTable } from 'common/components';
import type { Topic } from 'common/types';
import { getColumns } from './Column';
import { useLanguage } from 'common/utils';

export interface TableProps {
  boardId: string;
  data: Topic[];
  isLoading?: boolean;
  pagination?: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onSizeChange?: (size: number) => void;
  };
  search?: { value: string; onChange: (v: string) => void; placeholder?: string };
  filterSlot?: ReactNode;
  selection?: { selectedIds: string[]; onSelectionChange: (ids: string[]) => void };
  onBatchDelete?: () => void;
  onAdd?: () => void;
  onEdit?: (row: Topic) => void;
  onDelete?: (id: string) => void;
  onRowClick?: (row: Topic) => void;
  selectedRowId?: string | null;
}

/**
 * 테이블 (컬럼 정의만 도메인)
 */
export function Table({
  boardId,
  data,
  isLoading,
  pagination,
  search,
  filterSlot,
  selection,
  onBatchDelete,
  onAdd,
  onEdit,
  onDelete,
  onRowClick,
  selectedRowId,
}: TableProps) {
  const { t } = useLanguage();
  const columns = getColumns(boardId, {
    onDetailView: onRowClick,
    onEdit,
    onDelete,
    previewMode: !!onRowClick,
  }, t);

  const getRowClassName = (row: Topic) => {
    if (row.isNotice) return 'bg-amber-50';
    if (row.isPinned) return 'bg-gray-50';
    return '';
  };

  return (
    <DataTable<Topic>
      data={data}
      columns={columns}
      isLoading={isLoading}
      emptyMessage={t('post.noPost')}
      pagination={pagination}
      search={search}
      filterSlot={filterSlot}
      selection={selection}
      onBatchDelete={onBatchDelete}
      onAdd={onAdd}
      addButtonLabel={`${t('ui.button.add')} ${t('board.topic.title')}`}
      onRowClick={onRowClick}
      selectedRowId={selectedRowId}
      getRowClassName={getRowClassName}
    />
  );
}
