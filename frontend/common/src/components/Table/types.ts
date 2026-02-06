import type { ReactNode } from 'react';

export interface ColumnDef<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface PaginationConfig {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSizeChange?: (size: number) => void;
  sizeOptions?: number[];
}

export interface SearchConfig {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export interface TableSelectionConfig<T> {
  idKey: keyof T | string;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}
