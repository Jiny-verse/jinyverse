'use client';

import { ReactNode } from 'react';
import { DataTable } from '../Table/DataTable';
import type { Topic } from '../../schemas/topic';
import { getTopicColumns } from './TopicColumn';
import useLanguage from '../../utils/i18n/hooks/useLanguage';

export interface TopicTableProps {
  boardId: string;
  linkPrefix?: string;
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

export function TopicTable({
  boardId,
  linkPrefix,
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
}: TopicTableProps) {
  const { t } = useLanguage();
  const columns = getTopicColumns(
    boardId,
    {
      linkPrefix,
      onDetailView: onRowClick,
      onEdit,
      onDelete,
      previewMode: !!onRowClick,
    },
    t
  );

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
      addButtonLabel={onAdd ? `${t('ui.button.add')} ${t('board.topic.title')}` : undefined}
      onRowClick={onRowClick}
      selectedRowId={selectedRowId}
      getRowClassName={getRowClassName}
    />
  );
}
