'use client';

import { Pagination } from './Pagination';
import { Select } from './Select';

const DEFAULT_SIZE_OPTIONS = [10, 20, 50, 100];

export interface PaginationFooterProps {
  /** 0-based 현재 페이지 */
  page: number;
  /** 페이지당 개수 */
  size: number;
  /** 전체 항목 수 */
  totalElements: number;
  /** 전체 페이지 수 */
  totalPages: number;
  onPageChange: (page: number) => void;
  onSizeChange?: (size: number) => void;
  sizeOptions?: number[];
  /** 현재 페이지에 보이는 개수 */
  currentCount?: number;
}

/** 페이지네이션 공통 (카운트 + 페이지 + 사이즈) */
export type PaginationConfig = Omit<PaginationFooterProps, 'currentCount'>;

export function PaginationFooter({
  page,
  size,
  totalElements,
  totalPages,
  onPageChange,
  onSizeChange,
  sizeOptions = DEFAULT_SIZE_OPTIONS,
  currentCount,
}: PaginationFooterProps) {
  const count = currentCount ?? 0;

  return (
    <div className="grid grid-cols-3 items-center gap-4 px-4 py-3 border-t border-border bg-muted/40 min-h-11 overflow-visible">
      <span className="text-xs text-muted-foreground tabular-nums">
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
              className="h-8 min-h-8 w-full border-input bg-background px-2 py-2 text-xs text-foreground box-border"
            />
          </div>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
