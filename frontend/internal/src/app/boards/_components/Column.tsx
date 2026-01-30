'use client';

import { ReactNode } from 'react';
import { TableActionButtons } from 'common/components';
import type { ColumnDef } from 'common/components';
import type { Board } from 'common/types';
import Link from 'next/link';

const BOARD_LABELS: Record<string, string> = {
  id: 'ID',
  menuCode: '메뉴 코드',
  typeCategoryCode: '타입 분류',
  type: '타입',
  name: '이름',
  description: '설명',
  note: '비고',
  isPublic: '공개',
  order: '순서',
  createdAt: '생성일',
  updatedAt: '수정일',
};

/**
 * 게시판 목록 컬럼 정의 (데이터 키 기준 + 라벨)
 */
export function getBoardColumns(
  boardIdPrefix: string,
  options?: { onDetailView?: (row: Board) => void; onEdit?: (row: Board) => void; onDelete?: (id: string) => void; previewMode?: boolean }
): ColumnDef<Board>[] {
  const previewMode = options?.previewMode ?? false;
  const cols: ColumnDef<Board>[] = [
    {
      key: 'name',
      header: BOARD_LABELS.name,
      render: (row) =>
        previewMode ? (
          <span className="text-blue-600 hover:underline cursor-pointer">{row.name}</span>
        ) : (
          <Link href={`${boardIdPrefix}/${row.id}/topics`} className="text-blue-600 hover:underline">{row.name}</Link>
        ),
    },
    { key: 'typeCategoryCode', header: BOARD_LABELS.typeCategoryCode },
    { key: 'type', header: BOARD_LABELS.type },
    { key: 'description', header: BOARD_LABELS.description, render: (row) => (row.description ? String(row.description).slice(0, 50) + (String(row.description).length > 50 ? '…' : '') : '-') },
    { key: 'isPublic', header: BOARD_LABELS.isPublic, render: (row) => (row.isPublic ? 'Y' : 'N') },
    { key: 'order', header: BOARD_LABELS.order },
  ];
  if (options?.onDetailView || options?.onEdit || options?.onDelete) {
    cols.push({
      key: '_actions',
      header: '작업',
      render: (row): ReactNode => (
        <TableActionButtons<Board>
          row={row}
          onDetailView={options.onDetailView}
          onEdit={options.onEdit}
          onDelete={options.onDelete}
        />
      ),
    });
  }
  return cols;
}
