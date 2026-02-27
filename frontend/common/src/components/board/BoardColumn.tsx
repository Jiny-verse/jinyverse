'use client';

import type { ColumnDef } from '../Table/types';
import { createActionColumn } from '../Table/columnHelpers';
import type { Board } from '../../schemas/board';
import Link from 'next/link';

export function getBoardColumns(
  boardIdPrefix: string,
  options?: {
    onDetailView?: (row: Board) => void;
    onEdit?: (row: Board) => void;
    onDelete?: (id: string) => void;
    previewMode?: boolean;
  },
  t?: (key: string) => string
): ColumnDef<Board>[] {
  const previewMode = options?.previewMode ?? false;
  const tr = t ?? ((k: string) => k);
  const cols: ColumnDef<Board>[] = [
    {
      key: 'name',
      header: tr('form.label.name'),
      render: (row) =>
        previewMode ? (
          <span className="line-clamp-1 cursor-pointer">{row.name}</span>
        ) : (
          <Link href={`${boardIdPrefix}/${row.id}/topics`} className="line-clamp-1">
            {row.name}
          </Link>
        ),
    },
    { key: 'typeCategoryCode', header: tr('form.label.typeCategory') },
    { key: 'type', header: tr('form.label.type') },
    {
      key: 'description',
      header: tr('form.label.description'),
      render: (row) =>
        row.description
          ? String(row.description).slice(0, 50) + (String(row.description).length > 50 ? '…' : '')
          : '-',
    },
    { key: 'isPublic', header: tr('form.label.isPublic'), render: (row) => (row.isPublic ? 'Y' : 'N') },
    { key: 'order', header: tr('form.label.order') },
  ];
  if (options?.onDetailView || options?.onEdit || options?.onDelete) {
    cols.push(
      createActionColumn<Board>({
        onDetailView: options?.onDetailView,
        onEdit: options?.onEdit,
        onDelete: options?.onDelete,
        header: tr('table.actions'),
      })
    );
  }
  return cols;
}
