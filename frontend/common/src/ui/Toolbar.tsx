'use client';

import { ReactNode } from 'react';
import { SearchInput } from './SearchInput';

export interface SearchConfig {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export interface ToolbarProps {
  search?: SearchConfig;
  filterSlot?: ReactNode;
  rightSlot?: ReactNode;
}

/** 목록 상단 툴바 (검색 + 필터 + 액션) */
export function Toolbar({ search, filterSlot, rightSlot }: ToolbarProps) {
  const hasLeft = search || filterSlot;
  if (!hasLeft && !rightSlot) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-gray-50/80 border-b border-gray-100">
      <div className="flex flex-wrap items-center gap-3">
        {search && (
          <SearchInput
            value={search.value}
            onChange={search.onChange}
            placeholder={search.placeholder ?? '검색'}
          />
        )}
        {filterSlot}
      </div>
      {rightSlot && <div className="flex items-center gap-2">{rightSlot}</div>}
    </div>
  );
}
