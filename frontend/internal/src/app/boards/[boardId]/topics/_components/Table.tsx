'use client';

import { ReactNode } from 'react';
import { Table as CommonTable } from 'common/components';
import type { Topic } from 'common/types';
import { getTopicColumns } from './Column';
import { TopicActionTool, TopicToolbarAction } from './ActionTool';

export interface TopicTableProps {
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

export function TopicTable({
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
}: TopicTableProps) {
  const columns = getTopicColumns(boardId, {
    onDetailView: onRowClick,
    onEdit,
    onDelete,
    previewMode: !!onRowClick,
  });
  return (
    <CommonTable<Topic>
      data={data}
      columns={columns}
      isLoading={isLoading}
      emptyMessage="등록된 게시글이 없습니다."
      pagination={pagination ? { ...pagination, sizeOptions: [10, 20, 50], onSizeChange: pagination.onSizeChange } : undefined}
      search={search}
      filterSlot={filterSlot}
      selection={selection ? { idKey: 'id', ...selection } : undefined}
      actionToolSlot={selection?.selectedIds.length ? <TopicActionTool selectedCount={selection.selectedIds.length} onBatchDelete={onBatchDelete} /> : null}
      toolbarActionSlot={onAdd ? <TopicToolbarAction onAdd={onAdd} /> : null}
      onRowClick={onRowClick}
      selectedRowId={selectedRowId}
    />
  );
}
