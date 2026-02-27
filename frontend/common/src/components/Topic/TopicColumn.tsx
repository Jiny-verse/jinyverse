'use client';

import type { ColumnDef } from '../Table/types';
import { createActionColumn } from '../Table/columnHelpers';
import { formatRelativeOrAbsolute } from '../../utils/formatDateTime';
import { Badge } from '../../ui';
import type { Topic } from '../../schemas/topic';
import Link from 'next/link';

export function getTopicColumns(
  boardId: string,
  options?: {
    linkPrefix?: string;
    onDetailView?: (row: Topic) => void;
    onEdit?: (row: Topic) => void;
    onDelete?: (id: string) => void;
    previewMode?: boolean;
  },
  t?: (key: string) => string
): ColumnDef<Topic>[] {
  const previewMode = options?.previewMode ?? false;
  const linkPrefix = options?.linkPrefix ?? '/boards';
  const tr = t ?? ((k: string) => k);

  const titleCell = (row: Topic) => {
    const noticeBadge = row.isNotice ? (
      <Badge variant="warning" className="mr-2 shrink-0">
        {tr('post.notice')}
      </Badge>
    ) : null;
    const titleEl = previewMode ? (
      <span className="line-clamp-1 cursor-pointer">{row.title}</span>
    ) : (
      <Link href={`${linkPrefix}/${boardId}/topics/${row.id}`} className="line-clamp-1">
        {row.title}
      </Link>
    );
    return (
      <span className="flex items-center gap-1 min-w-0">
        {noticeBadge}
        {titleEl}
      </span>
    );
  };

  const cols: ColumnDef<Topic>[] = [
    {
      key: 'title',
      header: tr('form.label.title'),
      render: titleCell,
    },
    {
      key: 'tags',
      header: tr('form.label.tags'),
      render: (row) =>
        row.tags?.length ? (
          <span className="flex flex-wrap gap-1">
            {row.tags.map((tag) => (
              <Badge key={tag.id} variant="default" className="text-xs">
                {tag.name}
              </Badge>
            ))}
          </span>
        ) : (
          '-'
        ),
    },
    { key: 'author', header: tr('form.label.author'), render: (row) => row.author?.nickname ?? '-' },
    { key: 'status', header: tr('form.label.status') },
    { key: 'viewCount', header: tr('form.label.viewCount'), render: (row) => row.viewCount ?? 0 },
    { key: 'isNotice', header: tr('post.notice'), render: (row) => (row.isNotice ? 'Y' : 'N') },
    { key: 'isPinned', header: tr('post.pinned'), render: (row) => (row.isPinned ? 'Y' : 'N') },
    {
      key: 'createdAt',
      header: tr('form.label.createdAt'),
      render: (row) => (row.createdAt ? formatRelativeOrAbsolute(row.createdAt) : '-'),
    },
  ];

  if (options?.onDetailView || options?.onEdit || options?.onDelete) {
    cols.push(
      createActionColumn<Topic>({
        onDetailView: options?.onDetailView,
        onEdit: options?.onEdit,
        onDelete: options?.onDelete,
        header: tr('table.actions'),
      })
    );
  }

  return cols;
}
