'use client';

import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Tooltip } from '../../ui';

export interface TableActionButtonsProps<T extends Record<string, unknown>> {
  row: T;
  onDetailView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (id: string) => void;
  getId?: (row: T) => string;
}

const btnBase =
  'inline-flex items-center justify-center w-9 h-9 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400';

export function TableActionButtons<T extends Record<string, unknown>>({
  row,
  onDetailView,
  onEdit,
  onDelete,
  getId = (r) => String((r as { id?: unknown }).id ?? ''),
}: TableActionButtonsProps<T>) {
  const id = getId(row);

  return (
    <div className="flex items-center gap-1">
      {onDetailView && (
        <Tooltip content="상세보기" position="top">
          <button
            type="button"
            onClick={() => onDetailView(row)}
            className={`${btnBase} border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400`}
            aria-label="상세보기"
          >
            <Eye className="w-4 h-4" />
          </button>
        </Tooltip>
      )}
      {onEdit && (
        <Tooltip content="수정" position="top">
          <button
            type="button"
            onClick={() => onEdit(row)}
            className={`${btnBase} border-gray-300 text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600`}
            aria-label="수정"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </Tooltip>
      )}
      {onDelete && (
        <Tooltip content="삭제" position="top">
          <button
            type="button"
            onClick={() => onDelete(id)}
            className={`${btnBase} border-gray-300 text-gray-600 hover:bg-red-50 hover:border-red-300 hover:text-red-600`}
            aria-label="삭제"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </Tooltip>
      )}
    </div>
  );
}
