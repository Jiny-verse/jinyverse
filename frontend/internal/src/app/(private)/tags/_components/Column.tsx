'use client';

import type { ColumnDef } from 'common/components';
import { createActionColumn } from 'common/components';
import type { Tag } from 'common/types';

const TAG_LABELS: Record<string, string> = {
  id: 'ID',
  name: '이름',
  description: '설명',
  usageCategoryCode: '용도 분류',
  usage: '용도',
  createdAt: '생성일',
};

export function getColumns(options?: {
  onEdit?: (row: Tag) => void;
  onDelete?: (id: string) => void;
}): ColumnDef<Tag>[] {
  const cols: ColumnDef<Tag>[] = [
    { key: 'name', header: TAG_LABELS.name },
    {
      key: 'description',
      header: TAG_LABELS.description,
      render: (row) =>
        row.description
          ? String(row.description).slice(0, 50) + (String(row.description).length > 50 ? '…' : '')
          : '-',
    },
    { key: 'usage', header: TAG_LABELS.usage },
    { key: 'usageCategoryCode', header: TAG_LABELS.usageCategoryCode },
    { key: 'createdAt', header: TAG_LABELS.createdAt },
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
