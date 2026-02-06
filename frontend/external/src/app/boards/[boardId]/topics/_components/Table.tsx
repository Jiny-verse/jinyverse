'use client';

import { Table as CommonTable } from 'common/components';
import type { Topic } from 'common/types';
import { getTopicColumns } from './Column';

export interface TopicTableProps {
  boardId: string;
  data: Topic[];
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
  onRowClick?: (row: Topic) => void;
  /** 선택된 행 ID (미리보기 열림 시 하이라이트) */
  selectedRowId?: string | null;
}

/** 게시글 목록 테이블 */
export function TopicTable({
  boardId,
  data,
  isLoading,
  pagination,
  onRowClick,
  selectedRowId,
}: TopicTableProps) {
  const columns = getTopicColumns(boardId, {
    previewMode: !!onRowClick,
    onDetailView: onRowClick ?? undefined,
  });
  return (
    <CommonTable<Topic>
      data={data}
      columns={columns}
      isLoading={isLoading}
      emptyMessage="등록된 게시글이 없습니다."
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
