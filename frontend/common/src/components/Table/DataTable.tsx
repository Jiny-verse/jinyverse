'use client';

import { ReactNode } from 'react';
import { Table } from './Table';
import { ActionToolbar } from './ActionToolbar';
import { Button } from '../../ui';
import type { ColumnDef, PaginationConfig, SearchConfig } from './types';

export interface DataTableProps<T extends Record<string, unknown>> {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  pagination?: PaginationConfig;
  search?: SearchConfig;
  filterSlot?: ReactNode;
  selection?: {
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
    idKey?: keyof T | string;
  };
  onBatchDelete?: () => void;
  onAdd?: () => void;
  addButtonLabel?: string;
  onRowClick?: (row: T) => void;
  selectedRowId?: string | null;
  getRowId?: (row: T) => string;
  getRowClassName?: (row: T) => string;
}

/**
 * 통합 데이터 테이블 (공통)
 * 검색, 필터, 페이지네이션, 액션툴바 모두 포함
 * 페이지에서는 columns + data + callbacks만 넘기면 됨
 */
export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  isLoading = false,
  emptyMessage = '데이터가 없습니다.',
  pagination,
  search,
  filterSlot,
  selection,
  onBatchDelete,
  onAdd,
  addButtonLabel = '추가',
  onRowClick,
  selectedRowId,
  getRowId,
  getRowClassName,
}: DataTableProps<T>) {
  const paginationWithDefaults = pagination
    ? { ...pagination, sizeOptions: pagination.sizeOptions ?? [10, 20, 50] }
    : undefined;

  const selectedCount = selection?.selectedIds.length ?? 0;
  const actionToolSlot =
    selectedCount > 0 && onBatchDelete ? (
      <ActionToolbar selectedCount={selectedCount} onBatchDelete={onBatchDelete} />
    ) : null;

  const toolbarActionSlot = onAdd ? (
    <Button type="button" size="sm" onClick={onAdd}>
      {addButtonLabel}
    </Button>
  ) : null;

  return (
    <Table<T>
      data={data}
      columns={columns}
      isLoading={isLoading}
      emptyMessage={emptyMessage}
      pagination={paginationWithDefaults}
      search={search}
      filterSlot={filterSlot}
      selection={
        selection
          ? {
              idKey: selection.idKey ?? ('id' as keyof T),
              selectedIds: selection.selectedIds,
              onSelectionChange: selection.onSelectionChange,
            }
          : undefined
      }
      actionToolSlot={actionToolSlot}
      toolbarActionSlot={toolbarActionSlot}
      onRowClick={onRowClick}
      selectedRowId={selectedRowId}
      getRowId={getRowId}
      getRowClassName={getRowClassName}
    />
  );
}
