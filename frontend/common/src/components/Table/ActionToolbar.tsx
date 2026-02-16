'use client';

import { ReactNode } from 'react';
import { Button } from '../../ui';

export interface ActionToolbarProps {
  /** 선택된 개수 */
  selectedCount: number;
  /** 일괄 삭제 버튼 (클릭 시 onBatchDelete 호출) */
  onBatchDelete?: () => void;
  /** 추가 버튼 등 커스텀 액션 */
  children?: ReactNode;
}

/**
 * 테이블 상단 액션 툴바 (선택 시 노출)
 * 일괄삭제, 커스텀 버튼
 */
export function ActionToolbar({ selectedCount, onBatchDelete, children }: ActionToolbarProps) {
  if (selectedCount === 0) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">{selectedCount}개 선택</span>
      {onBatchDelete && (
        <Button type="button" variant="danger" size="sm" onClick={onBatchDelete}>
          일괄 삭제
        </Button>
      )}
      {children}
    </div>
  );
}
