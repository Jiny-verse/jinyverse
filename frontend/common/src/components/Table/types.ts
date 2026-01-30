import type { ReactNode } from 'react';

export interface ColumnDef<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TablePaginationConfig {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSizeChange?: (size: number) => void;
  sizeOptions?: number[];
}

export interface TableSearchConfig {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export interface TableSelectionConfig<T> {
  idKey: keyof T | string;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

/** 행 클릭 시 콜백 (미리보기용 setState 또는 router.push 등 부모가 결정) */
export interface TableRowClickConfig<T> {
  onRowClick?: (row: T) => void;
  /** 선택된 행 ID (미리보기 열림 시 하이라이트용) */
  selectedRowId?: string | null;
  /** 행 ID 추출 (기본: row.id) */
  getRowId?: (row: T) => string;
}
