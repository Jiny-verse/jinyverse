'use client';

import { Pagination } from '../../ui';
import { Select } from '../../ui';
import type { TablePaginationConfig } from './types';

const DEFAULT_SIZE_OPTIONS = [10, 20, 50, 100];

export interface TablePaginationFooterProps extends TablePaginationConfig {
  /** 현재 페이지에 보이는 데이터 개수 (로딩 시 등) */
  currentCount?: number;
}

export function TablePaginationFooter({
  page,
  size,
  totalElements,
  totalPages,
  onPageChange,
  onSizeChange,
  sizeOptions = DEFAULT_SIZE_OPTIONS,
  currentCount,
}: TablePaginationFooterProps) {
  const count = currentCount ?? 0;

  return (
    <div className="grid grid-cols-3 items-center gap-4 px-4 py-3 border-t border-gray-200 bg-gray-50/80 min-h-11 overflow-visible">
      <span className="text-xs text-gray-500 tabular-nums">
        {count}/{totalElements}
      </span>
      <div className="flex justify-center">
        <Pagination
          currentPage={page + 1}
          totalPages={Math.max(1, totalPages)}
          onPageChange={(p) => onPageChange(p - 1)}
        />
      </div>
      <div className="flex justify-end items-center">
        {onSizeChange ? (
          <div className="min-w-16 flex items-center">
            <Select
              value={String(size)}
              onChange={(e) => onSizeChange(Number(e.target.value))}
              options={sizeOptions.map((n) => ({ value: String(n), label: String(n) }))}
              className="h-8 min-h-8 w-full border-gray-300 bg-white px-2 py-2 text-xs text-gray-900 box-border"
            />
          </div>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
