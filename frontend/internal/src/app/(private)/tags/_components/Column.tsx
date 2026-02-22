'use client';

import type { ColumnDef } from 'common/components';
import { createActionColumn } from 'common/components';
import type { Tag } from 'common/types';

export function getColumns(
  options?: {
    onEdit?: (row: Tag) => void;
    onDelete?: (id: string) => void;
  },
  t?: (key: string) => string
): ColumnDef<Tag>[] {
  const tr = t ?? ((k: string) => k);
  const cols: ColumnDef<Tag>[] = [
    { key: 'name', header: tr('form.label.tagName') },
    {
      key: 'description',
      header: tr('form.label.description'),
      render: (row) =>
        row.description
          ? String(row.description).slice(0, 50) + (String(row.description).length > 50 ? '…' : '')
          : '-',
    },
    { key: 'usage', header: tr('form.label.usage') },
    { key: 'usageCategoryCode', header: tr('form.label.typeCategory') },
    { key: 'createdAt', header: tr('form.label.createdAt') },
  ];
  if (options?.onEdit || options?.onDelete) {
    cols.push(
      createActionColumn<Tag>({
        onEdit: options.onEdit,
        onDelete: options.onDelete,
      })
    );
  }
  return cols;
}
