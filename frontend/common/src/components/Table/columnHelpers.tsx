'use client';

import type { ReactNode } from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import type { ColumnDef } from './types';
import { Tooltip } from '../../ui';
import useLanguage from '../../utils/i18n/hooks/useLanguage';

/**
 * 스키마(데이터)에서 자동으로 컬럼 생성
 */
export function createColumnsFromData<T extends Record<string, unknown>>(
  data: T[],
  options?: {
    exclude?: (keyof T)[];
    labels?: Partial<Record<string, string>>;
    renders?: Partial<Record<string, (item: T) => ReactNode>>;
    widths?: Partial<Record<string, string>>;
    aligns?: Partial<Record<string, 'left' | 'center' | 'right'>>;
  }
): ColumnDef<T>[] {
  const { exclude = [], labels = {}, renders = {}, widths = {}, aligns = {} } = options ?? {};
  const sample = data[0];
  if (!sample) return [];

  const excludeSet = new Set(exclude);
  const keys = Object.keys(sample).filter((k) => !excludeSet.has(k as keyof T));

  return keys.map((key) => ({
    key,
    header: labels[key] ?? key,
    render: renders[key],
    width: widths[key],
    align: aligns[key],
  }));
}

/**
 * 컬럼 수정 (특정 key의 컬럼 속성 변경)
 */
export function updateColumn<T>(
  columns: ColumnDef<T>[],
  key: string,
  updates: Partial<Omit<ColumnDef<T>, 'key'>>
): ColumnDef<T>[] {
  return columns.map((col) => (col.key === key ? { ...col, ...updates } : col));
}

/**
 * 컬럼 추가
 */
export function addColumn<T>(
  columns: ColumnDef<T>[],
  column: ColumnDef<T>,
  position?: number
): ColumnDef<T>[] {
  if (position !== undefined) {
    const result = [...columns];
    result.splice(position, 0, column);
    return result;
  }
  return [...columns, column];
}

/**
 * 컬럼 삭제
 */
export function removeColumn<T>(columns: ColumnDef<T>[], key: string): ColumnDef<T>[] {
  return columns.filter((col) => col.key !== key);
}

export interface ActionColumnOptions<T> {
  onDetailView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (id: string) => void;
  getId?: (row: T) => string;
  header?: string;
}

interface RowActionButtonsProps<T extends Record<string, unknown>> {
  row: T;
  onDetailView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (id: string) => void;
  getId?: (row: T) => string;
}

const btnBase =
  'inline-flex items-center justify-center w-9 h-9 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400';

/**
 * 행 액션 버튼 (상세/수정/삭제)
 */
function RowActionButtons<T extends Record<string, unknown>>({
  row,
  onDetailView,
  onEdit,
  onDelete,
  getId = (r) => String((r as { id?: unknown }).id ?? ''),
}: RowActionButtonsProps<T>) {
  const { t } = useLanguage();
  const id = getId(row);

  return (
    <div className="flex items-center gap-1">
      {onDetailView && (
        <Tooltip content={t('common.detail')} position="top">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDetailView(row);
            }}
            className={`${btnBase} border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400`}
            aria-label={t('common.detail')}
          >
            <Eye className="w-4 h-4" />
          </button>
        </Tooltip>
      )}
      {onEdit && (
        <Tooltip content={t('ui.button.edit')} position="top">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(row);
            }}
            className={`${btnBase} border-gray-300 text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600`}
            aria-label={t('ui.button.edit')}
          >
            <Pencil className="w-4 h-4" />
          </button>
        </Tooltip>
      )}
      {onDelete && (
        <Tooltip content={t('ui.button.delete')} position="top">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
            className={`${btnBase} border-gray-300 text-gray-600 hover:bg-red-50 hover:border-red-300 hover:text-red-600`}
            aria-label={t('ui.button.delete')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </Tooltip>
      )}
    </div>
  );
}

/**
 * 작업 버튼 열 생성 (상세/수정/삭제)
 */
export function createActionColumn<T extends Record<string, unknown>>(
  options: ActionColumnOptions<T> = {}
): ColumnDef<T> {
  const { onDetailView, onEdit, onDelete, getId, header = '작업' } = options;
  if (!onDetailView && !onEdit && !onDelete) {
    return { key: '_actions', header };
  }
  return {
    key: '_actions',
    header,
    render: (row): ReactNode => (
      <RowActionButtons<T>
        row={row}
        onDetailView={onDetailView}
        onEdit={onEdit}
        onDelete={onDelete}
        getId={getId}
      />
    ),
  };
}
