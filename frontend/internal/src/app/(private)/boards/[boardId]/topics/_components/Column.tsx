'use client';

import type { ColumnDef } from 'common/components';
import { createActionColumn } from 'common/components';
import { Badge } from 'common/ui';
import type { Topic } from 'common/types';
import Link from 'next/link';

/**
 * 목록 컬럼 정의
 */
export function getColumns(
  boardId: string,
  options?: {
    onDetailView?: (row: Topic) => void;
    onEdit?: (row: Topic) => void;
    onDelete?: (id: string) => void;
    previewMode?: boolean;
  }
): ColumnDef<Topic>[] {
  const previewMode = options?.previewMode ?? false;
  const titleCell = (row: Topic) => {
    const noticeBadge = row.isNotice ? (
      <Badge variant="warning" className="mr-2 shrink-0">
        공지
      </Badge>
    ) : null;
    const titleEl = previewMode ? (
      <span className="text-blue-600 hover:underline line-clamp-1 cursor-pointer">
        {row.title}
      </span>
    ) : (
      <Link
        href={`/boards/${boardId}/topics/${row.id}`}
        className="text-blue-600 hover:underline line-clamp-1"
      >
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
      header: '제목',
      render: titleCell,
    },
    { key: 'status', header: '상태' },
    { key: 'viewCount', header: '조회', render: (row) => row.viewCount ?? 0 },
    { key: 'isNotice', header: '공지', render: (row) => (row.isNotice ? 'Y' : 'N') },
    { key: 'isPinned', header: '고정', render: (row) => (row.isPinned ? 'Y' : 'N') },
    {
      key: 'createdAt',
      header: '작성일',
      render: (row) => (row.createdAt ? String(row.createdAt).slice(0, 10) : '-'),
    },
  ];
  if (options?.onDetailView || options?.onEdit || options?.onDelete) {
    cols.push(
      createActionColumn<Topic>({
        onDetailView: options.onDetailView,
        onEdit: options.onEdit,
        onDelete: options.onDelete,
      })
    );
  }
  return cols;
}
