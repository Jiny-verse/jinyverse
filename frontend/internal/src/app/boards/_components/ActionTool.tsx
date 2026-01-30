'use client';

import { ActionTool as CommonActionTool } from 'common/components';
import { Button } from 'common/ui';

interface BoardActionToolProps {
  selectedCount: number;
  onBatchDelete?: () => void;
}

/** 게시판 테이블 일괄 액션 (선택 시 노출) */
export function BoardActionTool({ selectedCount, onBatchDelete }: BoardActionToolProps) {
  return <CommonActionTool selectedCount={selectedCount} onBatchDelete={onBatchDelete} />;
}

interface BoardToolbarActionProps {
  onAdd: () => void;
}

/** 게시판 테이블 상단 고정 액션 (추가 버튼) */
export function BoardToolbarAction({ onAdd }: BoardToolbarActionProps) {
  return (
    <Button size="sm" onClick={onAdd}>
      게시판 추가
    </Button>
  );
}
