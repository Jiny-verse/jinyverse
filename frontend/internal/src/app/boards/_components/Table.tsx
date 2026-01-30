'use client';

import { ReactNode } from 'react';
import { Table as CommonTable } from 'common/components';
import type { Board } from 'common/types';
import { getBoardColumns } from './Column';
import { BoardActionTool, BoardToolbarAction } from './ActionTool';

export interface BoardTableProps {
  data: Board[];
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
  onEdit?: (row: Board) => void;
  onDelete?: (id: string) => void;
  boardIdPrefix?: string;
  onRowClick?: (row: Board) => void;
  selectedRowId?: string | null;
}

/**
 * 게시판 도메인 테이블 (공통 Table + 컬럼 + 액션)
 */
export function BoardTable({
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
  boardIdPrefix = '/boards',
  onRowClick,
  selectedRowId,
}: BoardTableProps) {
  const columns = getBoardColumns(boardIdPrefix, {
    onDetailView: onRowClick,
    onEdit,
    onDelete,
    previewMode: !!onRowClick,
  });
  return (
    <CommonTable<Board>
      data={data}
      columns={columns}
      isLoading={isLoading}
      emptyMessage="등록된 게시판이 없습니다."
      pagination={pagination ? { ...pagination, sizeOptions: [10, 20, 50], onSizeChange: pagination.onSizeChange } : undefined}
      search={search}
      filterSlot={filterSlot}
      selection={selection ? { idKey: 'id', ...selection } : undefined}
      actionToolSlot={selection?.selectedIds.length ? <BoardActionTool selectedCount={selection.selectedIds.length} onBatchDelete={onBatchDelete} /> : null}
      toolbarActionSlot={onAdd ? <BoardToolbarAction onAdd={onAdd} /> : null}
      onRowClick={onRowClick}
      selectedRowId={selectedRowId}
    />
  );
}
