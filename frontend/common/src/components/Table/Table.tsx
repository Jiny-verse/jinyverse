'use client';

import { ReactNode } from 'react';
import { Spinner } from '../../ui';
import { Checkbox } from '../../ui';
import { TableToolbar } from './TableToolbar';
import { TablePaginationFooter } from './TablePaginationFooter';
import type { ColumnDef, TablePaginationConfig, TableSearchConfig, TableSelectionConfig } from './types';

export interface TableProps<T extends Record<string, unknown>> {
  /** 목록 데이터 */
  data: T[];
  /** 컬럼 정의 */
  columns: ColumnDef<T>[];
  /** 로딩 여부 */
  isLoading?: boolean;
  /** 데이터 없을 때 메시지 */
  emptyMessage?: string;
  /** 페이징 설정 */
  pagination?: TablePaginationConfig;
  /** 검색 (상단 툴바) */
  search?: TableSearchConfig;
  /** 필터 슬롯 (검색 옆) */
  filterSlot?: ReactNode;
  /** 체크박스 열 사용 시 선택 설정 */
  selection?: TableSelectionConfig<T>;
  /** 액션 툴바 (일괄삭제 등, 선택 시 노출) */
  actionToolSlot?: ReactNode;
  /** 상단 고정 액션 (추가 버튼 등) */
  toolbarActionSlot?: ReactNode;
  /** 행 클릭 (미리보기용 setState 또는 router.push 등 부모가 결정) */
  onRowClick?: (row: T) => void;
  /** 선택된 행 ID (미리보기 열림 시 하이라이트) */
  selectedRowId?: string | null;
  /** 행 ID 추출 (기본: row.id) */
  getRowId?: (row: T) => string;
}

export function Table<T extends Record<string, unknown>>({
  data,
  columns,
  isLoading = false,
  emptyMessage = '데이터가 없습니다.',
  pagination,
  search,
  filterSlot,
  selection,
  actionToolSlot,
  toolbarActionSlot,
  onRowClick,
  selectedRowId,
  getRowId = (row) => String((row as { id?: unknown }).id ?? ''),
}: TableProps<T>) {
  const idKey = selection?.idKey as string;
  const selectedSet = new Set(selection?.selectedIds ?? []);
  const allIds = data.map((row) => String(row[idKey] ?? '')).filter(Boolean);
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedSet.has(id));
  const someSelected = (selection?.selectedIds?.length ?? 0) > 0;

  const toggleRow = (id: string) => {
    if (!selection) return;
    const next = selectedSet.has(id) ? [...selection.selectedIds].filter((x) => x !== id) : [...selection.selectedIds, id];
    selection.onSelectionChange(next);
  };

  const toggleAll = () => {
    if (!selection) return;
    selection.onSelectionChange(allSelected ? [] : allIds);
  };

  const colSpanTotal = columns.length + (selection ? 1 : 0);
  const pageSize = pagination?.size ?? 10;
  const emptyRowCount = data.length > 0 && data.length < pageSize ? pageSize - data.length : 0;
  const emptyAreaMinHeight = data.length === 0 ? pageSize * 48 : undefined;

  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white shadow-md overflow-hidden">
      <TableToolbar
        search={search}
        filterSlot={filterSlot}
        rightSlot={
          <>
            {someSelected && actionToolSlot}
            {toolbarActionSlot}
          </>
        }
      />

      {/* 중간: 목록 테이블 (카드 내부 여백) */}
      <div className="overflow-x-auto p-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="border-t border-gray-200 bg-gray-50">
            <tr>
              {selection && (
                <th className="px-4 py-3 text-left w-10">
                  <Checkbox
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="전체 선택"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  }`}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={colSpanTotal} className="px-4 py-12 text-center text-gray-500">
                  <div className="flex justify-center items-center gap-2">
                    <Spinner size="sm" />
                    <span>로딩 중...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={colSpanTotal}
                  className="px-4 py-12 text-center align-middle"
                  style={emptyAreaMinHeight != null ? { minHeight: emptyAreaMinHeight } : undefined}
                >
                  <div className="flex flex-col items-center justify-center gap-3 text-gray-400">
                    <svg
                      className="h-12 w-12 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-sm font-medium text-gray-500">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              <>
                {data.map((row, index) => {
                  const rowId = getRowId(row);
                  const selectionRowId = selection ? String(row[idKey as keyof T] ?? index) : rowId;
                  const isSelected = selectedRowId != null && selectedRowId === rowId;
                  const handleRowClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
                    if ((e.target as HTMLElement).closest('input[type="checkbox"]')) return;
                    onRowClick?.(row);
                  };
                  return (
                    <tr
                      key={rowId}
                      className={isSelected ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'}
                      onClick={onRowClick ? handleRowClick : undefined}
                      role={onRowClick ? 'button' : undefined}
                      tabIndex={onRowClick ? 0 : undefined}
                      onKeyDown={onRowClick ? (e) => e.key === 'Enter' && onRowClick(row) : undefined}
                    >
                      {selection && (
                        <td className="px-4 py-3">
                          <Checkbox
                            checked={selectedSet.has(selectionRowId)}
                            onChange={() => toggleRow(selectionRowId)}
                            aria-label={`행 ${selectionRowId} 선택`}
                          />
                        </td>
                      )}
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={`px-4 py-3 text-sm text-gray-900 whitespace-nowrap ${
                            col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                          }`}
                        >
                          {col.render ? col.render(row) : (row[col.key] as ReactNode)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
                {Array.from({ length: emptyRowCount }).map((_, i) => (
                  <tr key={`empty-${i}`}>
                    <td colSpan={colSpanTotal} className="px-4 py-3 text-sm text-gray-400">&nbsp;</td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <TablePaginationFooter
          {...pagination}
          currentCount={data.length}
        />
      )}
    </div>
  );
}
