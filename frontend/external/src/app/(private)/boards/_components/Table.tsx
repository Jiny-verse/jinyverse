'use client';

import { Table as CommonTable } from 'common/components';
import type { Board } from 'common/types';
import { getBoardColumns } from './Column';
import { useLanguage } from 'common/utils';

export interface BoardTableProps {
  data: Board[];
  isLoading?: boolean;
  pagination?: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onSizeChange?: (size: number) => void;
  };
  /** 행 클릭 시 (미리보기용 setState 또는 router.push 등 부모가 결정) */
  onRowClick?: (row: Board) => void;
  /** 선택된 행 ID (미리보기 열림 시 하이라이트) */
  selectedRowId?: string | null;
}

/** 게시판 목록 테이블 */
export function BoardTable({
  data,
  isLoading,
  pagination,
  onRowClick,
  selectedRowId,
}: BoardTableProps) {
  const { t } = useLanguage();
  const columns = getBoardColumns('/boards', { previewMode: !!onRowClick }, t);
  return (
    <CommonTable<Board>
      data={data}
      columns={columns}
      isLoading={isLoading}
      emptyMessage={t('common.noData')}
      pagination={
        pagination
          ? { ...pagination, sizeOptions: [10, 20, 50], onSizeChange: pagination.onSizeChange }
          : undefined
      }
      onRowClick={onRowClick}
      selectedRowId={selectedRowId}
    />
  );
}
