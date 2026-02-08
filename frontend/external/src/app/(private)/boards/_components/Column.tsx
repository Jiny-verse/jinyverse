'use client';

import type { ColumnDef } from 'common/components';
import type { Board } from 'common/types';
import Link from 'next/link';

export interface BoardColumnOptions {
  /** true: 이름을 Link 대신 span (행 클릭 → 미리보기). false: 이름 Link → 게시글 목록 직접 이동 */
  previewMode?: boolean;
}

/** 게시판 목록 컬럼 */
export function getBoardColumns(
  boardIdPrefix: string,
  options?: BoardColumnOptions
): ColumnDef<Board>[] {
  const previewMode = options?.previewMode ?? false;
  return [
    {
      key: 'name',
      header: '이름',
      render: (row) =>
        previewMode ? (
          <span className="text-blue-400 hover:underline cursor-pointer">{row.name}</span>
        ) : (
          <Link
            href={`${boardIdPrefix}/${row.id}/topics`}
            className="text-blue-400 hover:underline"
          >
            {row.name}
          </Link>
        ),
    },
    { key: 'type', header: '타입' },
    {
      key: 'description',
      header: '설명',
      render: (row) =>
        row.description
          ? String(row.description).slice(0, 60) + (String(row.description).length > 60 ? '…' : '')
          : '-',
    },
    { key: 'isPublic', header: '공개', render: (row) => (row.isPublic ? 'Y' : 'N') },
  ];
}
