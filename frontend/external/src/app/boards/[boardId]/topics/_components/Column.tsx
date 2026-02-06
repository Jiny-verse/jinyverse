'use client';

import type { ColumnDef } from 'common/components';
import { createActionColumn } from 'common/components';
import type { Topic } from 'common/types';
import Link from 'next/link';

export interface TopicColumnOptions {
  /** true: 제목을 Link 대신 span (행 클릭 → 미리보기). false: 제목 Link → 상세 페이지 직접 이동 */
  previewMode?: boolean;
  /** 상세보기(미리보기) 클릭 시 */
  onDetailView?: (row: Topic) => void;
}

/** 게시글 목록 컬럼 */
export function getTopicColumns(boardId: string, options?: TopicColumnOptions): ColumnDef<Topic>[] {
  const previewMode = options?.previewMode ?? false;
  const cols: ColumnDef<Topic>[] = [
    {
      key: 'title',
      header: '제목',
      render: (row) =>
        previewMode ? (
          <span className="text-blue-400 hover:underline line-clamp-1 cursor-pointer">
            {row.title}
          </span>
        ) : (
          <Link
            href={`/boards/${boardId}/topics/${row.id}`}
            className="text-blue-400 hover:underline line-clamp-1"
          >
            {row.title}
          </Link>
        ),
    },
    { key: 'status', header: '상태' },
    { key: 'viewCount', header: '조회', render: (row) => row.viewCount ?? 0 },
    { key: 'isNotice', header: '공지', render: (row) => (row.isNotice ? 'Y' : 'N') },
    {
      key: 'createdAt',
      header: '작성일',
      render: (row) => (row.createdAt ? String(row.createdAt).slice(0, 10) : '-'),
    },
  ];
  if (options?.onDetailView) {
    cols.push(
      createActionColumn<Topic>({
        onDetailView: options.onDetailView,
      })
    );
  }
  return cols;
}
